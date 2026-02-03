// src/components/config/omo/OmoPresetsPanel.tsx
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { OMOC_PRESETS } from '@/lib/oh-my-opencode-defaults';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useToast } from '@/hooks/use-toast';

export function OmoPresetsPanel() {
  const { applyPreset } = useOhMyOpenCodeStore();
  const { toast } = useToast();

  const handleApplyPreset = (preset: typeof OMOC_PRESETS[0]) => {
    applyPreset(preset);
    toast({
      title: '预设已应用',
      description: `已应用 "${preset.name}" 预设`,
    });
  };

  return (
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
            className="h-auto py-3 px-4 flex flex-col items-start text-left overflow-hidden"
            onClick={() => handleApplyPreset(preset)}
          >
            <span className="font-medium truncate w-full">{preset.name}</span>
            <span className="text-xs text-muted-foreground mt-1 w-full overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {preset.description}
            </span>
          </Button>
        ))}
      </div>
    </ConfigCard>
  );
}
