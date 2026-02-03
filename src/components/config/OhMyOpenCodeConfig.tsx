import { useEffect } from 'react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sparkles,
  Zap,
  Bot,
  Layers,
  Terminal,
  Settings2,
  Ban,
  FlaskConical,
  Save,
  RotateCcw,
  Download,
  Loader2,
} from 'lucide-react';
import { OMOC_PRESETS, KNOWN_HOOKS, KNOWN_MCPS, KNOWN_DISABLED_AGENTS } from '@/lib/oh-my-opencode-defaults';
import { KNOWN_AGENTS, KNOWN_CATEGORIES, TMUX_LAYOUTS, CATEGORY_VARIANTS } from '@/types/oh-my-opencode';
import { useToast } from '@/hooks/use-toast';

export function OhMyOpenCodeConfigPanel() {
  const {
    config,
    configScope,
    isDirty,
    isLoading,
    error,
    loadConfig,
    saveConfig,
    applyPreset,
    resetConfig,
    updateConfig,
    updateAgentOverride,
    updateCategory,
    toggleDisabledHook,
    toggleDisabledAgent,
    toggleDisabledMcp,
    setConfigScope,
  } = useOhMyOpenCodeStore();

  const { toast } = useToast();

  // 初始化加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    await saveConfig();
    toast({
      title: '保存成功',
      description: 'oh-my-opencode 配置已保存',
    });
  };

  const handleApplyPreset = (preset: typeof OMOC_PRESETS[0]) => {
    applyPreset(preset);
    toast({
      title: '预设已应用',
      description: `已应用 "${preset.name}" 预设`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 配置范围和操作按钮 */}
      <ConfigCard
        title="Oh My OpenCode"
        description="oh-my-opencode 插件的快捷配置"
        icon={Sparkles}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* 配置范围选择 */}
          <div className="flex items-center gap-2">
            <Label>配置范围:</Label>
            <Select
              value={configScope}
              onValueChange={(value: 'global' | 'project') => {
                setConfigScope(value);
                loadConfig(value);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">全局</SelectItem>
                <SelectItem value="project">项目</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            {isDirty && (
              <Badge variant="outline" className="text-orange-500 border-orange-500">
                未保存
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetConfig}
              disabled={!isDirty || isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              重置
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              保存
            </Button>
          </div>
        </div>
      </ConfigCard>

      {/* 预设模板 */}
      <ConfigCard
        title="快速预设"
        description="一键应用常用配置模板"
        icon={Zap}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OMOC_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              className="h-auto py-3 px-4 flex flex-col items-start text-left"
              onClick={() => handleApplyPreset(preset)}
            >
              <span className="font-medium">{preset.name}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {preset.description}
              </span>
            </Button>
          ))}
        </div>
      </ConfigCard>

      {/* 详细配置 - 使用 Accordion */}
      <Accordion type="multiple" className="space-y-4">
        {/* Agents 模型覆盖 */}
        <AccordionItem value="agents" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>Agents 模型覆盖</span>
              {Object.keys(config.agents || {}).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(config.agents || {}).length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            {KNOWN_AGENTS.map((agentId) => {
              const override = config.agents?.[agentId];
              return (
                <div key={agentId} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">{agentId}</Label>
                    <Input
                      className="mt-1"
                      placeholder="模型 ID (如 anthropic/claude-opus-4-5)"
                      value={override?.model || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateAgentOverride(agentId, { ...override, model: e.target.value });
                        } else {
                          updateAgentOverride(agentId, null);
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
                          updateAgentOverride(agentId, {
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
          </AccordionContent>
        </AccordionItem>

        {/* Categories 分类模型 */}
        <AccordionItem value="categories" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              <span>Categories 分类模型</span>
              {Object.keys(config.categories || {}).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(config.categories || {}).length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            {KNOWN_CATEGORIES.map((categoryId) => {
              const categoryConfig = config.categories?.[categoryId];
              return (
                <div key={categoryId} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">{categoryId}</Label>
                    <Input
                      className="mt-1"
                      placeholder="模型 ID"
                      value={categoryConfig?.model || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateCategory(categoryId, { ...categoryConfig, model: e.target.value });
                        } else {
                          updateCategory(categoryId, null);
                        }
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">变体</Label>
                    <Select
                      value={categoryConfig?.variant || '_default'}
                      onValueChange={(value) => {
                        if (categoryConfig?.model) {
                          updateCategory(categoryId, {
                            ...categoryConfig,
                            variant: value === '_default' ? undefined : value as any
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_default">默认</SelectItem>
                        {CATEGORY_VARIANTS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* 后台任务配置 */}
        <AccordionItem value="background" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <span>后台任务配置</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>默认并发数</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={config.background_task?.defaultConcurrency ?? ''}
                  onChange={(e) => updateConfig({
                    background_task: {
                      ...config.background_task,
                      defaultConcurrency: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  placeholder="5"
                />
              </div>
              <div>
                <Label>超时时间 (ms)</Label>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={config.background_task?.staleTimeoutMs ?? ''}
                  onChange={(e) => updateConfig({
                    background_task: {
                      ...config.background_task,
                      staleTimeoutMs: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  placeholder="180000"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Provider 并发配置</Label>
              <div className="grid grid-cols-3 gap-2">
                {['anthropic', 'openai', 'google'].map((provider) => (
                  <div key={provider}>
                    <Label className="text-xs capitalize">{provider}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={config.background_task?.providerConcurrency?.[provider] ?? ''}
                      onChange={(e) => {
                        const newValue = e.target.value ? parseInt(e.target.value) : undefined;
                        const currentConcurrency = { ...config.background_task?.providerConcurrency };
                        if (newValue !== undefined) {
                          currentConcurrency[provider] = newValue;
                        } else {
                          delete currentConcurrency[provider];
                        }
                        updateConfig({
                          background_task: {
                            ...config.background_task,
                            providerConcurrency: Object.keys(currentConcurrency).length > 0 ? currentConcurrency : undefined
                          }
                        });
                      }}
                      placeholder="5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tmux 集成 */}
        <AccordionItem value="tmux" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <span>Tmux 集成</span>
              {config.tmux?.enabled && (
                <Badge variant="default" className="ml-2">启用</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
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
          </AccordionContent>
        </AccordionItem>

        {/* Sisyphus Agent */}
        <AccordionItem value="sisyphus" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span>Sisyphus Agent</span>
              {config.sisyphus_agent?.disabled === false && (
                <Badge variant="default" className="ml-2">启用</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>启用 Sisyphus</Label>
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
                <Label>启用 Planner</Label>
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
          </AccordionContent>
        </AccordionItem>

        {/* 禁用功能 */}
        <AccordionItem value="disabled" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              <span>禁用功能</span>
              {((config.disabled_hooks?.length || 0) + (config.disabled_agents?.length || 0) + (config.disabled_mcps?.length || 0)) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {(config.disabled_hooks?.length || 0) + (config.disabled_agents?.length || 0) + (config.disabled_mcps?.length || 0)}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            {/* Hooks */}
            <div>
              <Label className="mb-2 block">禁用的 Hooks</Label>
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
              <Label className="mb-2 block">禁用的 Agents</Label>
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
              <Label className="mb-2 block">禁用的 MCPs</Label>
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
          </AccordionContent>
        </AccordionItem>

        {/* Claude Code 兼容性 */}
        <AccordionItem value="claude-code" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <span>Claude Code 兼容性</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
            {(['mcp', 'commands', 'skills', 'agents', 'hooks', 'plugins'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="capitalize">{key}</Label>
                <Switch
                  checked={config.claude_code?.[key] ?? true}
                  onCheckedChange={(checked) => updateConfig({
                    claude_code: { ...config.claude_code, [key]: checked }
                  })}
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* 实验性功能 */}
        <AccordionItem value="experimental" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              <span>实验性功能</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 一键安装 */}
      <ConfigCard
        title="安装 oh-my-opencode"
        description="运行安装命令配置 oh-my-opencode"
        icon={Download}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            运行以下命令安装 oh-my-opencode:
          </p>
          <code className="block p-3 bg-muted rounded-lg text-sm font-mono">
            bunx oh-my-opencode install
          </code>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText('bunx oh-my-opencode install');
              toast({
                title: '已复制',
                description: '安装命令已复制到剪贴板',
              });
            }}
          >
            复制命令
          </Button>
        </div>
      </ConfigCard>
    </div>
  );
}
