// src/components/config/omo/OmoDisabledPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Ban } from 'lucide-react';
import { KNOWN_HOOKS, KNOWN_MCPS, KNOWN_DISABLED_AGENTS, KNOWN_SKILLS, KNOWN_COMMANDS } from '@/lib/oh-my-opencode-defaults';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoDisabledPanel() {
  const { config, toggleDisabledHook, toggleDisabledAgent, toggleDisabledMcp, toggleDisabledSkill, toggleDisabledCommand } = useOhMyOpenCodeStore();

  const totalDisabled = (config.disabled_hooks?.length || 0) +
    (config.disabled_agents?.length || 0) +
    (config.disabled_mcps?.length || 0) +
    (config.disabled_skills?.length || 0) +
    (config.disabled_commands?.length || 0);

  return (
    <ConfigCard
      title="禁用功能"
      description="管理禁用的钩子、智能体、MCP 和技能"
      icon={Ban}
      badge={totalDisabled > 0 ? (
        <Badge variant="secondary">{totalDisabled} 个禁用</Badge>
      ) : undefined}
    >
      <div className="space-y-6">
        {/* Hooks */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的钩子（Hooks）</Label>
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
          <Label className="mb-2 block text-base font-semibold">禁用的智能体（Agents）</Label>
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
          <Label className="mb-2 block text-base font-semibold">禁用的 MCP（MCPs）</Label>
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

        {/* Skills */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的技能（Skills）</Label>
          <p className="text-xs text-muted-foreground mb-2">禁用后，该技能将不会被代理加载</p>
          <div className="space-y-2">
            {KNOWN_SKILLS.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">{skill.name}</span>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </div>
                <Switch
                  checked={config.disabled_skills?.includes(skill.id) ?? false}
                  onCheckedChange={() => toggleDisabledSkill(skill.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Commands */}
        <div>
          <Label className="mb-2 block text-base font-semibold">禁用的命令（Commands）</Label>
          <p className="text-xs text-muted-foreground mb-2">禁用后，该命令将不可用</p>
          <div className="space-y-2">
            {KNOWN_COMMANDS.map((command) => (
              <div key={command.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div>
                  <span className="font-medium">{command.name}</span>
                  <p className="text-xs text-muted-foreground">{command.description}</p>
                </div>
                <Switch
                  checked={config.disabled_commands?.includes(command.id) ?? false}
                  onCheckedChange={() => toggleDisabledCommand(command.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConfigCard>
  );
}
