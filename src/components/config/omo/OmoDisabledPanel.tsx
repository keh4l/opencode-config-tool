// src/components/config/omo/OmoDisabledPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Ban } from 'lucide-react';
import { KNOWN_HOOKS, KNOWN_MCPS, KNOWN_DISABLED_AGENTS } from '@/lib/oh-my-opencode-defaults';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoDisabledPanel() {
  const { config, toggleDisabledHook, toggleDisabledAgent, toggleDisabledMcp } = useOhMyOpenCodeStore();

  const totalDisabled = (config.disabled_hooks?.length || 0) +
    (config.disabled_agents?.length || 0) +
    (config.disabled_mcps?.length || 0);

  return (
    <ConfigCard
      title="禁用功能"
      description="管理禁用的 Hooks、Agents 和 MCPs"
      icon={Ban}
      badge={totalDisabled > 0 ? (
        <Badge variant="secondary">{totalDisabled} 个禁用</Badge>
      ) : undefined}
    >
      <div className="space-y-6">
        {/* Hooks */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的 Hooks</Label>
          <div className="space-y-2">
            {KNOWN_HOOKS.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">{hook.name}</span>
                  <p className="text-xs text-muted-foreground">{hook.description}</p>
                </div>
                <Switch
                  checked={config.disabled_hooks?.includes(hook.id) ?? false}
                  onCheckedChange={() => toggleDisabledHook(hook.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的 Agents</Label>
          <div className="space-y-2">
            {KNOWN_DISABLED_AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">{agent.name}</span>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
                <Switch
                  checked={config.disabled_agents?.includes(agent.id) ?? false}
                  onCheckedChange={() => toggleDisabledAgent(agent.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* MCPs */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的 MCPs</Label>
          <div className="space-y-2">
            {KNOWN_MCPS.map((mcp) => (
              <div key={mcp.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">{mcp.name}</span>
                  <p className="text-xs text-muted-foreground">{mcp.description}</p>
                </div>
                <Switch
                  checked={config.disabled_mcps?.includes(mcp.id) ?? false}
                  onCheckedChange={() => toggleDisabledMcp(mcp.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConfigCard>
  );
}
