// src/components/OmoPresetsDialog.tsx
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { OMOC_PRESETS } from '@/lib/oh-my-opencode-defaults';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Zap } from 'lucide-react';
import type { OmocPreset } from '@/types/oh-my-opencode';

interface OmoPresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OmoPresetsDialog({ open, onOpenChange }: OmoPresetsDialogProps) {
  const { applyPreset } = useOhMyOpenCodeStore();
  const { toast } = useToast();

  const handleApplyPreset = (preset: OmocPreset) => {
    applyPreset(preset);
    toast({
      title: '预设已应用',
      description: `已应用 "${preset.name}" 预设`,
    });
    onOpenChange(false);
  };

  // 按类型分组预设
  const presetGroups = [
    {
      id: 'performance',
      name: '性能优化',
      presets: OMOC_PRESETS.filter(p => ['performance', 'full-experience'].includes(p.id))
    },
    {
      id: 'cost',
      name: '成本控制',
      presets: OMOC_PRESETS.filter(p => ['budget', 'minimal'].includes(p.id))
    },
    {
      id: 'provider',
      name: '模型偏好',
      presets: OMOC_PRESETS.filter(p => ['google-first'].includes(p.id))
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            快速预设
          </DialogTitle>
          <DialogDescription>
            选择一个预设模板快速配置 Oh My OpenCode
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {presetGroups.map((group) => {
            if (group.presets.length === 0) return null;

            return (
              <div key={group.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {group.name}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {group.presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-4 text-left rounded-lg border border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{preset.icon}</span>
                        <span className="font-medium text-foreground">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
