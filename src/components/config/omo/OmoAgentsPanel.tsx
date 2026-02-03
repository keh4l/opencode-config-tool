// src/components/config/omo/OmoAgentsPanel.tsx
import { useMemo } from 'react';
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot } from 'lucide-react';
import { KNOWN_AGENTS } from '@/types/oh-my-opencode';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useConfigStore } from '@/hooks/useConfig';

// 内置提供商的默认模型
const DEFAULT_PROVIDER_MODELS: Record<string, { id: string; name: string }[]> = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
    { id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'o1-preview', name: 'o1-preview' },
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-pro', name: 'Gemini Pro' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  ],
  xai: [
    { id: 'grok-2', name: 'Grok 2' },
  ],
};

export function OmoAgentsPanel() {
  const { config, updateAgentOverride } = useOhMyOpenCodeStore();
  const { config: openCodeConfig } = useConfigStore();

  // 从 OpenCode 配置中获取可用模型
  const availableModels = useMemo(() => {
    const models: { providerId: string; providerName: string; modelId: string; modelName: string; fullId: string }[] = [];
    const providers = openCodeConfig.provider || {};

    Object.entries(providers).forEach(([providerId, providerConfig]) => {
      if (!providerConfig) return;

      const providerName = providerConfig.name || providerId;

      if (providerConfig.models && Object.keys(providerConfig.models).length > 0) {
        Object.entries(providerConfig.models).forEach(([modelId, modelConfig]) => {
          models.push({
            providerId,
            providerName,
            modelId,
            modelName: modelConfig?.name || modelId,
            fullId: `${providerId}/${modelId}`,
          });
        });
      } else if (providerConfig.whitelist && providerConfig.whitelist.length > 0) {
        providerConfig.whitelist.forEach((modelId) => {
          models.push({
            providerId,
            providerName,
            modelId,
            modelName: modelId,
            fullId: `${providerId}/${modelId}`,
          });
        });
      } else if (DEFAULT_PROVIDER_MODELS[providerId]) {
        DEFAULT_PROVIDER_MODELS[providerId].forEach((model) => {
          models.push({
            providerId,
            providerName,
            modelId: model.id,
            modelName: model.name,
            fullId: `${providerId}/${model.id}`,
          });
        });
      }
    });

    return models;
  }, [openCodeConfig.provider]);

  // 按提供商分组
  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, typeof availableModels> = {};
    availableModels.forEach((model) => {
      if (!grouped[model.providerId]) {
        grouped[model.providerId] = [];
      }
      grouped[model.providerId].push(model);
    });
    return grouped;
  }, [availableModels]);

  const hasConfiguredProviders = Object.keys(modelsByProvider).length > 0;

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
                  {hasConfiguredProviders ? (
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
                              {models[0]?.providerName || providerId}
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
              </div>
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );
}
