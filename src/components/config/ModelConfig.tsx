// src/components/config/ModelConfig.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { useOpencodeModels } from '@/hooks/useOpencodeModels';
import { ConfigCard } from '@/components/layout/Card';
import { Input } from '@/components/ui/input';
import { ConfigSection } from '@/components/layout/ConfigSection';
import { SelectableCard } from '@/components/ui/selectable-card';
import { cn } from '@/lib/utils';
import { Cpu, Server, Target } from 'lucide-react';

type ModelTarget = 'model' | 'small_model';

export function ModelConfig() {
  const { config, updateConfig } = useConfigStore();
  const { modelsByProvider, isLoading, error } = useOpencodeModels();
  const [activeTarget, setActiveTarget] = useState<ModelTarget>('model');


  const handleModelSelect = (modelId: string) => {
    updateConfig({ [activeTarget]: modelId });
  };

  const targetLabels: Record<ModelTarget, string> = {
    model: '默认模型',
    small_model: '小模型',
  };

  return (
    <ConfigCard
      title="模型配置"
      description="配置默认使用的 AI 模型"
      icon={Cpu}
    >
      <div className="space-y-6">
        <ConfigSection
          title="目标模型"
          description="设置默认模型与小模型；下方选择模型会写入当前目标"
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div
              className={cn(
                'rounded-lg border p-3 transition-colors focus-ring cursor-pointer min-w-0',
                activeTarget === 'model'
                  ? 'border-ring bg-accent'
                  : 'border-border hover:border-ring hover:bg-accent'
              )}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTarget('model')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTarget('model');
                }
              }}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="min-w-0 flex-1 font-medium leading-snug" title="默认模型">默认模型</span>
                    {activeTarget === 'model' && (
                      <span className="shrink-0 flex items-center gap-1 text-xs text-ring" title="当前目标">
                        <Target className="h-3 w-3" />
                        当前目标
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                    <span className="shrink-0">格式：</span>
                    <span
                      className="min-w-0 flex-1 font-mono whitespace-nowrap truncate"
                      title="provider/model-id"
                    >
                      provider/model-id
                    </span>
                  </div>
                </div>
                <Input
                  id="model"
                  value={config.model || ''}
                  onChange={(e) => updateConfig({ model: e.target.value })}
                  onFocus={() => setActiveTarget('model')}
                  placeholder="anthropic/claude-sonnet-4-20250514"
                  className="w-full min-w-0 lg:w-[360px] lg:max-w-[360px] lg:flex-shrink-0"
                  title={config.model || ''}
                />
              </div>
            </div>

            <div
              className={cn(
                'rounded-lg border p-3 transition-colors focus-ring cursor-pointer min-w-0',
                activeTarget === 'small_model'
                  ? 'border-ring bg-accent'
                  : 'border-border hover:border-ring hover:bg-accent'
              )}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTarget('small_model')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTarget('small_model');
                }
              }}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="min-w-0 flex-1 font-medium leading-snug" title="小模型（轻量任务）">小模型（轻量任务）</span>
                    {activeTarget === 'small_model' && (
                      <span className="shrink-0 flex items-center gap-1 text-xs text-ring" title="当前目标">
                        <Target className="h-3 w-3" />
                        当前目标
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">用于轻量级任务，节省成本</div>
                </div>
                <Input
                  id="small_model"
                  value={config.small_model || ''}
                  onChange={(e) => updateConfig({ small_model: e.target.value })}
                  onFocus={() => setActiveTarget('small_model')}
                  placeholder="anthropic/claude-haiku-4-20250514"
                  className="w-full min-w-0 lg:w-[360px] lg:max-w-[360px] lg:flex-shrink-0"
                  title={config.small_model || ''}
                />
              </div>
            </div>
          </div>
        </ConfigSection>

        <ConfigSection
          title="快速选择"
          description={`点击模型将填充到「${targetLabels[activeTarget]}」`}
        >
          {Object.keys(modelsByProvider).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(modelsByProvider).map(([providerId, models]) => (
                <div key={providerId} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span className="font-medium">{providerId}</span>
                  </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                     {models.map((model) => {
                       const isSelectedForModel = config.model === model.fullId;
                       const isSelectedForSmall = config.small_model === model.fullId;
                       const selectedForActiveTarget =
                         (activeTarget === 'model' && isSelectedForModel) ||
                         (activeTarget === 'small_model' && isSelectedForSmall);

                       return (
                         <SelectableCard
                           key={model.fullId}
                           onClick={() => handleModelSelect(model.fullId)}
                           selected={selectedForActiveTarget}
                           className="p-2 text-sm text-foreground"
                           title={model.fullId}
                         >
                           <span className="block truncate" title={model.fullId}>{model.modelName}</span>
                           {/* 显示模型被哪些字段使用 */}
                           <div className="flex gap-1 mt-1">
                             {isSelectedForModel && (
                               <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-foreground">
                                 默认
                               </span>
                             )}
                             {isSelectedForSmall && (
                               <span className="text-[10px] px-1 py-0.5 rounded bg-success/10 text-success">
                                 小模型
                               </span>
                             )}
                           </div>
                         </SelectableCard>
                       );
                     })}
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
              <p>未能获取可用模型列表</p>
              <p className="mt-1">请确认已安装并可执行 `opencode models`</p>
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              {isLoading && <p className="mt-1 text-xs">正在加载模型列表...</p>}
            </div>
          )}
        </ConfigSection>
      </div>
    </ConfigCard>
  );
}
