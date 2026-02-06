// src/components/config/omo/OmoCategoriesPanel.tsx
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
import { Layers, ChevronDown, Brain, Wrench } from 'lucide-react';
import { KNOWN_CATEGORIES, CATEGORY_VARIANTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { TOOL_PERMISSIONS } from '@/types/config';
import { useOpencodeModels } from '@/hooks/useOpencodeModels';

// 变体中文名称映射
const VARIANT_LABELS: Record<string, string> = {
  'low': '低配',
  'medium': '中配',
  'high': '高配',
  'xhigh': '超高配',
  'max': '最高配',
};

export function OmoCategoriesPanel() {
  const { config, updateCategory } = useOhMyOpenCodeStore();
  const { modelsByProvider, isLoading, error } = useOpencodeModels();
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({});
  const hasAvailableModels = Object.keys(modelsByProvider).length > 0;

  return (
    <ConfigCard
      title="任务分类模型"
      description="按任务类型配置模型变体"
      icon={Layers}
      badge={Object.keys(config.categories || {}).length > 0 ? (
        <Badge variant="secondary">
          {Object.keys(config.categories || {}).length} 个配置
        </Badge>
      ) : undefined}
    >
      <div className="space-y-4">
        {KNOWN_CATEGORIES.map((category) => {
          const categoryConfig = config.categories?.[category.id];
          return (
            <div key={category.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
              {/* 分类信息 */}
              <div>
                <div className="flex items-center gap-2">
                  <Label className="font-medium text-base">{category.name}</Label>
                  <span className="text-xs text-muted-foreground font-mono">({category.id})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{category.description}</p>
              </div>

              {/* 模型和变体配置 - 同一行 */}
              <div className="flex items-end gap-4">
                {/* 模型选择 */}
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">模型</Label>
                  {hasAvailableModels ? (
                    <Select
                      value={categoryConfig?.model || '_none'}
                      onValueChange={(value) => {
                        if (value === '_none') {
                          updateCategory(category.id, null);
                        } else {
                          updateCategory(category.id, { ...categoryConfig, model: value });
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
                        placeholder="模型 ID"
                        value={categoryConfig?.model || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateCategory(category.id, { ...categoryConfig, model: e.target.value });
                          } else {
                            updateCategory(category.id, null);
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

                {/* 性能变体 */}
                <div className="w-32">
                  <Label className="text-xs text-muted-foreground">性能变体</Label>
                  <Select
                    value={categoryConfig?.variant || '_default'}
                    onValueChange={(value) => {
                      if (!categoryConfig?.model) return;
                      if (value === '_default') {
                        updateCategory(category.id, {
                          ...categoryConfig,
                          variant: undefined
                        });
                        return;
                      }
                      if (CATEGORY_VARIANTS.includes(value as typeof CATEGORY_VARIANTS[number])) {
                        updateCategory(category.id, {
                          ...categoryConfig,
                          variant: value as typeof CATEGORY_VARIANTS[number]
                        });
                      }
                    }}
                    disabled={!categoryConfig?.model}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_default">默认</SelectItem>
                      {CATEGORY_VARIANTS.map((v) => (
                        <SelectItem key={v} value={v}>{VARIANT_LABELS[v] || v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 温度设置 */}
                <div className="w-24">
                  <Label className="text-xs text-muted-foreground">温度</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    placeholder="0.7"
                    value={categoryConfig?.temperature ?? ''}
                    onChange={(e) => {
                      if (categoryConfig?.model) {
                        updateCategory(category.id, {
                          ...categoryConfig,
                          temperature: e.target.value ? parseFloat(e.target.value) : undefined
                        });
                      }
                    }}
                    disabled={!categoryConfig?.model}
                  />
                </div>
              </div>

              {/* 高级配置区域 */}
              {categoryConfig?.model && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">采样概率（Top P）</Label>
                      <Input
                        className="mt-1"
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="0.9"
                        value={categoryConfig?.top_p ?? ''}
                        onChange={(e) => {
                          updateCategory(category.id, {
                            ...categoryConfig,
                            top_p: e.target.value ? parseFloat(e.target.value) : undefined
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">最大 Token</Label>
                      <Input
                        className="mt-1"
                        type="number"
                        min="1"
                        placeholder="4096"
                        value={categoryConfig?.maxTokens ?? ''}
                        onChange={(e) => {
                          updateCategory(category.id, {
                            ...categoryConfig,
                            maxTokens: e.target.value ? parseInt(e.target.value) : undefined
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">不稳定代理</Label>
                      <Switch
                        checked={categoryConfig?.is_unstable_agent ?? false}
                        onCheckedChange={(checked) => {
                          updateCategory(category.id, {
                            ...categoryConfig,
                            is_unstable_agent: checked
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">推理强度</Label>
                      <Select
                        value={categoryConfig?.reasoningEffort || '_default'}
                        onValueChange={(value) => {
                          if (value === '_default') {
                            updateCategory(category.id, {
                              ...categoryConfig,
                              reasoningEffort: undefined
                            });
                            return;
                          }
                          const allowed = ['low', 'medium', 'high', 'xhigh'] as const;
                          if (allowed.includes(value as typeof allowed[number])) {
                            updateCategory(category.id, {
                              ...categoryConfig,
                              reasoningEffort: value as typeof allowed[number]
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="默认" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_default">默认</SelectItem>
                          <SelectItem value="low">低（low）</SelectItem>
                          <SelectItem value="medium">中（medium）</SelectItem>
                          <SelectItem value="high">高（high）</SelectItem>
                          <SelectItem value="xhigh">超高（xhigh）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">文本详细度</Label>
                      <Select
                        value={categoryConfig?.textVerbosity || '_default'}
                        onValueChange={(value) => {
                          if (value === '_default') {
                            updateCategory(category.id, {
                              ...categoryConfig,
                              textVerbosity: undefined
                            });
                            return;
                          }
                          const allowed = ['low', 'medium', 'high'] as const;
                          if (allowed.includes(value as typeof allowed[number])) {
                            updateCategory(category.id, {
                              ...categoryConfig,
                              textVerbosity: value as typeof allowed[number]
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="默认" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_default">默认</SelectItem>
                          <SelectItem value="low">低（low）</SelectItem>
                          <SelectItem value="medium">中（medium）</SelectItem>
                          <SelectItem value="high">高（high）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* 提示追加 */}
                  <div>
                    <Label className="text-xs text-muted-foreground">提示追加</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="追加到系统提示的内容..."
                      rows={2}
                      value={categoryConfig?.prompt_append || ''}
                      onChange={(e) => {
                        updateCategory(category.id, {
                          ...categoryConfig,
                          prompt_append: e.target.value || undefined
                        });
                      }}
                      />
                    </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">分类描述</Label>
                    <Textarea
                      className="mt-1"
                      rows={2}
                      placeholder="分类描述..."
                      value={categoryConfig?.description || ''}
                      onChange={(e) => {
                        updateCategory(category.id, {
                          ...categoryConfig,
                          description: e.target.value || undefined
                        });
                      }}
                    />
                  </div>

                  {/* 扩展思考配置 */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Brain className="h-3 w-3" />
                      <span>扩展思考配置</span>
                      <ChevronDown className="h-3 w-3" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div>
                          <Label className="text-sm">启用扩展思考</Label>
                          <p className="text-xs text-muted-foreground">让模型进行深度思考（仅 Claude 模型支持）</p>
                        </div>
                        <Switch
                          checked={categoryConfig?.thinking?.type === 'enabled'}
                          onCheckedChange={(checked) => {
                            updateCategory(category.id, {
                              ...categoryConfig,
                              thinking: checked ? { type: 'enabled', budgetTokens: 10000 } : { type: 'disabled' }
                            });
                          }}
                        />
                      </div>
                      {categoryConfig?.thinking?.type === 'enabled' && (
                        <div className="pl-3">
                          <Label className="text-xs text-muted-foreground">思考预算 (Token 数)</Label>
                          <Input
                            className="mt-1"
                            type="number"
                            min="1000"
                            step="1000"
                            placeholder="10000"
                            value={categoryConfig?.thinking?.budgetTokens ?? 10000}
                            onChange={(e) => {
                              updateCategory(category.id, {
                                ...categoryConfig,
                                thinking: {
                                  type: 'enabled',
                                  budgetTokens: e.target.value ? parseInt(e.target.value) : 10000
                                }
                              });
                            }}
                          />
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 工具启用配置 */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Wrench className="h-3 w-3" />
                      <span>工具启用配置</span>
                      <ChevronDown className="h-3 w-3" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                      <div className="grid grid-cols-4 gap-2">
                        {TOOL_PERMISSIONS.map((tool) => (
                          <div key={tool} className="flex items-center justify-between p-2 bg-background rounded border">
                            <Label className="text-xs font-mono">{tool}</Label>
                            <Switch
                              checked={categoryConfig?.tools?.[tool] !== false}
                              onCheckedChange={(checked) => {
                                updateCategory(category.id, {
                                  ...categoryConfig,
                                  tools: {
                                    ...categoryConfig?.tools,
                                    [tool]: checked
                                  }
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div>
                    <Label className="text-xs text-muted-foreground">工具配置 (JSON)</Label>
                    <Textarea
                      className="mt-1 font-mono text-xs"
                      rows={3}
                      value={categoryConfig?.tools ? JSON.stringify(categoryConfig.tools, null, 2) : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) {
                          setJsonErrors((prev) => ({ ...prev, [category.id]: null }));
                          updateCategory(category.id, { ...categoryConfig, tools: undefined });
                          return;
                        }
                        try {
                          const parsed = JSON.parse(raw);
                          setJsonErrors((prev) => ({ ...prev, [category.id]: null }));
                          updateCategory(category.id, { ...categoryConfig, tools: parsed });
                        } catch (parseError) {
                          setJsonErrors((prev) => ({
                            ...prev,
                            [category.id]: parseError instanceof Error ? parseError.message : '无效 JSON'
                          }));
                        }
                      }}
                    />
                    {jsonErrors[category.id] && (
                      <p className="mt-1 text-xs text-destructive">{jsonErrors[category.id]}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );
}
