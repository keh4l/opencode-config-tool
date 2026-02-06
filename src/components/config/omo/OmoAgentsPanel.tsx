// src/components/config/omo/OmoAgentsPanel.tsx
import { useState } from 'react';
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, ChevronDown, Brain } from 'lucide-react';
import { KNOWN_AGENTS, CATEGORY_VARIANTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useOpencodeModels } from '@/hooks/useOpencodeModels';
import { TOOL_PERMISSIONS } from '@/types/config';

export function OmoAgentsPanel() {
  const { config, updateAgentOverride } = useOhMyOpenCodeStore();
  const { modelsByProvider, isLoading, error } = useOpencodeModels();
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({});

  const hasAvailableModels = Object.keys(modelsByProvider).length > 0;

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
            <div key={agent.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
              {/* 代理信息 */}
              <div>
                <div className="flex items-center gap-2">
                  <Label className="font-medium text-base">{agent.name}</Label>
                  <span className="text-xs text-muted-foreground font-mono">({agent.id})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
              </div>

              {/* 模型和温度配置 - 同一行 */}
              <div className="flex items-end gap-4">
                {/* 模型选择 */}
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">模型</Label>
                  {hasAvailableModels ? (
                    <Select
                      value={override?.model || '_none'}
                      onValueChange={(value) => {
                        if (value === '_none') {
                          updateAgentOverride(agent.id, null);
                        } else {
                          updateAgentOverride(agent.id, { ...override, model: value });
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择模型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">不覆盖（使用默认）</SelectItem>
                            {Object.entries(modelsByProvider).map(([providerId, models]) => (
                              <SelectGroup key={providerId}>
                                <SelectLabel className="flex items-center gap-2 text-xs font-semibold text-primary bg-muted/50 px-2 py-1.5 -mx-1 rounded">
                                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                                  {providerId}
                                </SelectLabel>
                                {models.map((model) => (
                                  <SelectItem key={model.fullId} value={model.fullId} className="pl-6">
                                    {model.modelName}
                                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                                      {model.modelId}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        className="mt-1"
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
                      <p className="text-xs text-muted-foreground">
                        {isLoading ? '正在加载模型列表...' : '请确认可执行 `opencode models`'}
                      </p>
                      {error && <p className="text-xs text-destructive">{error}</p>}
                    </div>
                  )}
                </div>

                {/* 温度设置 */}
                <div className="w-28">
                  <Label className="text-xs text-muted-foreground">温度</Label>
                  <Input
                    className="mt-1"
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
                    disabled={!override?.model}
                  />
                </div>

                {/* 变体设置 */}
                <div className="w-32">
                  <Label className="text-xs text-muted-foreground">变体</Label>
                  <Select
                    value={override?.variant || '_default'}
                    onValueChange={(value) => {
                      if (override?.model) {
                        updateAgentOverride(agent.id, {
                          ...override,
                          variant: value === '_default' ? undefined : value
                        });
                      }
                    }}
                    disabled={!override?.model}
                  >
                    <SelectTrigger className="mt-1">
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

              {/* 高级配置 */}
              {override?.model && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Brain className="h-3 w-3" />
                    <span>高级配置</span>
                    <ChevronDown className="h-3 w-3" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">采样概率（Top P）</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          placeholder="0.9"
                          value={override?.top_p ?? ''}
                          onChange={(e) => {
                            updateAgentOverride(agent.id, {
                              ...override,
                              top_p: e.target.value ? parseFloat(e.target.value) : undefined
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">分类</Label>
                        <Input
                          className="mt-1"
                          placeholder="quick"
                          value={override?.category || ''}
                          onChange={(e) => {
                            updateAgentOverride(agent.id, {
                              ...override,
                              category: e.target.value || undefined
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">模式</Label>
                        <Select
                          value={override?.mode || '_default'}
                          onValueChange={(value) => {
                            if (value === '_default') {
                              updateAgentOverride(agent.id, { ...override, mode: undefined });
                              return;
                            }
                            if (['subagent', 'primary', 'all'].includes(value)) {
                              updateAgentOverride(agent.id, { ...override, mode: value as 'subagent' | 'primary' | 'all' });
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="默认" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_default">默认</SelectItem>
                            <SelectItem value="subagent">子代理（subagent）</SelectItem>
                            <SelectItem value="primary">主代理（primary）</SelectItem>
                            <SelectItem value="all">全部（all）</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">颜色</Label>
                        <Input
                          className="mt-1"
                          placeholder="#FF5733"
                          value={override?.color || ''}
                          onChange={(e) => {
                            updateAgentOverride(agent.id, {
                              ...override,
                              color: e.target.value || undefined
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">描述</Label>
                      <Input
                        className="mt-1"
                        placeholder="代理描述"
                        value={override?.description || ''}
                        onChange={(e) => {
                          updateAgentOverride(agent.id, {
                            ...override,
                            description: e.target.value || undefined
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">提示词</Label>
                      <Textarea
                        className="mt-1"
                        rows={2}
                        placeholder="自定义提示词..."
                        value={override?.prompt || ''}
                        onChange={(e) => {
                          updateAgentOverride(agent.id, {
                            ...override,
                            prompt: e.target.value || undefined
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">提示词追加</Label>
                      <Textarea
                        className="mt-1"
                        rows={2}
                        placeholder="追加到系统提示的内容..."
                        value={override?.prompt_append || ''}
                        onChange={(e) => {
                          updateAgentOverride(agent.id, {
                            ...override,
                            prompt_append: e.target.value || undefined
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">技能列表 (逗号分隔)</Label>
                      <Input
                        className="mt-1"
                        placeholder="frontend-ui-ux, git-master"
                        value={(override?.skills || []).join(', ')}
                        onChange={(e) => {
                          const value = e.target.value
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean);
                          updateAgentOverride(agent.id, {
                            ...override,
                            skills: value.length > 0 ? value : undefined
                          });
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <Label className="text-sm">禁用该 Agent</Label>
                        <p className="text-xs text-muted-foreground">在 OMO 中禁用该代理</p>
                      </div>
                      <Switch
                        checked={override?.disable ?? false}
                        onCheckedChange={(checked) => {
                          updateAgentOverride(agent.id, {
                            ...override,
                            disable: checked
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">权限配置 (JSON)</Label>
                      <Textarea
                        className="mt-1 font-mono text-xs"
                        rows={3}
                        value={override?.permission ? JSON.stringify(override.permission, null, 2) : ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (!raw) {
                            setJsonErrors((prev) => ({ ...prev, [agent.id]: null }));
                            updateAgentOverride(agent.id, { ...override, permission: undefined });
                            return;
                          }
                          try {
                            const parsed = JSON.parse(raw);
                            setJsonErrors((prev) => ({ ...prev, [agent.id]: null }));
                            updateAgentOverride(agent.id, { ...override, permission: parsed });
                          } catch (parseError) {
                            setJsonErrors((prev) => ({
                              ...prev,
                              [agent.id]: parseError instanceof Error ? parseError.message : '无效 JSON'
                            }));
                          }
                        }}
                      />
                      {jsonErrors[agent.id] && (
                        <p className="mt-1 text-xs text-destructive">{jsonErrors[agent.id]}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">工具配置</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {TOOL_PERMISSIONS.map((tool) => (
                          <div key={tool} className="flex items-center justify-between p-2 bg-background rounded border">
                            <Label className="text-xs font-mono">{tool}</Label>
                            <Switch
                              checked={override?.tools?.[tool] !== false}
                              onCheckedChange={(checked) => {
                                updateAgentOverride(agent.id, {
                                  ...override,
                                  tools: {
                                    ...override.tools,
                                    [tool]: checked
                                  }
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );
}
