// src/components/config/ProviderConfig.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Server, Plus, Trash2, Edit, Globe, Settings2, X, ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { ProviderConfig as ProviderConfigType, ModelConfig } from '@/types/config';
import { BUILTIN_PROVIDERS } from '@/types/config';

// NPM 包支持的模型选项映射
const NPM_MODEL_OPTIONS: Record<string, {
  reasoningEffort?: boolean;
  reasoningSummary?: boolean;
  textVerbosity?: boolean;
  thinking?: boolean;
  thinkingLevel?: boolean;
  include?: boolean;
  store?: boolean;
}> = {
  '@ai-sdk/openai': {
    reasoningEffort: true,
    reasoningSummary: true,
    textVerbosity: true,
    include: true,
    store: true,
  },
  '@ai-sdk/openai-compatible': {
    reasoningEffort: true,
    reasoningSummary: true,
    textVerbosity: true,
    include: true,
    store: true,
  },
  '@ai-sdk/azure': {
    reasoningEffort: true,
    reasoningSummary: true,
    include: true,
  },
  '@ai-sdk/anthropic': {
    thinking: true,
  },
  '@ai-sdk/google': {
    thinkingLevel: true,
  },
  '@ai-sdk/google-vertex': {
    thinkingLevel: true,
  },
};

// 获取当前 NPM 包支持的选项
const getModelOptionsForNpm = (npm: string) => {
  return NPM_MODEL_OPTIONS[npm] || {};
};

// 内置 Provider 信息
const PROVIDER_INFO: Record<string, { name: string; description: string; envVar: string }> = {
  anthropic: { name: 'Anthropic', description: 'Claude 系列模型', envVar: 'ANTHROPIC_API_KEY' },
  openai: { name: 'OpenAI', description: 'GPT 系列模型', envVar: 'OPENAI_API_KEY' },
  google: { name: 'Google', description: 'Gemini 系列模型', envVar: 'GOOGLE_API_KEY' },
  azure: { name: 'Azure OpenAI', description: 'Azure 托管的 OpenAI 模型', envVar: 'AZURE_OPENAI_API_KEY' },
  'azure-cognitive': { name: 'Azure 认知服务', description: 'Azure 认知服务 AI', envVar: 'AZURE_API_KEY' },
  openrouter: { name: 'OpenRouter', description: '多模型路由服务', envVar: 'OPENROUTER_API_KEY' },
  groq: { name: 'Groq', description: '快速推理服务', envVar: 'GROQ_API_KEY' },
  bedrock: { name: 'AWS Bedrock', description: 'AWS 托管的 AI 模型', envVar: 'AWS_ACCESS_KEY_ID' },
  xai: { name: 'xAI', description: 'Grok 系列模型', envVar: 'XAI_API_KEY' },
  vertexai: { name: 'Vertex AI', description: 'Google Cloud AI 平台', envVar: 'GOOGLE_APPLICATION_CREDENTIALS' },
};

