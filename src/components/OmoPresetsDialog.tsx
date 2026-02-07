// src/components/OmoPresetsDialog.tsx
import { useMemo, useState } from 'react';
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
import { SelectableCard } from '@/components/ui/selectable-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Zap } from 'lucide-react';
import type { OmocPreset } from '@/types/oh-my-opencode';
import { configDiff } from '@/lib/configDiff';

interface OmoPresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OmoPresetsDialog({ open, onOpenChange }: OmoPresetsDialogProps) {
  const { config, applyPreset, undoLastApply } = useOhMyOpenCodeStore();
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<OmocPreset | null>(null);
  const [showAllChanges, setShowAllChanges] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);

  const computePresetAppliedConfig = (preset: OmocPreset) => {
    const currentConfig = config;
    return {
      ...currentConfig,
      ...preset.config,
      categories: {
        ...currentConfig.categories,
        ...preset.config.categories,
      },
      background_task: {
        ...currentConfig.background_task,
        ...preset.config.background_task,
        providerConcurrency: {
          ...currentConfig.background_task?.providerConcurrency,
          ...preset.config.background_task?.providerConcurrency,
        },
      },
    };
  };

  const changes = useMemo(() => {
    if (!selectedPreset) return [];
    const nextConfig = computePresetAppliedConfig(selectedPreset);
    return configDiff(config, nextConfig);
  }, [config, selectedPreset]);

  const changeSummary = useMemo(() => {
    let add = 0;
    let remove = 0;
    let modify = 0;
    changes.forEach((c) => {
      if (c.type === 'add') add += 1;
      else if (c.type === 'remove') remove += 1;
      else modify += 1;
    });
    return { add, remove, modify, total: changes.length };
  }, [changes]);

  const formatValue = (path: string, value: unknown): string => {
    if (value === undefined) return '—';
    if (value === null) return 'null';
    if (typeof value === 'string') {
      const masked = /(api\s*key|apikey|token|secret|password)/i.test(path)
        ? (value.trim().length > 8 ? `${value.slice(0, 2)}****${value.slice(-2)}` : '****')
        : value;
      return masked.length > 120 ? `${masked.slice(0, 80)}…${masked.slice(-20)}` : masked;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      const s = JSON.stringify(value);
      return s.length > 120 ? `${s.slice(0, 100)}…` : s;
    } catch {
      return '[unserializable]';
    }
  };

  const dispatchModifiedReset = () => {
    window.dispatchEvent(
      new CustomEvent('config-tool:modified-reset', {
        detail: { mode: 'oh-my-opencode' },
      })
    );
  };

  const performUndo = () => {
    undoLastApply();
    dispatchModifiedReset();
    toast({ title: '已撤销上一次变更', description: '已恢复到应用前的状态。' });
  };

  const requestUndo = () => {
    const needConfirm = useOhMyOpenCodeStore.getState().hasPostApplyEdits();
    if (needConfirm) {
      setUndoConfirmOpen(true);
      return;
    }
    performUndo();
  };

  const handleConfirmApply = (preset: OmocPreset) => {
    applyPreset(preset);
    toast({
      title: '预设已应用',
      description: `已应用 "${preset.name}"（${changeSummary.total} 项变更）`,
      action: (
        <Button variant="outline" size="sm" onClick={() => requestUndo()}>
          撤销
        </Button>
      ),
      duration: 8000,
    });
    setSelectedPreset(null);
    setShowAllChanges(false);
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
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedPreset(null);
            setShowAllChanges(false);
          }
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-secondary" />
            {selectedPreset ? '预览预设变更' : 'OMO 预设'}
          </DialogTitle>
          <DialogDescription>
            {selectedPreset
              ? `预设：${selectedPreset.name}`
              : '选择预设后将先展示变更预览。'}
          </DialogDescription>
        </DialogHeader>

        {!selectedPreset ? (
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
                      <SelectableCard
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset)}
                        className="p-4"
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
                      </SelectableCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedPreset.icon}</span>
                    <span className="font-medium text-foreground">{selectedPreset.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPreset.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">将应用 {changeSummary.total} 项变更</div>
                  <div className="mt-1 flex items-center gap-2 justify-end">
                    <Badge variant="secondary">+{changeSummary.add}</Badge>
                    <Badge variant="secondary">-{changeSummary.remove}</Badge>
                    <Badge variant="secondary">~{changeSummary.modify}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-background max-h-[340px] overflow-auto">
              {changes.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">无变更</div>
              ) : (
                <div className="divide-y">
                  {(showAllChanges ? changes : changes.slice(0, 10)).map((c, idx) => (
                    <div key={idx} className="p-3 text-sm">
                      <div className="font-mono text-xs text-muted-foreground truncate">{c.path || '(root)'}</div>
                      {c.type === 'add' && (
                        <div className="mt-1">
                          <span className="text-success font-medium">+</span>{' '}
                          <code className="text-xs">{formatValue(c.path, c.newValue)}</code>
                        </div>
                      )}
                      {c.type === 'remove' && (
                        <div className="mt-1">
                          <span className="text-destructive font-medium">-</span>{' '}
                          <code className="text-xs">{formatValue(c.path, c.oldValue)}</code>
                        </div>
                      )}
                      {c.type === 'modify' && (
                        <div className="mt-1 space-y-1">
                          <div>
                            <span className="text-warning font-medium">~</span>{' '}
                            <code className="text-xs">{formatValue(c.path, c.oldValue)}</code>
                          </div>
                          <div>
                            <span className="text-success font-medium">→</span>{' '}
                            <code className="text-xs">{formatValue(c.path, c.newValue)}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {!showAllChanges && changes.length > 10 && (
                    <div className="p-3">
                      <Button variant="outline" size="sm" onClick={() => setShowAllChanges(true)}>
                        展开全部（{changes.length}）
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPreset(null);
                  setShowAllChanges(false);
                }}
              >
                取消
              </Button>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleConfirmApply(selectedPreset)}>
                  应用预设
                </Button>
              </div>
            </div>
          </div>
        )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={undoConfirmOpen}
        title="确认撤销？"
        description="撤销会丢弃导入后产生的变更，包括你之后的手动修改。是否继续？"
        confirmLabel="继续撤销"
        confirmVariant="destructive"
        onCancel={() => setUndoConfirmOpen(false)}
        onConfirm={() => {
          setUndoConfirmOpen(false);
          performUndo();
        }}
      />
    </>
  );
}
