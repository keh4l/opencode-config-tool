// src/components/config/omo/OmoClaudeCodePanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2 } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoClaudeCodePanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();

  const features = [
    { key: 'mcp', label: 'MCP', description: '启用 MCP 服务器支持' },
    { key: 'commands', label: 'Commands', description: '启用命令功能' },
    { key: 'skills', label: 'Skills', description: '启用技能功能' },
    { key: 'agents', label: 'Agents', description: '启用代理功能' },
    { key: 'hooks', label: 'Hooks', description: '启用钩子功能' },
    { key: 'plugins', label: 'Plugins', description: '启用插件功能' },
  ] as const;

  return (
    <ConfigCard
      title="Claude Code 兼容性"
      description="配置 Claude Code 功能开关"
      icon={Settings2}
    >
      <div className="space-y-4">
        {features.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <Label>{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={config.claude_code?.[key] ?? true}
              onCheckedChange={(checked) => updateConfig({
                claude_code: { ...config.claude_code, [key]: checked }
              })}
            />
          </div>
        ))}
      </div>
    </ConfigCard>
  );
}
