import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bot, Ban, CheckCircle, FolderSearch, Building2, Eye, Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { TOOL_PERMISSIONS } from '@/types/config';

export function MiscConfigPanel() {
  const { config, updateConfig } = useConfigStore();
  const [newDisabledProvider, setNewDisabledProvider] = useState('');
  const [newEnabledProvider, setNewEnabledProvider] = useState('');
  const [newIgnorePattern, setNewIgnorePattern] = useState('');
  const [newSkillPath, setNewSkillPath] = useState('');
  const [commandJson, setCommandJson] = useState('');
  const [commandError, setCommandError] = useState<string | null>(null);
  const [modeJson, setModeJson] = useState('');
  const [modeError, setModeError] = useState<string | null>(null);
  const commandPlaceholder = '{\n  "my-command": {\n    "template": "..."\n  }\n}';
  const modePlaceholder = '{\n  "build": {\n    "model": "..."\n  }\n}';

  useEffect(() => {
    setCommandJson(config.command ? JSON.stringify(config.command, null, 2) : '');
    setCommandError(null);
  }, [config.command]);

  useEffect(() => {
    setModeJson(config.mode ? JSON.stringify(config.mode, null, 2) : '');
    setModeError(null);
  }, [config.mode]);

  // Provider 管理
  const addDisabledProvider = () => {
    if (newDisabledProvider.trim()) {
      const providers = [...(config.disabled_providers || []), newDisabledProvider.trim()];
      updateConfig({ disabled_providers: providers });
      setNewDisabledProvider('');
    }
  };

  const removeDisabledProvider = (index: number) => {
    const providers = (config.disabled_providers || []).filter((_, i) => i !== index);
    updateConfig({ disabled_providers: providers.length > 0 ? providers : undefined });
  };

  const addEnabledProvider = () => {
    if (newEnabledProvider.trim()) {
      const providers = [...(config.enabled_providers || []), newEnabledProvider.trim()];
      updateConfig({ enabled_providers: providers });
      setNewEnabledProvider('');
    }
  };

  const removeEnabledProvider = (index: number) => {
    const providers = (config.enabled_providers || []).filter((_, i) => i !== index);
    updateConfig({ enabled_providers: providers.length > 0 ? providers : undefined });
  };

  // Watcher 管理
  const addIgnorePattern = () => {
    if (newIgnorePattern.trim()) {
      const ignore = [...(config.watcher?.ignore || []), newIgnorePattern.trim()];
      updateConfig({ watcher: { ...config.watcher, ignore } });
      setNewIgnorePattern('');
    }
  };

  const removeIgnorePattern = (index: number) => {
    const ignore = (config.watcher?.ignore || []).filter((_, i) => i !== index);
    updateConfig({ 
      watcher: ignore.length > 0 ? { ...config.watcher, ignore } : undefined 
    });
  };

  // Skills 管理
  const addSkillPath = () => {
    if (newSkillPath.trim()) {
      const paths = [...(config.skills?.paths || []), newSkillPath.trim()];
      updateConfig({ skills: { ...config.skills, paths } });
      setNewSkillPath('');
    }
  };

  const removeSkillPath = (index: number) => {
    const paths = (config.skills?.paths || []).filter((_, i) => i !== index);
    updateConfig({ 
      skills: paths.length > 0 ? { ...config.skills, paths } : undefined 
    });
  };

  return (
    <div className="space-y-6">
      {/* 用户设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            用户设置
          </CardTitle>
          <CardDescription>
            个人偏好和显示设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={config.username || ''}
              onChange={(e) => updateConfig({ username: e.target.value || undefined })}
              placeholder="使用系统用户名"
            />
            <p className="text-xs text-muted-foreground">
              在对话中显示的自定义用户名
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-agent">默认智能体</Label>
            <Select
              value={config.default_agent || 'build'}
              onValueChange={(value) => updateConfig({ default_agent: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择默认智能体" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="build">构建（build）</SelectItem>
                <SelectItem value="plan">规划（plan）</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              启动时使用的默认主智能体
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>快照</Label>
              <p className="text-xs text-muted-foreground">
                启用文件快照功能
              </p>
            </div>
            <Switch
              checked={config.snapshot ?? false}
              onCheckedChange={(checked) => updateConfig({ snapshot: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Provider 过滤 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            提供商过滤
          </CardTitle>
          <CardDescription>
            控制哪些提供商会被加载
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 禁用的 Providers */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              禁用的提供商
            </Label>
            <p className="text-xs text-muted-foreground">
              这些提供商将不会被加载
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newDisabledProvider}
                onChange={(e) => setNewDisabledProvider(e.target.value)}
                placeholder="提供商名称"
                onKeyDown={(e) => e.key === 'Enter' && addDisabledProvider()}
              />
              <Button onClick={addDisabledProvider} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {config.disabled_providers && config.disabled_providers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.disabled_providers.map((provider, index) => (
                  <Badge key={index} variant="destructive" className="gap-1">
                    {provider}
                    <button type="button" className="focus-ring rounded-sm" onClick={() => removeDisabledProvider(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 启用的 Providers (白名单模式) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              仅启用的提供商（白名单）
            </Label>
            <p className="text-xs text-muted-foreground">
              设置后，只有这些提供商会被启用，其他全部忽略
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newEnabledProvider}
                onChange={(e) => setNewEnabledProvider(e.target.value)}
                placeholder="提供商名称"
                onKeyDown={(e) => e.key === 'Enter' && addEnabledProvider()}
              />
              <Button onClick={addEnabledProvider} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {config.enabled_providers && config.enabled_providers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.enabled_providers.map((provider, index) => (
                  <Badge key={index} variant="default" className="gap-1">
                    {provider}
                    <button type="button" className="focus-ring rounded-sm" onClick={() => removeEnabledProvider(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 文件监视 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            文件监视
          </CardTitle>
          <CardDescription>
            配置文件监视器的忽略模式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>忽略模式</Label>
          <p className="text-xs text-muted-foreground">
            匹配这些模式的文件/目录不会被监视
          </p>
          
          <div className="flex gap-2">
            <Input
              value={newIgnorePattern}
              onChange={(e) => setNewIgnorePattern(e.target.value)}
              placeholder="例如: node_modules/**"
              onKeyDown={(e) => e.key === 'Enter' && addIgnorePattern()}
            />
            <Button onClick={addIgnorePattern} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {config.watcher?.ignore && config.watcher.ignore.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.watcher.ignore.map((pattern, index) => (
                <Badge key={index} variant="secondary" className="gap-1 font-mono text-xs">
                  {pattern}
                  <button type="button" className="focus-ring rounded-sm" onClick={() => removeIgnorePattern(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 技能路径 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderSearch className="h-5 w-5" />
            技能路径
          </CardTitle>
          <CardDescription>
            添加额外的技能文件夹路径
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newSkillPath}
              onChange={(e) => setNewSkillPath(e.target.value)}
              placeholder="/path/to/skills"
              onKeyDown={(e) => e.key === 'Enter' && addSkillPath()}
            />
            <Button onClick={addSkillPath} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {config.skills?.paths && config.skills.paths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.skills.paths.map((path, index) => (
                <Badge key={index} variant="secondary" className="gap-1 font-mono text-xs">
                  {path}
                  <button type="button" className="focus-ring rounded-sm" onClick={() => removeSkillPath(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 企业版 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            企业版配置
          </CardTitle>
          <CardDescription>
            企业版部署相关设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="enterprise-url">企业版地址</Label>
          <Input
            id="enterprise-url"
            value={config.enterprise?.url || ''}
            onChange={(e) => updateConfig({ 
              enterprise: e.target.value ? { url: e.target.value } : undefined 
            })}
            placeholder="https://opencode.your-company.com"
          />
        </CardContent>
      </Card>

      {/* 兼容与高级配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderSearch className="h-5 w-5" />
            兼容与高级配置
          </CardTitle>
          <CardDescription>
            包含兼容字段和高级配置项
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>日志级别</Label>
              <Select
                value={config.logLevel || 'INFO'}
                onValueChange={(value: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR') => updateConfig({ logLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBUG">调试（DEBUG）</SelectItem>
                  <SelectItem value="INFO">信息（INFO）</SelectItem>
                  <SelectItem value="WARN">警告（WARN）</SelectItem>
                  <SelectItem value="ERROR">错误（ERROR）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>布局模式（已废弃）</Label>
              <Select
                value={config.layout || 'auto'}
                onValueChange={(value: 'auto' | 'stretch') => updateConfig({ layout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动（auto）</SelectItem>
                  <SelectItem value="stretch">拉伸（stretch）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>自动分享（已废弃）</Label>
              <p className="text-xs text-muted-foreground">使用 share 字段替代</p>
            </div>
            <Switch
              checked={config.autoshare ?? false}
              onCheckedChange={(checked) => updateConfig({ autoshare: checked })}
            />
          </div>

          <div>
            <Label>工具开关（已废弃）</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {TOOL_PERMISSIONS.map((tool) => (
                <div key={tool} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <Label className="text-xs font-mono">{tool}</Label>
                  <Switch
                    checked={config.tools?.[tool] !== false}
                    onCheckedChange={(checked) => updateConfig({
                      tools: { ...config.tools, [tool]: checked }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>命令配置（JSON）</Label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={4}
              placeholder={commandPlaceholder}
              value={commandJson}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommandJson(e.target.value)}
              onBlur={() => {
                if (!commandJson.trim()) {
                  setCommandError(null);
                  updateConfig({ command: undefined });
                  return;
                }
                try {
                  const parsed = JSON.parse(commandJson);
                  setCommandError(null);
                  updateConfig({ command: parsed });
                } catch (parseError) {
                  setCommandError(parseError instanceof Error ? parseError.message : '无效 JSON');
                }
              }}
            />
            {commandError && <p className="text-xs text-destructive">{commandError}</p>}
          </div>

          <div>
            <Label>兼容模式配置（JSON）</Label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={4}
              placeholder={modePlaceholder}
              value={modeJson}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setModeJson(e.target.value)}
              onBlur={() => {
                if (!modeJson.trim()) {
                  setModeError(null);
                  updateConfig({ mode: undefined });
                  return;
                }
                try {
                  const parsed = JSON.parse(modeJson);
                  setModeError(null);
                  updateConfig({ mode: parsed });
                } catch (parseError) {
                  setModeError(parseError instanceof Error ? parseError.message : '无效 JSON');
                }
              }}
            />
            {modeError && <p className="text-xs text-destructive">{modeError}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
