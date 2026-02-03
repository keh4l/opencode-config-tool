// src/components/config/omo/OmoBackgroundPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings2 } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoBackgroundPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();

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
      </div>
    </ConfigCard>
  );
}
