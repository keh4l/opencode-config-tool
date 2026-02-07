import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SettingRow } from '@/components/layout/SettingRow';
import { Code2, Plus, X, ChevronDown, Settings2 } from 'lucide-react';
import { useState } from 'react';
import type { LspServerConfig } from '@/types/config';
import { useConfigStore } from '@/hooks/useConfig';

const BUILTIN_LSP_SERVERS = [
  { id: 'typescript', name: 'TypeScript/JavaScript', extensions: ['.ts', '.tsx', '.js', '.jsx'] },
  { id: 'python', name: 'Python', extensions: ['.py'] },
  { id: 'go', name: 'Go', extensions: ['.go'] },
  { id: 'rust', name: 'Rust', extensions: ['.rs'] },
  { id: 'java', name: 'Java', extensions: ['.java'] },
  { id: 'csharp', name: 'C#', extensions: ['.cs'] },
];

export function LspConfigPanel() {
  const { config, updateConfig } = useConfigStore();
  const [newServerId, setNewServerId] = useState('');
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());
  
  // 如果 lsp 是 false，表示完全禁用
  const lspDisabled = config.lsp === false;
  const lspConfig = typeof config.lsp === 'object' ? config.lsp : {};

  const toggleLsp = (enabled: boolean) => {
    if (enabled) {
      updateConfig({ lsp: {} });
    } else {
      updateConfig({ lsp: false });
    }
  };

  const updateLspServer = (serverId: string, serverConfig: LspServerConfig | { disabled: true } | undefined) => {
    if (lspDisabled) return;
    
    const newLsp = { ...lspConfig };
    if (serverConfig === undefined) {
      delete newLsp[serverId];
    } else {
      newLsp[serverId] = serverConfig;
    }
    updateConfig({ lsp: Object.keys(newLsp).length > 0 ? newLsp : undefined });
  };

  const toggleServerExpand = (serverId: string) => {
    const newExpanded = new Set(expandedServers);
    if (newExpanded.has(serverId)) {
      newExpanded.delete(serverId);
    } else {
      newExpanded.add(serverId);
    }
    setExpandedServers(newExpanded);
  };

  const addCustomServer = () => {
    if (newServerId.trim() && !lspConfig[newServerId]) {
      updateLspServer(newServerId.trim(), {
        command: [],
        extensions: [],
      });
      setNewServerId('');
      setExpandedServers(new Set([...expandedServers, newServerId.trim()]));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          LSP 语言服务器
        </CardTitle>
        <CardDescription>
          配置各编程语言的 Language Server Protocol 服务器
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 全局开关 */}
        <SettingRow
          label="启用 LSP 支持"
          description="禁用将关闭所有语言服务器功能"
        >
          <Switch
            checked={!lspDisabled}
            onCheckedChange={toggleLsp}
          />
        </SettingRow>

        {!lspDisabled && (
          <>
            {/* 内置服务器 */}
            <div className="space-y-3">
              <Label>内置语言服务器</Label>
              <div className="space-y-2">
                {BUILTIN_LSP_SERVERS.map((server) => {
                  const serverConfig = lspConfig[server.id];
                  const isDisabled = serverConfig && 'disabled' in serverConfig && serverConfig.disabled;
                  
                  return (
                    <div key={server.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.extensions.join(', ')}
                        </p>
                      </div>
                      <Switch
                        checked={!isDisabled}
                        onCheckedChange={(enabled) => {
                          if (enabled) {
                            updateLspServer(server.id, undefined);
                          } else {
                            updateLspServer(server.id, { disabled: true });
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 自定义服务器 */}
            <div className="space-y-3">
              <Label>自定义语言服务器</Label>
              
              <div className="flex gap-2">
                <Input
                  value={newServerId}
                  onChange={(e) => setNewServerId(e.target.value)}
              placeholder="服务器 ID（如 vue）"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomServer()}
                />
                <Button onClick={addCustomServer} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Object.entries(lspConfig)
                .filter(([id]) => !BUILTIN_LSP_SERVERS.some(s => s.id === id))
                .map(([serverId, serverConfig]) => {
                  if ('disabled' in serverConfig) return null;
                  const isExpanded = expandedServers.has(serverId);
                  
                  return (
                    <Collapsible key={serverId} open={isExpanded} onOpenChange={() => toggleServerExpand(serverId)}>
                      <div className="border rounded-lg">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
                          <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            <span className="font-medium">{serverId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLspServer(serverId, undefined);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-3 pt-0 space-y-3">
                          <div className="space-y-2">
                            <Label>命令</Label>
                            <Input
                              value={(serverConfig as LspServerConfig).command?.join(' ') || ''}
                              onChange={(e) => updateLspServer(serverId, {
                                ...serverConfig as LspServerConfig,
                                command: e.target.value.split(' ').filter(Boolean),
                              })}
              placeholder="例如：vue-language-server --stdio"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>文件扩展名</Label>
                            <Input
                              value={(serverConfig as LspServerConfig).extensions?.join(', ') || ''}
                              onChange={(e) => updateLspServer(serverId, {
                                ...serverConfig as LspServerConfig,
                                extensions: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                              })}
                              placeholder=".vue, .ts"
                            />
                          </div>
                          <div className="space-y-2">
            <Label>初始化参数（JSON）</Label>
                            <Textarea
                              value={(serverConfig as LspServerConfig).initialization ? JSON.stringify((serverConfig as LspServerConfig).initialization, null, 2) : ''}
                              onChange={(e) => {
                                try {
                                  const init = e.target.value ? JSON.parse(e.target.value) : undefined;
                                  updateLspServer(serverId, {
                                    ...serverConfig as LspServerConfig,
                                    initialization: init,
                                  });
                                } catch {
                                  // Invalid JSON, ignore
                                }
                              }}
                              placeholder='{"rootPatterns": [".git"]}'
                              rows={3}
                              className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                              传递给 LSP 服务器的初始化参数
                            </p>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
