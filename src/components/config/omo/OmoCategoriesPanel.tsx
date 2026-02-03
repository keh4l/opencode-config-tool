// src/components/config/omo/OmoCategoriesPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layers } from 'lucide-react';
import { KNOWN_CATEGORIES, CATEGORY_VARIANTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoCategoriesPanel() {
  const { config, updateCategory } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="Categories 分类模型"
      description="按任务类型配置模型变体"
      icon={Layers}
      badge={Object.keys(config.categories || {}).length > 0 ? (
        <Badge variant="secondary">
          {Object.keys(config.categories || {}).length} 个配置
        </Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        {KNOWN_CATEGORIES.map((categoryId) => {
          const categoryConfig = config.categories?.[categoryId];
          return (
            <div key={categoryId} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label className="font-medium">{categoryId}</Label>
                <Input
                  className="mt-1"
                  placeholder="模型 ID"
                  value={categoryConfig?.model || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateCategory(categoryId, { ...categoryConfig, model: e.target.value });
                    } else {
                      updateCategory(categoryId, null);
                    }
                  }}
                />
              </div>
              <div className="w-32">
                <Label className="text-xs">变体</Label>
                <Select
                  value={categoryConfig?.variant || '_default'}
                  onValueChange={(value) => {
                    if (categoryConfig?.model) {
                      updateCategory(categoryId, {
                        ...categoryConfig,
                        variant: value === '_default' ? undefined : value as any
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_default">默认</SelectItem>
                    {CATEGORY_VARIANTS.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );
}
