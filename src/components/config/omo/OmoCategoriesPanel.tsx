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

// 变体中文名称映射
const VARIANT_LABELS: Record<string, string> = {
  'low': '低配',
  'medium': '中配',
  'high': '高配',
  'xhigh': '超高配',
  'max': '最高配',
};

export function OmoCategoriesPanel() {
  const { config, updateCategory } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="任务分类模型"
      description="按任务类型配置模型变体"
      icon={Layers}
      badge={Object.keys(config.categories || {}).length > 0 ? (
        <Badge variant="secondary">
          {Object.keys(config.categories || {}).length} 个配置
        </Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        {KNOWN_CATEGORIES.map((category) => {
          const categoryConfig = config.categories?.[category.id];
          return (
            <div key={category.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{category.name}</Label>
                  <span className="text-xs text-muted-foreground font-mono">({category.id})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
                <Input
                  className="mt-2"
                  placeholder="模型 ID"
                  value={categoryConfig?.model || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateCategory(category.id, { ...categoryConfig, model: e.target.value });
                    } else {
                      updateCategory(category.id, null);
                    }
                  }}
                />
              </div>
              <div className="w-32">
                <Label className="text-xs">性能变体</Label>
                <Select
                  value={categoryConfig?.variant || '_default'}
                  onValueChange={(value) => {
                    if (categoryConfig?.model) {
                      updateCategory(category.id, {
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
                      <SelectItem key={v} value={v}>{VARIANT_LABELS[v] || v}</SelectItem>
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