// NPM 包对应的 Base URL 示例和说明
const NPM_PACKAGE_INFO: Record<string, { placeholder: string; description: string; envVar: string }> = {
  '@ai-sdk/openai-compatible': {
    placeholder: 'https://api.example.com/v1',
    description: '适用于 OpenAI 兼容的第三方服务',
    envVar: 'API_KEY',
  },
  '@ai-sdk/openai': {
    placeholder: 'https://api.openai.com/v1',
    description: 'OpenAI 官方 API，通常无需修改',
    envVar: 'OPENAI_API_KEY',
  },
  '@ai-sdk/anthropic': {
    placeholder: 'https://api.anthropic.com/v1',
    description: 'Anthropic 官方 API，自定义端点必须包含 /v1',
    envVar: 'ANTHROPIC_API_KEY',
  },
  '@ai-sdk/google': {
    placeholder: 'https://generativelanguage.googleapis.com/v1beta',
    description: 'Google Gemini API，通常无需修改',
    envVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
  },
  '@ai-sdk/google-vertex': {
    placeholder: '由 Google Cloud 项目自动配置',
    description: '需要配置 GOOGLE_CLOUD_PROJECT 环境变量',
    envVar: 'GOOGLE_APPLICATION_CREDENTIALS',
  },
  '@ai-sdk/azure': {
    placeholder: 'https://{resource-name}.openai.azure.com',
    description: '替换 {resource-name} 为您的 Azure 资源名称',
    envVar: 'AZURE_OPENAI_API_KEY',
  },
  '@ai-sdk/amazon-bedrock': {
    placeholder: '由 AWS 区域自动配置',
    description: '需要配置 AWS_ACCESS_KEY_ID 和 AWS_SECRET_ACCESS_KEY',
    envVar: 'AWS_ACCESS_KEY_ID',
  },
  '@ai-sdk/xai': {
    placeholder: 'https://api.x.ai/v1',
    description: 'xAI Grok API，通常无需修改',
    envVar: 'XAI_API_KEY',
  },
  '@ai-sdk/groq': {
    placeholder: 'https://api.groq.com/openai/v1',
    description: 'Groq API，通常无需修改',
    envVar: 'GROQ_API_KEY',
  },
  '@ai-sdk/mistral': {
    placeholder: 'https://api.mistral.ai/v1',
    description: 'Mistral AI API，通常无需修改',
    envVar: 'MISTRAL_API_KEY',
  },
  '@ai-sdk/cohere': {
    placeholder: 'https://api.cohere.ai/v1',
    description: 'Cohere API，通常无需修改',
    envVar: 'COHERE_API_KEY',
  },
  '@ai-sdk/deepseek': {
    placeholder: 'https://api.deepseek.com/v1',
    description: 'DeepSeek API，通常无需修改',
    envVar: 'DEEPSEEK_API_KEY',
  },
  '@ai-sdk/perplexity': {
    placeholder: 'https://api.perplexity.ai',
    description: 'Perplexity API，通常无需修改',
    envVar: 'PERPLEXITY_API_KEY',
  },
  '@ai-sdk/togetherai': {
    placeholder: 'https://api.together.xyz/v1',
    description: 'Together AI API，通常无需修改',
    envVar: 'TOGETHER_AI_API_KEY',
  },
  '@ai-sdk/fireworks': {
    placeholder: 'https://api.fireworks.ai/inference/v1',
    description: 'Fireworks AI API，通常无需修改',
    envVar: 'FIREWORKS_API_KEY',
  },
  '@ai-sdk/cerebras': {
    placeholder: 'https://api.cerebras.ai/v1',
    description: 'Cerebras API，通常无需修改',
    envVar: 'CEREBRAS_API_KEY',
  },
  '@ai-sdk/replicate': {
    placeholder: 'https://api.replicate.com/v1',
    description: 'Replicate API，通常无需修改',
    envVar: 'REPLICATE_API_TOKEN',
  },
  '@ai-sdk/fal': {
    placeholder: 'https://fal.run',
    description: 'Fal AI API，通常无需修改',
    envVar: 'FAL_KEY',
  },
  '@ai-sdk/luma': {
    placeholder: 'https://api.lumalabs.ai',
    description: 'Luma AI API，通常无需修改',
    envVar: 'LUMA_API_KEY',
  },
};

interface ProviderFormData {
  id: string;
  npm: string;
  name: string;
  baseURL: string;
  apiKey: string;
  headers: Record<string, string>;
  models: Record<string, ModelConfig>;
  whitelist: string[];
  blacklist: string[];
  timeout: number | false;
  timeoutEnabled: boolean;
  enterpriseUrl: string;
  env: string[];
}

const emptyProvider: ProviderFormData = {
  id: '',
  npm: '@ai-sdk/openai-compatible',
  name: '',
  baseURL: '',
  apiKey: '',
  headers: {},
  models: {},
  whitelist: [],
  blacklist: [],
  timeout: 30000,
  timeoutEnabled: true,
  enterpriseUrl: '',
  env: [],
};

