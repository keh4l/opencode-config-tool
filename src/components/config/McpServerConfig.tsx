// src/components/config/McpServerConfig.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plug, Plus, Trash2, Edit, Terminal, Settings, Globe, Laptop } from 'lucide-react';
import type { McpConfig, McpLocalConfig, McpRemoteConfig, McpOAuthConfig } from '@/types/config';

// 预设 MCP 服务器
const MCP_PRESETS = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: '文件系统访问',
    config: {
      type: 'local' as const,
      command: ['npx', '-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed'],
      enabled: true,
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub API 访问',
    config: {
      type: 'local' as const,
      command: ['npx', '-y', '@modelcontextprotocol/server-github'],
      environment: { GITHUB_TOKEN: '${GITHUB_TOKEN}' },
      enabled: true,
    },
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: '数据库访问',
    config: {
      type: 'local' as const,
      command: ['npx', '-y', '@modelcontextprotocol/server-postgres'],
      environment: { POSTGRES_URL: '${POSTGRES_URL}' },
      enabled: true,
    },
  },
  {
    id: 'memory',
    name: 'Memory',
    description: '持久化记忆',
    config: {
      type: 'local' as const,
      command: ['npx', '-y', '@modelcontextprotocol/server-memory'],
      enabled: true,
    },
  },
];

interface McpFormData {
  id: string;
  type: 'local' | 'remote';
  enabled: boolean;
  timeout?: number;
  
  // Local 类型字段
  command: string[];
  environment: Record<string, string>;
  
  // Remote 类型字段
  url: string;
  headers: Record<string, string>;
  oauthEnabled: boolean;
  oauth: {
    clientId: string;
    clientSecret: string;
    scope: string;
  };
}

const emptyLocalMcp: McpFormData = {
  id: '',
  type: 'local',
  enabled: true,
  command: ['npx'],
  environment: {},
  url: '',
  headers: {},
  oauthEnabled: false,
  oauth: { clientId: '', clientSecret: '', scope: '' },
};

const emptyRemoteMcp: McpFormData = {
  id: '',
  type: 'remote',
  enabled: true,
  url: '',
  headers: {},
  oauthEnabled: false,
  oauth: { clientId: '', clientSecret: '', scope: '' },
  command: [],
  environment: {},
};

