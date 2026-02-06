// src/components/config/omo/OmoSisyphusPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoSisyphusPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="西西弗斯代理"
      description="持久化任务执行代理配置"
      icon={Bot}
      badge={config.sisyphus_agent?.disabled === false ? (
        <Badge variant="default">启用</Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>启用西西弗斯</Label>
            <p className="text-xs text-muted-foreground">持久化任务执行代理</p>
          </div>
          <Switch
            checked={config.sisyphus_agent?.disabled === false}
            onCheckedChange={(checked) => updateConfig({
              sisyphus_agent: { ...config.sisyphus_agent, disabled: !checked }
            })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>启用规划器</Label>
            <p className="text-xs text-muted-foreground">使用规划器进行任务分解</p>
          </div>
          <Switch
            checked={config.sisyphus_agent?.planner_enabled ?? false}
            onCheckedChange={(checked) => updateConfig({
              sisyphus_agent: { ...config.sisyphus_agent, planner_enabled: checked }
            })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>默认构建器</Label>
            <p className="text-xs text-muted-foreground">启用默认构建代理</p>
          </div>
          <Switch
            checked={config.sisyphus_agent?.default_builder_enabled ?? false}
            onCheckedChange={(checked) => updateConfig({
              sisyphus_agent: { ...config.sisyphus_agent, default_builder_enabled: checked }
            })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>替换规划</Label>
            <p className="text-xs text-muted-foreground">允许替换现有规划</p>
          </div>
          <Switch
            checked={config.sisyphus_agent?.replace_plan ?? false}
            onCheckedChange={(checked) => updateConfig({
              sisyphus_agent: { ...config.sisyphus_agent, replace_plan: checked }
            })}
          />
        </div>
      </div>
    </ConfigCard>
  );
}