export function ProviderConfig() {
  const { config, addProvider, updateProvider, removeProvider } = useConfigStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderFormData | null>(null);
  const [newModelId, setNewModelId] = useState('');
  const [newWhitelistModel, setNewWhitelistModel] = useState('');
  const [newBlacklistModel, setNewBlacklistModel] = useState('');
  const [newEnvVar, setNewEnvVar] = useState('');
  // 变体添加对话框状态
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantModelId, setVariantModelId] = useState('');
  const [newVariantName, setNewVariantName] = useState('');

  const providers = config.provider || {};

  const handleAddProvider = () => {
    setEditingProvider({ ...emptyProvider });
    setIsDialogOpen(true);
  };

  const handleEditProvider = (id: string) => {
    const provider = providers[id];
    if (provider) {
      setEditingProvider({
        id,
        npm: provider.npm || '@ai-sdk/openai-compatible',
        name: provider.name || '',
        baseURL: provider.options?.baseURL || '',
        apiKey: provider.options?.apiKey || '',
        headers: provider.options?.headers || {},
        models: provider.models || {},
        whitelist: provider.whitelist || [],
        blacklist: provider.blacklist || [],
        timeout: provider.options?.timeout === false ? 0 : (provider.options?.timeout || 30000),
        timeoutEnabled: provider.options?.timeout !== false,
        enterpriseUrl: provider.options?.enterpriseUrl || '',
        env: provider.env || [],
      });
      setIsDialogOpen(true);
    }
  };

  const handleSaveProvider = () => {
    if (!editingProvider || !editingProvider.id) return;

    const providerConfig: ProviderConfigType = {
      npm: editingProvider.npm,
      name: editingProvider.name,
      env: editingProvider.env.length > 0 ? editingProvider.env : undefined,
      options: {
        baseURL: editingProvider.baseURL || undefined,
        apiKey: editingProvider.apiKey || undefined,
        headers: Object.keys(editingProvider.headers).length > 0 ? editingProvider.headers : undefined,
        timeout: editingProvider.timeoutEnabled ? editingProvider.timeout : false,
        enterpriseUrl: editingProvider.enterpriseUrl || undefined,
      },
      models: Object.keys(editingProvider.models).length > 0 ? editingProvider.models : undefined,
      whitelist: editingProvider.whitelist.length > 0 ? editingProvider.whitelist : undefined,
      blacklist: editingProvider.blacklist.length > 0 ? editingProvider.blacklist : undefined,
    };

    if (providers[editingProvider.id]) {
      updateProvider(editingProvider.id, providerConfig);
    } else {
      addProvider(editingProvider.id, providerConfig);
    }

    setIsDialogOpen(false);
    setEditingProvider(null);
  };

  const handleAddModel = () => {
    if (!editingProvider || !newModelId) return;
    setEditingProvider({
      ...editingProvider,
      models: {
        ...editingProvider.models,
        [newModelId]: { name: newModelId },
      },
    });
    setNewModelId('');
  };

  const handleRemoveModel = (modelId: string) => {
    if (!editingProvider) return;
    const { [modelId]: _, ...rest } = editingProvider.models;
    setEditingProvider({ ...editingProvider, models: rest });
  };

  const handleUpdateModel = (modelId: string, field: string, value: any) => {
    if (!editingProvider) return;
    setEditingProvider({
      ...editingProvider,
      models: {
        ...editingProvider.models,
        [modelId]: {
          ...editingProvider.models[modelId],
          [field]: value,
        },
      },
    });
  };

  const handleAddWhitelistModel = () => {
    if (!editingProvider || !newWhitelistModel) return;
    setEditingProvider({
      ...editingProvider,
      whitelist: [...editingProvider.whitelist, newWhitelistModel],
    });
    setNewWhitelistModel('');
  };

  const handleRemoveWhitelistModel = (model: string) => {
    if (!editingProvider) return;
    setEditingProvider({
      ...editingProvider,
      whitelist: editingProvider.whitelist.filter(m => m !== model),
    });
  };

  const handleAddBlacklistModel = () => {
    if (!editingProvider || !newBlacklistModel) return;
    setEditingProvider({
      ...editingProvider,
      blacklist: [...editingProvider.blacklist, newBlacklistModel],
    });
    setNewBlacklistModel('');
  };

  const handleRemoveBlacklistModel = (model: string) => {
    if (!editingProvider) return;
    setEditingProvider({
      ...editingProvider,
      blacklist: editingProvider.blacklist.filter(m => m !== model),
    });
  };

  const handleAddEnvVar = () => {
    if (!editingProvider || !newEnvVar) return;
    setEditingProvider({
      ...editingProvider,
      env: [...editingProvider.env, newEnvVar],
    });
    setNewEnvVar('');
  };

  const handleRemoveEnvVar = (envVar: string) => {
    if (!editingProvider) return;
    setEditingProvider({
      ...editingProvider,
      env: editingProvider.env.filter(e => e !== envVar),
    });
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="AI 模型提供商配置"
        description="配置 AI 模型提供商，支持内置和自定义提供商"
        icon={Server}
        actions={
          <Button size="sm" onClick={handleAddProvider}>
            <Plus className="h-4 w-4 mr-2" />
            添加提供商
          </Button>
        }
      >
        {/* 已配置的 Provider 列表 */}
        {Object.keys(providers).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无配置的提供商，点击上方按钮添加
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(providers).map(([id, provider]) => {
              if (!provider) return null;
              return (
                <AccordionItem key={id} value={id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-foreground">{provider.name || id}</span>
                    {provider.options?.baseURL && (
                      <span className="text-xs text-muted-foreground">
                        {provider.options.baseURL}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Provider 详情 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">NPM包:</span>
                        <span className="ml-2 font-mono text-foreground">{provider.npm || '默认'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Base URL:</span>
                        <span className="ml-2 font-mono text-foreground">{provider.options?.baseURL || '默认'}</span>
                      </div>
                    </div>

                    {/* 模型列表 */}
                    {provider.models && Object.keys(provider.models).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-foreground">模型列表</h4>
                        <div className="space-y-2">
                          {Object.entries(provider.models).map(([modelId, model]) => (
                            <div
                              key={modelId}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            >
                              <span className="font-mono text-sm text-foreground">{modelId}</span>
                              {model.limit && (
                                <span className="text-xs text-muted-foreground">
                                  上下文: {model.limit.context?.toLocaleString()} | 输出: {model.limit.output?.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProvider(id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeProvider(id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </ConfigCard>

      {/* 快速添加内置提供商 */}
      <ConfigCard title="快速添加内置提供商" icon={Globe}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BUILTIN_PROVIDERS.filter(id => !providers[id]).map((id) => {
            const info = PROVIDER_INFO[id];
            return (
              <Button
                key={id}
                variant="outline"
                className="h-auto py-3 flex flex-col items-start"
                onClick={() => {
                  addProvider(id, {
                    name: info?.name || id,
                  });
                }}
              >
                <span className="font-medium text-foreground">{info?.name || id}</span>
                <span className="text-xs text-muted-foreground">{info?.description}</span>
              </Button>
            );
          })}
        </div>
      </ConfigCard>

      {/* Provider 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider?.id ? `编辑提供商: ${editingProvider.id}` : '添加自定义提供商'}
            </DialogTitle>
            <DialogDescription>
              配置自定义 AI 模型提供商，支持 OpenAI 兼容的 API
            </DialogDescription>
          </DialogHeader>

          {editingProvider && (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-id">提供商 ID</Label>
                  <Input
                    id="provider-id"
                    value={editingProvider.id}
                    onChange={(e) => setEditingProvider({ ...editingProvider, id: e.target.value })}
                    placeholder="my-provider"
                    disabled={!!providers[editingProvider.id]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-name">显示名称</Label>
                  <Input
                    id="provider-name"
                    value={editingProvider.name}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    placeholder="我的自定义 Provider"
                  />
                </div>
              </div>

              {/* NPM 包 */}
              <div className="space-y-2">
                <Label htmlFor="provider-npm">NPM 包</Label>
                <Select
                  value={editingProvider.npm}
                  onValueChange={(value) => setEditingProvider({ ...editingProvider, npm: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {/* 通用兼容包 */}
                    <SelectItem value="@ai-sdk/openai-compatible">@ai-sdk/openai-compatible (OpenAI 兼容)</SelectItem>

                    {/* 主流提供商 */}
                    <SelectItem value="@ai-sdk/openai">@ai-sdk/openai (OpenAI)</SelectItem>
                    <SelectItem value="@ai-sdk/anthropic">@ai-sdk/anthropic (Anthropic)</SelectItem>
                    <SelectItem value="@ai-sdk/google">@ai-sdk/google (Google Gemini)</SelectItem>
                    <SelectItem value="@ai-sdk/google-vertex">@ai-sdk/google-vertex (Google Vertex AI)</SelectItem>
                    <SelectItem value="@ai-sdk/azure">@ai-sdk/azure (Azure OpenAI)</SelectItem>
                    <SelectItem value="@ai-sdk/amazon-bedrock">@ai-sdk/amazon-bedrock (AWS Bedrock)</SelectItem>

                    {/* 其他提供商 */}
                    <SelectItem value="@ai-sdk/xai">@ai-sdk/xai (xAI Grok)</SelectItem>
                    <SelectItem value="@ai-sdk/groq">@ai-sdk/groq (Groq)</SelectItem>
                    <SelectItem value="@ai-sdk/mistral">@ai-sdk/mistral (Mistral AI)</SelectItem>
                    <SelectItem value="@ai-sdk/cohere">@ai-sdk/cohere (Cohere)</SelectItem>
                    <SelectItem value="@ai-sdk/deepseek">@ai-sdk/deepseek (DeepSeek)</SelectItem>
                    <SelectItem value="@ai-sdk/perplexity">@ai-sdk/perplexity (Perplexity)</SelectItem>
                    <SelectItem value="@ai-sdk/togetherai">@ai-sdk/togetherai (Together AI)</SelectItem>
                    <SelectItem value="@ai-sdk/fireworks">@ai-sdk/fireworks (Fireworks AI)</SelectItem>
                    <SelectItem value="@ai-sdk/cerebras">@ai-sdk/cerebras (Cerebras)</SelectItem>
                    <SelectItem value="@ai-sdk/replicate">@ai-sdk/replicate (Replicate)</SelectItem>
                    <SelectItem value="@ai-sdk/fal">@ai-sdk/fal (Fal AI)</SelectItem>
                    <SelectItem value="@ai-sdk/luma">@ai-sdk/luma (Luma AI)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  选择与您的 AI 提供商对应的 SDK 包，大多数第三方服务可使用 OpenAI 兼容包
                </p>
              </div>

              {/* API 配置 */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  API 配置
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-baseurl">API 地址 (Base URL)</Label>
                    <Input
                      id="provider-baseurl"
                      value={editingProvider.baseURL}
                      onChange={(e) => setEditingProvider({ ...editingProvider, baseURL: e.target.value })}
                      placeholder={NPM_PACKAGE_INFO[editingProvider.npm]?.placeholder || 'https://api.example.com/v1'}
                    />
                    <p className="text-xs text-muted-foreground">
                      {NPM_PACKAGE_INFO[editingProvider.npm]?.description || '输入 API 服务的基础 URL'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-apikey">API 密钥 (支持环境变量语法)</Label>
                    <Input
                      id="provider-apikey"
                      value={editingProvider.apiKey}
                      onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                      placeholder={`\${${NPM_PACKAGE_INFO[editingProvider.npm]?.envVar || 'API_KEY'}}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      推荐使用环境变量: {NPM_PACKAGE_INFO[editingProvider.npm]?.envVar || 'API_KEY'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 模型过滤 */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">模型过滤</h4>

                {/* Whitelist */}
                <div className="space-y-2">
                  <Label>模型白名单</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newWhitelistModel}
                      onChange={(e) => setNewWhitelistModel(e.target.value)}
                      placeholder="model-name"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWhitelistModel();
                        }
                      }}
                    />
                    <Button onClick={handleAddWhitelistModel} disabled={!newWhitelistModel} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                  {editingProvider.whitelist.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingProvider.whitelist.map((model) => (
                        <Badge key={model} variant="secondary" className="flex items-center gap-1">
                          {model}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveWhitelistModel(model)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    白名单：只有列表中的模型可用。留空表示允许所有模型。
                  </p>
                </div>

                {/* Blacklist */}
                <div className="space-y-2">
                  <Label>模型黑名单</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newBlacklistModel}
                      onChange={(e) => setNewBlacklistModel(e.target.value)}
                      placeholder="model-name"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBlacklistModel();
                        }
                      }}
                    />
                    <Button onClick={handleAddBlacklistModel} disabled={!newBlacklistModel} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                  {editingProvider.blacklist.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingProvider.blacklist.map((model) => (
                        <Badge key={model} variant="destructive" className="flex items-center gap-1">
                          {model}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-white"
                            onClick={() => handleRemoveBlacklistModel(model)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    黑名单：列表中的模型将被禁用。黑名单优先级高于白名单。
                  </p>
                </div>
              </div>

              {/* 高级选项 */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">高级选项</h4>

                {/* Timeout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="provider-timeout">请求超时 (毫秒)</Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="timeout-enabled" className="text-xs text-muted-foreground">启用超时</Label>
                      <Switch
                        id="timeout-enabled"
                        checked={editingProvider.timeoutEnabled}
                        onCheckedChange={(checked) => setEditingProvider({ ...editingProvider, timeoutEnabled: checked })}
                      />
                    </div>
                  </div>
                  <Input
                    id="provider-timeout"
                    type="number"
                    value={editingProvider.timeout === false ? '' : editingProvider.timeout}
                    onChange={(e) => setEditingProvider({ ...editingProvider, timeout: parseInt(e.target.value) || 0 })}
                    placeholder="30000"
                    disabled={!editingProvider.timeoutEnabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    设置 API 请求超时时间。关闭开关表示禁用超时限制。
                  </p>
                </div>

                {/* Enterprise URL - only for github-copilot */}
                {editingProvider.npm === '@ai-sdk/github-copilot' && (
                  <div className="space-y-2">
                    <Label htmlFor="provider-enterprise-url">GitHub Enterprise URL</Label>
                    <Input
                      id="provider-enterprise-url"
                      value={editingProvider.enterpriseUrl}
                      onChange={(e) => setEditingProvider({ ...editingProvider, enterpriseUrl: e.target.value })}
                      placeholder="https://github.company.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      仅用于 GitHub Enterprise 部署。留空使用默认 GitHub.com。
                    </p>
                  </div>
                )}

                {/* Environment Variables */}
                <div className="space-y-2">
                  <Label>环境变量</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newEnvVar}
                      onChange={(e) => setNewEnvVar(e.target.value)}
                      placeholder="ENV_VAR_NAME"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEnvVar();
                        }
                      }}
                    />
                    <Button onClick={handleAddEnvVar} disabled={!newEnvVar} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                  {editingProvider.env.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingProvider.env.map((envVar) => (
                        <Badge key={envVar} variant="outline" className="flex items-center gap-1">
                          {envVar}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveEnvVar(envVar)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    指定此 Provider 需要的环境变量名称列表。
                  </p>
                </div>
              </div>

              {/* 模型列表 */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">模型配置</h4>

                {/* 添加模型 */}
                <div className="flex gap-2">
                  <Input
                    value={newModelId}
                    onChange={(e) => setNewModelId(e.target.value)}
                    placeholder="model-id"
                    className="flex-1"
                  />
                  <Button onClick={handleAddModel} disabled={!newModelId}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加模型
                  </Button>
                </div>

                {/* 模型列表 */}
                <div className="space-y-3">
                  {Object.entries(editingProvider.models).map(([modelId, model]) => (
                    <Collapsible key={modelId} className="border border-border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="font-mono font-medium text-foreground">{modelId}</span>
                          {model.name && <span className="text-sm text-muted-foreground">({model.name})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={(e) => { e.stopPropagation(); handleRemoveModel(modelId); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 pt-0 space-y-4 border-t">
                        {/* 基本信息 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">显示名称</Label>
                            <Input
                              value={model.name || ''}
                              onChange={(e) => handleUpdateModel(modelId, 'name', e.target.value)}
                              placeholder="模型名称"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">上下文限制</Label>
                            <Input
                              type="number"
                              value={model.limit?.context || ''}
                              onChange={(e) => handleUpdateModel(modelId, 'limit', {
                                ...model.limit,
                                context: parseInt(e.target.value) || undefined,
                              })}
                              placeholder="128000"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">输出限制</Label>
                            <Input
                              type="number"
                              value={model.limit?.output || ''}
                              onChange={(e) => handleUpdateModel(modelId, 'limit', {
                                ...model.limit,
                                output: parseInt(e.target.value) || undefined,
                              })}
                              placeholder="4096"
                            />
                          </div>
                        </div>

                        {/* 模型选项 - 根据 NPM 包动态显示 */}
                        {(() => {
                          const supportedOptions = getModelOptionsForNpm(editingProvider.npm);
                          const hasAnyOption = Object.values(supportedOptions).some(v => v);

                          if (!hasAnyOption) {
                            return (
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  当前 Provider ({editingProvider.npm}) 没有特殊的模型选项配置
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">模型高级选项</Label>
                              <p className="text-xs text-muted-foreground">
                                以下选项适用于 {editingProvider.npm}
                              </p>

                              <div className="grid grid-cols-2 gap-3">
                                {/* 推理强度 - OpenAI/Azure */}
                                {supportedOptions.reasoningEffort && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">推理强度</Label>
                                    <Select
                                      value={model.options?.reasoningEffort || ''}
                                      onValueChange={(value) => handleUpdateModel(modelId, 'options', {
                                        ...model.options,
                                        reasoningEffort: value || undefined,
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="选择推理强度" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="minimal">极简 (minimal)</SelectItem>
                                        <SelectItem value="low">低 (low)</SelectItem>
                                        <SelectItem value="medium">中等 (medium)</SelectItem>
                                        <SelectItem value="high">高 (high)</SelectItem>
                                        <SelectItem value="xhigh">极高 (xhigh)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">控制模型推理时的思考深度</p>
                                  </div>
                                )}

                                {/* 推理摘要 */}
                                {supportedOptions.reasoningSummary && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">推理摘要</Label>
                                    <Select
                                      value={model.options?.reasoningSummary || ''}
                                      onValueChange={(value) => handleUpdateModel(modelId, 'options', {
                                        ...model.options,
                                        reasoningSummary: value || undefined,
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="选择摘要模式" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="auto">自动 (auto)</SelectItem>
                                        <SelectItem value="detailed">详细 (detailed)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">推理过程摘要的详细程度</p>
                                  </div>
                                )}

                                {/* 输出详细度 */}
                                {supportedOptions.textVerbosity && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">输出详细度</Label>
                                    <Select
                                      value={model.options?.textVerbosity || ''}
                                      onValueChange={(value) => handleUpdateModel(modelId, 'options', {
                                        ...model.options,
                                        textVerbosity: value || undefined,
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="选择详细程度" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">简洁 (low)</SelectItem>
                                        <SelectItem value="medium">适中 (medium)</SelectItem>
                                        <SelectItem value="high">详细 (high)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">控制输出文本的详细程度</p>
                                  </div>
                                )}

                                {/* 思考级别 - Google */}
                                {supportedOptions.thinkingLevel && (
                                  <div className="space-y-1">
                                    <Label className="text-xs">思考级别</Label>
                                    <Select
                                      value={model.options?.thinkingLevel || ''}
                                      onValueChange={(value) => handleUpdateModel(modelId, 'options', {
                                        ...model.options,
                                        thinkingLevel: value || undefined,
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="选择思考级别" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">浅度思考 (low)</SelectItem>
                                        <SelectItem value="high">深度思考 (high)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Google 模型的思考深度</p>
                                  </div>
                                )}
                              </div>

                              {/* 存储对话 */}
                              {supportedOptions.store && (
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <Label className="text-sm">存储对话</Label>
                                    <p className="text-xs text-muted-foreground">是否在 OpenAI 服务器存储对话历史</p>
                                  </div>
                                  <Switch
                                    checked={model.options?.store ?? false}
                                    onCheckedChange={(checked) => handleUpdateModel(modelId, 'options', {
                                      ...model.options,
                                      store: checked,
                                    })}
                                  />
                                </div>
                              )}

                              {/* 包含内容 */}
                              {supportedOptions.include && (
                                <div className="space-y-2">
                                  <Label className="text-xs">包含内容</Label>
                                  <Input
                                    value={model.options?.include?.join(', ') || ''}
                                    onChange={(e) => handleUpdateModel(modelId, 'options', {
                                      ...model.options,
                                      include: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                                    })}
                                    placeholder="reasoning.encrypted_content"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    指定要包含的额外内容，如加密的推理内容
                                  </p>
                                </div>
                              )}

                              {/* 扩展思考 - Anthropic */}
                              {supportedOptions.thinking && (
                                <div className="space-y-2 p-3 border rounded-lg">
                                  <Label className="text-sm">扩展思考</Label>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    启用 Claude 模型的深度思考能力，可设置思考预算
                                  </p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">状态</Label>
                                      <Select
                                        value={model.options?.thinking?.type || ''}
                                        onValueChange={(value) => {
                                          if (value === 'enabled') {
                                            // 启用时自动设置默认思考预算
                                            handleUpdateModel(modelId, 'options', {
                                              ...model.options,
                                              thinking: {
                                                type: 'enabled',
                                                budgetTokens: model.options?.thinking?.budgetTokens || 10000,
                                              },
                                            });
                                          } else if (value === 'disabled') {
                                            handleUpdateModel(modelId, 'options', {
                                              ...model.options,
                                              thinking: { type: 'disabled' },
                                            });
                                          } else {
                                            // 清除
                                            handleUpdateModel(modelId, 'options', {
                                              ...model.options,
                                              thinking: undefined,
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="选择状态" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="enabled">启用</SelectItem>
                                          <SelectItem value="disabled">禁用</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">思考预算 (Token 数)</Label>
                                      <Input
                                        type="number"
                                        value={model.options?.thinking?.type === 'enabled'
                                          ? (model.options?.thinking?.budgetTokens || 10000)
                                          : ''}
                                        onChange={(e) => handleUpdateModel(modelId, 'options', {
                                          ...model.options,
                                          thinking: {
                                            ...model.options?.thinking,
                                            type: model.options?.thinking?.type || 'enabled',
                                            budgetTokens: parseInt(e.target.value) || 10000,
                                          },
                                        })}
                                        placeholder="10000"
                                        disabled={model.options?.thinking?.type !== 'enabled'}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* 模型变体 - 根据 NPM 包动态显示 */}
                        {(() => {
                          const supportedOptions = getModelOptionsForNpm(editingProvider.npm);
                          const hasAnyOption = Object.values(supportedOptions).some(v => v);

                          if (!hasAnyOption) return null;

                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">模型变体</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setVariantModelId(modelId);
                                    setNewVariantName('');
                                    setVariantDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  添加变体
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                变体允许为同一模型定义不同的参数预设，可通过 Ctrl+T 切换
                              </p>
                              {model.variants && Object.entries(model.variants).map(([variantName, variant]) => (
                                <div key={variantName} className="p-3 border rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{variantName}</Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 h-6"
                                      onClick={() => {
                                        const { [variantName]: _, ...rest } = model.variants || {};
                                        handleUpdateModel(modelId, 'variants', Object.keys(rest).length > 0 ? rest : undefined);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* 推理强度 */}
                                    {supportedOptions.reasoningEffort && (
                                      <div className="space-y-1">
                                        <Label className="text-xs">推理强度</Label>
                                        <Select
                                          value={variant.reasoningEffort || ''}
                                          onValueChange={(value) => handleUpdateModel(modelId, 'variants', {
                                            ...model.variants,
                                            [variantName]: { ...variant, reasoningEffort: value || undefined },
                                          })}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue placeholder="选择" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="minimal">极简</SelectItem>
                                            <SelectItem value="low">低</SelectItem>
                                            <SelectItem value="medium">中等</SelectItem>
                                            <SelectItem value="high">高</SelectItem>
                                            <SelectItem value="xhigh">极高</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* 推理摘要 */}
                                    {supportedOptions.reasoningSummary && (
                                      <div className="space-y-1">
                                        <Label className="text-xs">推理摘要</Label>
                                        <Select
                                          value={variant.reasoningSummary || ''}
                                          onValueChange={(value) => handleUpdateModel(modelId, 'variants', {
                                            ...model.variants,
                                            [variantName]: { ...variant, reasoningSummary: value || undefined },
                                          })}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue placeholder="选择" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="auto">自动</SelectItem>
                                            <SelectItem value="detailed">详细</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* 输出详细度 */}
                                    {supportedOptions.textVerbosity && (
                                      <div className="space-y-1">
                                        <Label className="text-xs">输出详细度</Label>
                                        <Select
                                          value={variant.textVerbosity || ''}
                                          onValueChange={(value) => handleUpdateModel(modelId, 'variants', {
                                            ...model.variants,
                                            [variantName]: { ...variant, textVerbosity: value || undefined },
                                          })}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue placeholder="选择" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">简洁</SelectItem>
                                            <SelectItem value="medium">适中</SelectItem>
                                            <SelectItem value="high">详细</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* 思考级别 - Google */}
                                    {supportedOptions.thinkingLevel && (
                                      <div className="space-y-1">
                                        <Label className="text-xs">思考级别</Label>
                                        <Select
                                          value={variant.thinkingLevel || ''}
                                          onValueChange={(value) => handleUpdateModel(modelId, 'variants', {
                                            ...model.variants,
                                            [variantName]: { ...variant, thinkingLevel: value || undefined },
                                          })}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue placeholder="选择" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="low">浅度</SelectItem>
                                            <SelectItem value="high">深度</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveProvider} disabled={!editingProvider?.id}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加变体名称对话框 */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>添加模型变体</DialogTitle>
            <DialogDescription>
              为模型创建一个新的参数变体，可通过 Ctrl+T 在变体间切换
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="variant-name">变体名称</Label>
            <Input
              id="variant-name"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              placeholder="如: high, low, thinking"
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newVariantName.trim()) {
                  e.preventDefault();
                  if (editingProvider && variantModelId) {
                    const model = editingProvider.models[variantModelId];
                    if (model) {
                      handleUpdateModel(variantModelId, 'variants', {
                        ...model.variants,
                        [newVariantName.trim()]: {},
                      });
                    }
                  }
                  setVariantDialogOpen(false);
                  setNewVariantName('');
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              常用变体名称: high (高性能), low (低消耗), thinking (深度思考), fast (快速响应)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (editingProvider && variantModelId && newVariantName.trim()) {
                  const model = editingProvider.models[variantModelId];
                  if (model) {
                    handleUpdateModel(variantModelId, 'variants', {
                      ...model.variants,
                      [newVariantName.trim()]: {},
                    });
                  }
                }
                setVariantDialogOpen(false);
                setNewVariantName('');
              }}
              disabled={!newVariantName.trim()}
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
