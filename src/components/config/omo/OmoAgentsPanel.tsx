// src/components/config/omo/OmoAgentsPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { KNOWN_AGENTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoAgentsPanel() {
  const { config, updateAgentOverride } = useOhMyOpenCodeStore();

  return (
    <ConfigCard
      title="代理模型覆盖"
      description="为特定代理指定使用的模型和参数"
      icon={Bot}
      badge={Object.keys(config.agents || {}).length > 0 ? (
        <Badge variant="secondary">
          {Object.keys(config.agents || {}).length} 个配置
        </Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        {KNOWN_AGENTS.map((agent) => {
          const override = config.agents?.[agent.id];
          return (
            <div key={agent.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{agent.name}</Label>
                  <span className="text-xs text-muted-foreground font-mono">({agent.id})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                <Input
                  className="mt-2"
                  placeholder="模型 ID (如 anthropic/claude-opus-4-5)"
                  value={override?.model || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateAgentOverride(agent.id, { ...override, model: e.target.value });
                    } else {
                      updateAgentOverride(agent.id, null);
                    }
                  }}
                />
              </div>
              <div className="w-24">
                <Label className="text-xs">温度</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  value={override?.temperature ?? ''}
                  onChange={(e) => {
                    if (override?.model) {
                      updateAgentOverride(agent.id, {
                        ...override,
                        temperature: e.target.value ? parseFloat(e.target.value) : undefined
                      });
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );
}
