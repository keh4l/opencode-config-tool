// src/components/config/omo/OmoExperimentalPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FlaskConical } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoExperimentalPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="实验性功能"
      description="启用或禁用实验性功能"
      icon={FlaskConical}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>激进截断</Label>
            <p className="text-xs text-muted-foreground">启用更激进的上下文截断策略</p>
          </div>
          <Switch
            checked={config.experimental?.aggressive_truncation ?? false}
            onCheckedChange={(checked) => updateConfig({
              experimental: { ...config.experimental, aggressive_truncation: checked }
            })}
          />
        </div>
      </div>
    </ConfigCard>
  );
}
