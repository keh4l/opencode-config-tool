// src/components/config/omo/OmoBackgroundPanel.tsx
import { useState } from 'react';
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Plus, X } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoBackgroundPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();
  const [newModelId, setNewModelId] = useState('');
  const [newModelConcurrency, setNewModelConcurrency] = useState('');

  const handleAddModelConcurrency = () => {
    if (!newModelId || !newModelConcurrency) return;
    const currentConcurrency = { ...config.background_task?.modelConcurrency };
    currentConcurrency[newModelId] = parseInt(newModelConcurrency);
    updateConfig({
      background_task: {
        ...config.background_task,
        modelConcurrency: currentConcurrency
      }
    });
    setNewModelId('');
    setNewModelConcurrency('');
  };

  const handleRemoveModelConcurrency = (modelId: string) => {
    const { [modelId]: _, ...rest } = config.background_task?.modelConcurrency || {};
    updateConfig({
      background_task: {
        ...config.background_task,
        modelConcurrency: Object.keys(rest).length > 0 ? rest : undefined
      }
    });
  };

  return (
    <ConfigCard
      title="后台任务配置"
      description="配置后台任务的并发数和超时时间"
      icon={Settings2}
    >
      <div className="space-y-6">
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
          <Label className="mb-2 block">提供商并发配置</Label>
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

        <div>
          <Label className="mb-2 block">模型级并发配置</Label>
          <p className="text-xs text-muted-foreground mb-3">为特定模型设置并发数限制（如 anthropic/claude-opus-4-5: 2）</p>
          
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="模型 ID (如 anthropic/claude-opus-4-5)"
              value={newModelId}
              onChange={(e) => setNewModelId(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min="1"
              max="20"
              placeholder="并发数"
              value={newModelConcurrency}
              onChange={(e) => setNewModelConcurrency(e.target.value)}
              className="w-24"
            />
            <Button onClick={handleAddModelConcurrency} disabled={!newModelId || !newModelConcurrency} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {config.background_task?.modelConcurrency && Object.keys(config.background_task.modelConcurrency).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.background_task.modelConcurrency).map(([modelId, concurrency]) => (
                <Badge key={modelId} variant="secondary" className="gap-1 pl-2">
                  <span className="font-mono text-xs">{modelId}: {concurrency}</span>
                  <button onClick={() => handleRemoveModelConcurrency(modelId)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConfigCard>
  );
}