export function McpServerConfig() {
  const { config, addMcpServer, updateMcpServer, removeMcpServer } = useConfigStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMcp, setEditingMcp] = useState<McpFormData | null>(null);
  const [newArg, setNewArg] = useState('');
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  const mcpServers = config.mcp || {};

  const handleAddMcp = (type: 'local' | 'remote' = 'local') => {
    setEditingMcp(type === 'local' ? { ...emptyLocalMcp } : { ...emptyRemoteMcp });
    setIsDialogOpen(true);
  };

  const handleEditMcp = (id: string) => {
    const mcp = mcpServers[id];
    if (!mcp) return;

    if (mcp.type === 'local') {
      setEditingMcp({
        id,
        type: 'local',
        enabled: mcp.enabled !== undefined ? mcp.enabled : true,
        timeout: mcp.timeout,
        command: mcp.command || [],
        environment: mcp.environment || {},
        url: '',
        headers: {},
        oauthEnabled: false,
        oauth: { clientId: '', clientSecret: '', scope: '' },
      });
    } else {
      const hasOAuth = mcp.oauth !== undefined && mcp.oauth !== false && typeof mcp.oauth === 'object';
      const oauthConfig = hasOAuth ? mcp.oauth as McpOAuthConfig : { clientId: '', clientSecret: '', scope: '' };
      setEditingMcp({
        id,
        type: 'remote',
        enabled: mcp.enabled !== undefined ? mcp.enabled : true,
        timeout: mcp.timeout,
        url: mcp.url || '',
        headers: mcp.headers || {},
        oauthEnabled: hasOAuth,
        oauth: hasOAuth ? {
          clientId: oauthConfig.clientId || '',
          clientSecret: oauthConfig.clientSecret || '',
          scope: oauthConfig.scope || '',
        } : { clientId: '', clientSecret: '', scope: '' },
        command: [],
        environment: {},
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveMcp = () => {
    if (!editingMcp || !editingMcp.id) return;

    let mcpConfig: McpConfig;

    if (editingMcp.type === 'local') {
      mcpConfig = {
        type: 'local',
        command: editingMcp.command,
        enabled: editingMcp.enabled,
      } as McpLocalConfig;

      if (Object.keys(editingMcp.environment).length > 0) {
        mcpConfig.environment = editingMcp.environment;
      }
      if (editingMcp.timeout) {
        mcpConfig.timeout = editingMcp.timeout;
      }
    } else {
      mcpConfig = {
        type: 'remote',
        url: editingMcp.url,
        enabled: editingMcp.enabled,
      } as McpRemoteConfig;

      if (Object.keys(editingMcp.headers).length > 0) {
        mcpConfig.headers = editingMcp.headers;
      }
      
      if (editingMcp.oauthEnabled) {
        const oauth: McpOAuthConfig = {};
        if (editingMcp.oauth.clientId) oauth.clientId = editingMcp.oauth.clientId;
        if (editingMcp.oauth.clientSecret) oauth.clientSecret = editingMcp.oauth.clientSecret;
        if (editingMcp.oauth.scope) oauth.scope = editingMcp.oauth.scope;
        if (Object.keys(oauth).length > 0) {
          mcpConfig.oauth = oauth;
        }
      } else {
        mcpConfig.oauth = false;
      }
      
      if (editingMcp.timeout) {
        mcpConfig.timeout = editingMcp.timeout;
      }
    }

    if (mcpServers[editingMcp.id]) {
      updateMcpServer(editingMcp.id, mcpConfig);
    } else {
      addMcpServer(editingMcp.id, mcpConfig);
    }

    setIsDialogOpen(false);
    setEditingMcp(null);
  };

  const handleAddArg = () => {
    if (!editingMcp || !newArg) return;
    setEditingMcp({ ...editingMcp, command: [...editingMcp.command, newArg] });
    setNewArg('');
  };

  const handleRemoveArg = (index: number) => {
    if (!editingMcp) return;
    setEditingMcp({ ...editingMcp, command: editingMcp.command.filter((_, i) => i !== index) });
  };

  const handleAddEnv = () => {
    if (!editingMcp || !newEnvKey) return;
    setEditingMcp({ ...editingMcp, environment: { ...editingMcp.environment, [newEnvKey]: newEnvValue } });
    setNewEnvKey('');
    setNewEnvValue('');
  };

  const handleRemoveEnv = (key: string) => {
    if (!editingMcp) return;
    const { [key]: _, ...rest } = editingMcp.environment;
    setEditingMcp({ ...editingMcp, environment: rest });
  };

  const handleAddHeader = () => {
    if (!editingMcp || !newHeaderKey) return;
    setEditingMcp({ ...editingMcp, headers: { ...editingMcp.headers, [newHeaderKey]: newHeaderValue } });
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveHeader = (key: string) => {
    if (!editingMcp) return;
    const { [key]: _, ...rest } = editingMcp.headers;
    setEditingMcp({ ...editingMcp, headers: rest });
  };

  const handleApplyPreset = (preset: typeof MCP_PRESETS[0]) => {
    addMcpServer(preset.id, preset.config);
  };

  const getMcpTypeIcon = (mcp: McpConfig) => {
    return mcp.type === 'remote' ? Globe : Laptop;
  };

  const getMcpTypeLabel = (mcp: McpConfig) => {
    return mcp.type === 'remote' ? 'Remote' : 'Local';
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="MCP 服务器配置"
        description="配置 Model Context Protocol 服务器连接（支持本地和远程）"
        icon={Plug}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAddMcp('local')}>
              <Laptop className="h-4 w-4 mr-2" />
              添加本地服务器
            </Button>
            <Button size="sm" onClick={() => handleAddMcp('remote')}>
              <Globe className="h-4 w-4 mr-2" />
              添加远程服务器
            </Button>
          </div>
        }
      >
        {Object.keys(mcpServers).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无配置的 MCP 服务器
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(mcpServers).map(([id, mcp]) => {
              const TypeIcon = getMcpTypeIcon(mcp);
              return (
                <div
                  key={id}
                  className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-foreground">{id}</span>
                      <span className="text-xs px-2 py-0.5 bg-secondary rounded">
                        {getMcpTypeLabel(mcp)}
                      </span>
                      {mcp.enabled === false && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">
                          已禁用
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      {mcp.type === 'local' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Terminal className="h-3 w-3 text-muted-foreground" />
                            <code className="text-secondary-foreground">
                              {mcp.command?.join(' ')}
                            </code>
                          </div>
                          {mcp.environment && Object.keys(mcp.environment).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(mcp.environment).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="px-2 py-0.5 bg-secondary rounded text-xs"
                                >
                                  {key}={value}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <code className="text-secondary-foreground">{mcp.url}</code>
                          </div>
                          {mcp.oauth && typeof mcp.oauth === 'object' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              🔐 OAuth 已配置
                            </div>
                          )}
                          {mcp.headers && Object.keys(mcp.headers).length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              📋 {Object.keys(mcp.headers).length} 个自定义 Header
                            </div>
                          )}
                        </>
                      )}
                      {mcp.timeout && (
                        <div className="text-xs text-muted-foreground">
                          ⏱️ 超时: {mcp.timeout}ms
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEditMcp(id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => removeMcpServer(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ConfigCard>

      {/* 预设 MCP 服务器 */}
      <ConfigCard title="快速添加预设服务器" icon={Settings}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MCP_PRESETS.filter(p => !mcpServers[p.id]).map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              className="h-auto py-3 flex flex-col items-start"
              onClick={() => handleApplyPreset(preset)}
            >
              <span className="font-medium text-foreground">{preset.name}</span>
              <span className="text-xs text-muted-foreground">{preset.description}</span>
            </Button>
          ))}
        </div>
      </ConfigCard>

      {/* 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMcp?.id && mcpServers[editingMcp.id] ? `编辑: ${editingMcp.id}` : '添加 MCP 服务器'}
            </DialogTitle>
            <DialogDescription>
              配置 MCP 服务器连接参数
            </DialogDescription>
          </DialogHeader>

          {editingMcp && (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>服务器 ID *</Label>
                  <Input
                    value={editingMcp.id}
                    onChange={(e) => setEditingMcp({ ...editingMcp, id: e.target.value })}
                    placeholder="my-server"
                    disabled={!!mcpServers[editingMcp.id]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>类型</Label>
                  <div className="flex items-center gap-4 h-10">
                    <span className="text-sm font-medium">
                      {editingMcp.type === 'local' ? '本地服务器' : '远程服务器'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 通用设置 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>启用服务器</Label>
                  <Switch
                    checked={editingMcp.enabled}
                    onCheckedChange={(checked) => setEditingMcp({ ...editingMcp, enabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>超时时间 (ms)</Label>
                  <Input
                    type="number"
                    value={editingMcp.timeout || ''}
                    onChange={(e) => setEditingMcp({ ...editingMcp, timeout: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="5000"
                  />
                </div>
              </div>

              {/* 类型特定配置 */}
              <Tabs value={editingMcp.type} onValueChange={(value) => setEditingMcp({ ...editingMcp, type: value as 'local' | 'remote' })}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="local">
                    <Laptop className="h-4 w-4 mr-2" />
                    本地配置
                  </TabsTrigger>
                  <TabsTrigger value="remote">
                    <Globe className="h-4 w-4 mr-2" />
                    远程配置
                  </TabsTrigger>
                </TabsList>

                {/* Local 配置 */}
                <TabsContent value="local" className="space-y-4 mt-4">
                  {/* 命令参数 */}
                  <div className="space-y-3">
                    <Label>命令参数 *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newArg}
                        onChange={(e) => setNewArg(e.target.value)}
                        placeholder="例如: npx, -y, @modelcontextprotocol/server-xxx"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddArg()}
                      />
                      <Button onClick={handleAddArg} disabled={!newArg}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editingMcp.command.map((arg, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                        >
                          <code>{arg}</code>
                          <button
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveArg(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      提示: 第一个参数通常是可执行文件（如 npx, node），后续为参数
                    </p>
                  </div>

                  {/* 环境变量 */}
                  <div className="space-y-3">
                    <Label>环境变量</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newEnvKey}
                        onChange={(e) => setNewEnvKey(e.target.value)}
                        placeholder="KEY"
                        className="w-32"
                      />
                      <Input
                        value={newEnvValue}
                        onChange={(e) => setNewEnvValue(e.target.value)}
                        placeholder="value 或 ${ENV_VAR}"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddEnv()}
                      />
                      <Button onClick={handleAddEnv} disabled={!newEnvKey}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(editingMcp.environment).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <code className="text-sm">{key}={value}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleRemoveEnv(key)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Remote 配置 */}
                <TabsContent value="remote" className="space-y-4 mt-4">
                  {/* URL */}
                  <div className="space-y-2">
                    <Label>服务器 URL *</Label>
                    <Input
                      value={editingMcp.url}
                      onChange={(e) => setEditingMcp({ ...editingMcp, url: e.target.value })}
                      placeholder="https://mcp.example.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      远程 MCP 服务器的完整 URL 地址
                    </p>
                  </div>

                  {/* Headers */}
                  <div className="space-y-3">
                  <Label>自定义请求头</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newHeaderKey}
                        onChange={(e) => setNewHeaderKey(e.target.value)}
                        placeholder="Header 名称"
                        className="w-40"
                      />
                      <Input
                        value={newHeaderValue}
                        onChange={(e) => setNewHeaderValue(e.target.value)}
                        placeholder="Header 值"
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddHeader()}
                      />
                      <Button onClick={handleAddHeader} disabled={!newHeaderKey}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(editingMcp.headers).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <code className="text-sm">{key}: {value}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleRemoveHeader(key)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      例如: Authorization, X-API-Key 等
                    </p>
                  </div>

                  {/* OAuth */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>启用 OAuth 认证</Label>
                      <Switch
                        checked={editingMcp.oauthEnabled}
                        onCheckedChange={(checked) => setEditingMcp({ ...editingMcp, oauthEnabled: checked })}
                      />
                    </div>
                    
                    {editingMcp.oauthEnabled && (
                      <div className="space-y-3 pl-4 border-l-2 border-blue-500/20">
                        <div className="space-y-2">
                          <Label>客户端 ID</Label>
                          <Input
                            value={editingMcp.oauth.clientId}
                            onChange={(e) => setEditingMcp({
                              ...editingMcp,
                              oauth: { ...editingMcp.oauth, clientId: e.target.value }
                            })}
                            placeholder="your-client-id"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>客户端密钥</Label>
                          <Input
                            type="password"
                            value={editingMcp.oauth.clientSecret}
                            onChange={(e) => setEditingMcp({
                              ...editingMcp,
                              oauth: { ...editingMcp.oauth, clientSecret: e.target.value }
                            })}
                            placeholder="your-client-secret"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>授权范围</Label>
                          <Input
                            value={editingMcp.oauth.scope}
                            onChange={(e) => setEditingMcp({
                              ...editingMcp,
                              oauth: { ...editingMcp.oauth, scope: e.target.value }
                            })}
                            placeholder="read write"
                          />
                          <p className="text-xs text-muted-foreground">
                            多个 scope 用空格分隔
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {!editingMcp.oauthEnabled && (
                      <p className="text-xs text-muted-foreground">
                        关闭 OAuth 后将设置为 false，不使用 OAuth 认证
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button 
              onClick={handleSaveMcp} 
              disabled={
                !editingMcp?.id || 
                (editingMcp.type === 'local' && editingMcp.command.length === 0) ||
                (editingMcp.type === 'remote' && !editingMcp.url)
              }
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
