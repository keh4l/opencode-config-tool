// src/components/config/omo/OmoTmuxPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Terminal } from 'lucide-react';
import { TMUX_LAYOUTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoTmuxPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="Tmux 集成"
      description="在 Tmux 中运行时启用增强功能"
      icon={Terminal}
      badge={config.tmux?.enabled ? (
        <Badge variant="default">启用</Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>启用 Tmux 集成</Label>
            <p className="text-xs text-muted-foreground">在 Tmux 中运行时启用增强功能</p>
          </div>
          <Switch
            checked={config.tmux?.enabled ?? false}
            onCheckedChange={(checked) => updateConfig({
              tmux: { ...config.tmux, enabled: checked }
            })}
          />
        </div>
        {config.tmux?.enabled && (
          <>
            <div>
              <Label>布局</Label>
              <Select
                value={config.tmux?.layout || 'main-vertical'}
                onValueChange={(value) => updateConfig({
                  tmux: { ...config.tmux, layout: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TMUX_LAYOUTS.map((layout) => (
                    <SelectItem key={layout} value={layout}>{layout}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>主面板大小 (%)</Label>
              <Input
                type="number"
                min="20"
                max="80"
                value={config.tmux?.main_pane_size ?? 60}
                onChange={(e) => updateConfig({
                  tmux: { ...config.tmux, main_pane_size: parseInt(e.target.value) || 60 }
                })}
              />
            </div>
          </>
        )}
      </div>
    </ConfigCard>
  );
}
