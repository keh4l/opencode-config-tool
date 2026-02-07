import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SelectableCard } from '@/components/ui/selectable-card';
import { useToast } from '@/components/ui/use-toast';
import type { ConfigMode } from '@/components/layout/Sidebar';
import type { OpenCodeConfig } from '@/types/config';
import type { OhMyOpenCodeConfig } from '@/types/oh-my-opencode';
import { importValidator } from '@/lib/importValidator';
import { KNOWN_OMOC_TOP_LEVEL_KEYS, KNOWN_OPENCODE_TOP_LEVEL_KEYS } from '@/lib/knownTopLevelKeys';
import { deepMerge } from '@/lib/deepMerge';
import { configDiff } from '@/lib/configDiff';
import { isSensitivePath, redactConfig, redactDiff, redactValue } from '@/lib/sensitiveRedaction';
import { useConfigStore } from '@/hooks/useConfig';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { useFeatureFlagsStore } from '@/hooks/useFeatureFlags';
import { Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FieldMessage } from '@/components/layout/FieldMessage';
import { getEffectiveFeatureFlag } from '@/lib/featureFlags';

type Strategy = 'overwrite' | 'merge';

const isElectron = (): boolean => {
  return typeof window !== 'undefined' &&
    window.electronAPI !== undefined &&
    typeof window.electronAPI.readFile === 'function';
};

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
};

const valueToString = (path: string, value: unknown, revealSensitive: boolean): string => {
  if (!revealSensitive) {
    if (isSensitivePath(path)) return redactValue(value);
    if (Array.isArray(value) || isPlainObject(value)) {
      try {
        return JSON.stringify(redactConfig(value));
      } catch {
        return '[无法序列化]';
      }
    }
  }
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '[无法序列化]';
  }
};

const formatValue = (
  path: string,
  value: unknown,
  expanded: boolean
  ,
  revealSensitive: boolean
): { text: string; canToggle: boolean } => {
  const raw = valueToString(path, value, revealSensitive);
  const canToggle = raw.length > 120;
  if (expanded) return { text: raw, canToggle };
  if (!canToggle) return { text: raw, canToggle };
  return { text: `${raw.slice(0, 80)}…${raw.slice(-20)}`, canToggle };
};

export interface ImportWizardProps {
  configMode: ConfigMode;
  onClose: () => void;
}

export function ImportWizard({ configMode, onClose }: ImportWizardProps) {
  const { toast } = useToast();
  const openCodeStore = useConfigStore();
  const omoStore = useOhMyOpenCodeStore();
  const step2EnhancementsStored = useFeatureFlagsStore((s) => s.importWizardStep2EnhancementsEnabled);
  const step2EnhancementsEnabled = getEffectiveFeatureFlag('importWizardStep2EnhancementsEnabled', step2EnhancementsStored);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [raw, setRaw] = useState('');
  const [strategy, setStrategy] = useState<Strategy>('merge');
  const [inputError, setInputError] = useState<string | null>(null);
  const [diffTypeFilter, setDiffTypeFilter] = useState<'all' | 'add' | 'modify' | 'remove'>('all');
  const [expandedValueKeys, setExpandedValueKeys] = useState<Record<string, boolean>>({});
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [undoCloseAfter, setUndoCloseAfter] = useState(false);
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [revealSensitiveConfirmOpen, setRevealSensitiveConfirmOpen] = useState(false);
  const [revealSensitiveConfirmed, setRevealSensitiveConfirmed] = useState(false);
  // Snapshot the config being compared against so Step3 can still show the preview diff
  // after the store config has been updated.
  const [baselineConfig, setBaselineConfig] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isOpenCodeMode = configMode === 'opencode';
  const configName = isOpenCodeMode ? 'OpenCode' : 'Oh My OpenCode';

  const currentConfig = isOpenCodeMode ? openCodeStore.config : omoStore.config;
  const compareBase = baselineConfig ?? (isPlainObject(currentConfig) ? currentConfig : null);
  const knownTopLevelKeys = useMemo(() => {
    // NOTE: Do NOT derive from defaults (defaults omit many valid fields), otherwise exported configs show false warnings.
    return isOpenCodeMode ? KNOWN_OPENCODE_TOP_LEVEL_KEYS : KNOWN_OMOC_TOP_LEVEL_KEYS;
  }, [isOpenCodeMode]);

  const validation = useMemo(() => {
    return importValidator<Record<string, unknown>>(raw, { knownTopLevelKeys });
  }, [raw, knownTopLevelKeys]);

  const parsedConfig = validation.parsed;

  const computedNextConfig = useMemo(() => {
    if (!validation.ok || !parsedConfig) return null;
    if (!compareBase) return null;

    const incoming = parsedConfig;
    if (strategy === 'overwrite') {
      return { ...incoming };
    }

    return deepMerge(
      compareBase,
      incoming as Record<string, unknown>
    );
  }, [validation.ok, parsedConfig, compareBase, strategy]);

  const diffItems = useMemo(() => {
    if (!computedNextConfig) return [];
    return configDiff(compareBase, computedNextConfig);
  }, [compareBase, computedNextConfig]);

  const hasSensitiveData = useMemo(() => {
    const hasSensitiveImportWarning = validation.issues.some((i) => i.message.includes('敏感字段'));
    const hasSensitiveDiffPath = diffItems.some((d) => isSensitivePath(d.path));
    return hasSensitiveImportWarning || hasSensitiveDiffPath;
  }, [diffItems, validation.issues]);

  const diffSummary = useMemo(() => {
    let add = 0;
    let remove = 0;
    let modify = 0;
    diffItems.forEach((d) => {
      if (d.type === 'add') add += 1;
      else if (d.type === 'remove') remove += 1;
      else modify += 1;
    });
    return { add, remove, modify, total: diffItems.length };
  }, [diffItems]);

  const diffWithIndex = useMemo(() => {
    return diffItems.map((d, index) => ({ d, index }));
  }, [diffItems]);

  const effectiveDiffTypeFilter = step2EnhancementsEnabled ? diffTypeFilter : 'all';

  const visibleDiffWithIndex = useMemo(() => {
    if (effectiveDiffTypeFilter === 'all') return diffWithIndex;
    return diffWithIndex.filter(({ d }) => d.type === effectiveDiffTypeFilter);
  }, [effectiveDiffTypeFilter, diffWithIndex]);

  const canGoNext = raw.trim().length > 0;
  const hasErrors = validation.issues.some((i) => i.level === 'error');
  const canApply = validation.ok && !hasErrors && computedNextConfig !== null;

  const handleClose = () => {
    setBaselineConfig(null);
    setExpandedValueKeys({});
    setDiffTypeFilter('all');
    setRevealSensitive(false);
    setRevealSensitiveConfirmOpen(false);
    onClose();
  };

  const dispatchModifiedReset = () => {
    window.dispatchEvent(
      new CustomEvent('config-tool:modified-reset', {
        detail: { mode: configMode },
      })
    );
  };

  const performUndo = () => {
    if (isOpenCodeMode) {
      useConfigStore.getState().undoLastApply();
    } else {
      useOhMyOpenCodeStore.getState().undoLastApply();
    }
    dispatchModifiedReset();
  };

  const shouldConfirmUndo = () => {
    if (isOpenCodeMode) return useConfigStore.getState().hasPostApplyEdits();
    return useOhMyOpenCodeStore.getState().hasPostApplyEdits();
  };

  const requestUndo = (closeAfter: boolean) => {
    setUndoCloseAfter(closeAfter);
    if (shouldConfirmUndo()) {
      setUndoConfirmOpen(true);
      return;
    }
    performUndo();
    toast({ title: '已撤销本次导入', description: '已恢复到导入前的状态。' });
    if (closeAfter) handleClose();
  };

  const buildCopyText = () => {
    const maxLines = 50;
    const filterLabel = effectiveDiffTypeFilter === 'all'
      ? '全部'
      : effectiveDiffTypeFilter === 'add'
        ? '新增'
        : effectiveDiffTypeFilter === 'modify'
          ? '修改'
          : '删除';

    const header = `变更摘要：➕${diffSummary.add} 🔄${diffSummary.modify} ➖${diffSummary.remove}（共 ${diffSummary.total} 项）\n筛选：${filterLabel}`;

    const lines = visibleDiffWithIndex.slice(0, maxLines).map(({ d }) => {
      const safe = redactDiff(d);
      const path = safe.path || '(root)';
      if (safe.type === 'add') {
        return `➕ ${path}: ${formatValue(path, safe.newValue, false, false).text}`;
      }
      if (safe.type === 'remove') {
        return `➖ ${path}: ${formatValue(path, safe.oldValue, false, false).text}`;
      }
      return `🔄 ${path}: ${formatValue(path, safe.oldValue, false, false).text} -> ${formatValue(path, safe.newValue, false, false).text}`;
    });

    const truncated = visibleDiffWithIndex.length > maxLines;
    return {
      text: [header, ...lines, truncated ? `（已截断，仅包含前 ${maxLines} 条变更）` : ''].filter(Boolean).join('\n'),
      truncated,
      maxLines,
    };
  };

  const readFromFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      toast({
        title: '文件类型不支持',
        description: '请选择 .json 配置文件。',
        variant: 'destructive',
      });
      return;
    }
    const text = await file.text();
    setRaw(text);
  };

  const handlePickFile = async () => {
    if (isElectron() && window.electronAPI) {
      try {
        const filePath = await window.electronAPI.openFileDialog();
        if (!filePath) return;
        const content = await window.electronAPI.readFile(filePath);
        setRaw(content);
      } catch {
        toast({
          title: '无法读取文件',
          description: '请检查文件权限或稍后重试。',
          variant: 'destructive',
        });
      }
      return;
    }

    fileInputRef.current?.click();
  };

  const handleApply = () => {
    if (!canApply || !parsedConfig) return;

    if (isOpenCodeMode) {
      useConfigStore.getState().applyImportedConfig(parsedConfig as unknown as OpenCodeConfig, strategy);
      toast({
        title: '导入成功',
        description: `${configName} 配置已${strategy === 'overwrite' ? '覆盖' : '合并'}应用（${diffSummary.total} 项变更）`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestUndo(true)}
          >
            撤销
          </Button>
        ),
        duration: 8000,
      });
    } else {
      useOhMyOpenCodeStore.getState().applyImportedConfig(parsedConfig as unknown as OhMyOpenCodeConfig, strategy);
      toast({
        title: '导入成功',
        description: `${configName} 配置已${strategy === 'overwrite' ? '覆盖' : '合并'}应用（${diffSummary.total} 项变更）`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestUndo(true)}
          >
            撤销
          </Button>
        ),
        duration: 8000,
      });
    }

    setStep(3);
  };

  const renderStepIndicator = () => {
    const items: { id: 1 | 2 | 3; label: string }[] = [
      { id: 1, label: '选择来源' },
      { id: 2, label: '校验与预览' },
      { id: 3, label: '应用结果' },
    ];
    return (
      <div className="flex items-center gap-2">
        {items.map((it) => (
          <Badge key={it.id} variant={step === it.id ? 'default' : 'secondary'}>
            {it.id}. {it.label}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {renderStepIndicator()}
        <div className="text-xs text-muted-foreground">{configName}</div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div
            className="rounded-lg border border-dashed p-4 bg-surface-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              await readFromFile(file);
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>将配置文件拖拽到此处</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.jsonc,application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await readFromFile(file);
                    e.target.value = '';
                  }}
                />
                <Button variant="outline" size="sm" onClick={handlePickFile}>
                  选择文件…
                </Button>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              支持 .json 文件。导入不会自动保存到磁盘。
            </div>
          </div>

          <div className="space-y-2">
            <Label>粘贴 JSON</Label>
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder="在此粘贴 JSON 配置内容…"
            />
            {!validation.ok && validation.jsonError && (
              <p className="text-xs text-destructive">{validation.jsonError}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button
              onClick={() => {
                setInputError(null);
                if (!raw.trim()) {
                  setInputError('内容为空');
                  toast({ title: '内容为空', description: '请粘贴 JSON 配置内容后继续。', variant: 'destructive' });
                  return;
                }
                // Capture baseline at the moment we enter preview.
                if (isPlainObject(currentConfig)) {
                  setBaselineConfig(structuredClone(currentConfig));
                } else {
                  setBaselineConfig(null);
                }
                setStep(2);
              }}
              disabled={!canGoNext || !validation.ok}
            >
              验证并预览 →
            </Button>
          </div>
          {inputError && (
            <p className="text-xs text-destructive">{inputError}</p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">校验与预览</div>
            <div className="text-xs text-muted-foreground">{configName}</div>
          </div>

          <div className="rounded-lg border p-3 bg-muted/30">
            <div className="flex items-start gap-2">
              {hasErrors ? (
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {validation.ok ? 'JSON 格式有效' : 'JSON 解析失败'}
                </div>
                {(() => {
                  const errorCount = validation.issues.filter((i) => i.level === 'error').length;
                  const warningCount = validation.issues.filter((i) => i.level === 'warning').length;
                  if (errorCount > 0) {
                    return (
                      <FieldMessage variant="error" className="bg-transparent">
                        存在 {errorCount} 个错误，无法继续
                      </FieldMessage>
                    );
                  }
                  if (warningCount > 0) {
                    return (
                      <FieldMessage variant="warning" className="bg-transparent">
                        发现 {warningCount} 个警告（仍可继续）
                      </FieldMessage>
                    );
                  }
                  return (
                    <FieldMessage variant="info" className="bg-transparent">
                      结构校验通过
                    </FieldMessage>
                  );
                })()}
              </div>
            </div>

            {hasSensitiveData && (
              <div className="mt-2 flex items-start justify-between gap-2">
                <FieldMessage variant="warning" className="bg-transparent flex-1">
                  检测到敏感字段（如 API Key/Token），已默认隐藏其值。
                </FieldMessage>
                <Button
                  type="button"
                  size="sm"
                  variant={revealSensitive ? 'secondary' : 'outline'}
                  onClick={() => {
                    if (revealSensitive) {
                      setRevealSensitive(false);
                      return;
                    }
                    if (!revealSensitiveConfirmed) {
                      setRevealSensitiveConfirmOpen(true);
                      return;
                    }
                    setRevealSensitive(true);
                  }}
                >
                  {revealSensitive ? '隐藏敏感值' : '显示敏感值'}
                </Button>
              </div>
            )}

            {validation.issues.length > 0 && (
              <div className="mt-3 space-y-1">
                {[...validation.issues]
                  .sort((a, b) => {
                    const ra = a.level === 'error' ? 0 : 1;
                    const rb = b.level === 'error' ? 0 : 1;
                    return ra - rb;
                  })
                  .slice(0, 8)
                  .map((issue, idx) => (
                  <FieldMessage
                    key={idx}
                    variant={issue.level === 'error' ? 'error' : 'warning'}
                    className="bg-transparent"
                  >
                    {issue.path ? `[${issue.path}] ` : ''}{issue.message}
                  </FieldMessage>
                ))}
                {validation.issues.length > 8 && (
                  <div className="text-xs text-muted-foreground">… 还有 {validation.issues.length - 8} 条</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>应用方式</Label>
            <div className="grid grid-cols-2 gap-2">
              <SelectableCard
                selectionRole="radio"
                selected={strategy === 'merge'}
                onClick={() => setStrategy('merge')}
                className="p-3"
              >
                <div className="font-medium">合并到当前配置（Merge）</div>
                <div className="text-xs text-muted-foreground">导入内容会覆盖同名字段，未提供的字段将保留当前值。</div>
              </SelectableCard>
              <SelectableCard
                selectionRole="radio"
                selected={strategy === 'overwrite'}
                onClick={() => setStrategy('overwrite')}
                className="p-3"
              >
                <div className="font-medium">覆盖当前配置（Overwrite）</div>
                <div className="text-xs text-muted-foreground">使用导入内容完全替换当前配置。</div>
              </SelectableCard>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>变更摘要</Label>
              <div className="text-xs text-muted-foreground">➕{diffSummary.add} 🔄{diffSummary.modify} ➖{diffSummary.remove}</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              {step2EnhancementsEnabled ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={diffTypeFilter === 'all' ? 'secondary' : 'outline'}
                      onClick={() => setDiffTypeFilter('all')}
                    >
                      全部
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={diffTypeFilter === 'add' ? 'secondary' : 'outline'}
                      onClick={() => setDiffTypeFilter('add')}
                    >
                      新增
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={diffTypeFilter === 'modify' ? 'secondary' : 'outline'}
                      onClick={() => setDiffTypeFilter('modify')}
                    >
                      修改
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={diffTypeFilter === 'remove' ? 'secondary' : 'outline'}
                      onClick={() => setDiffTypeFilter('remove')}
                    >
                      删除
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const { text, truncated, maxLines } = buildCopyText();
                        await navigator.clipboard.writeText(text);
                        toast({
                          title: '已复制变更摘要',
                          description: truncated ? `已复制前 ${maxLines} 条（已截断）` : '已复制全部变更摘要',
                        });
                      } catch (e) {
                        toast({
                          title: '复制失败',
                          description: e instanceof Error ? e.message : '无法写入剪贴板',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    复制变更摘要
                  </Button>
                </>
              ) : (
                <div />
              )}
            </div>

            <div className="max-h-[260px] overflow-auto rounded-lg border bg-background">
              {visibleDiffWithIndex.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">无变更</div>
              ) : (
                <div className="divide-y">
                  {visibleDiffWithIndex.slice(0, 80).map(({ d, index }) => (
                    <div key={index} className="p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-muted-foreground truncate">{d.path || '(root)'}</div>
                          {d.type === 'add' && (
                            <div className="mt-1">
                              <span className="text-success font-medium">+</span>{' '}
                              {(() => {
                                 const k = `v:${index}:new`;
                                 const expanded = step2EnhancementsEnabled && !!expandedValueKeys[k];
                                 const { text, canToggle } = formatValue(d.path, d.newValue, expanded, revealSensitive);
                                 return (
                                   <span className="inline-flex items-center gap-2 min-w-0">
                                     <code className="text-xs break-all">{text}</code>
                                     {step2EnhancementsEnabled && canToggle && (
                                       <button
                                         type="button"
                                         className="text-xs text-muted-foreground hover:text-foreground focus-ring rounded-sm px-1"
                                         onClick={() => setExpandedValueKeys((prev) => ({ ...prev, [k]: !expanded }))}
                                       >
                                         {expanded ? '收起' : '展开'}
                                       </button>
                                     )}
                                   </span>
                                 );
                               })()}
                            </div>
                          )}
                          {d.type === 'remove' && (
                            <div className="mt-1">
                              <span className="text-destructive font-medium">-</span>{' '}
                              {(() => {
                                 const k = `v:${index}:old`;
                                 const expanded = step2EnhancementsEnabled && !!expandedValueKeys[k];
                                 const { text, canToggle } = formatValue(d.path, d.oldValue, expanded, revealSensitive);
                                 return (
                                   <span className="inline-flex items-center gap-2 min-w-0">
                                     <code className="text-xs break-all">{text}</code>
                                     {step2EnhancementsEnabled && canToggle && (
                                       <button
                                         type="button"
                                         className="text-xs text-muted-foreground hover:text-foreground focus-ring rounded-sm px-1"
                                         onClick={() => setExpandedValueKeys((prev) => ({ ...prev, [k]: !expanded }))}
                                       >
                                         {expanded ? '收起' : '展开'}
                                       </button>
                                     )}
                                   </span>
                                 );
                               })()}
                            </div>
                          )}
                          {d.type === 'modify' && (
                            <div className="mt-1 space-y-1">
                              <div>
                                <span className="text-warning font-medium">~</span>{' '}
                                {(() => {
                                   const k = `v:${index}:old`;
                                   const expanded = step2EnhancementsEnabled && !!expandedValueKeys[k];
                                   const { text, canToggle } = formatValue(d.path, d.oldValue, expanded, revealSensitive);
                                   return (
                                     <span className="inline-flex items-center gap-2 min-w-0">
                                       <code className="text-xs break-all">{text}</code>
                                       {step2EnhancementsEnabled && canToggle && (
                                         <button
                                           type="button"
                                           className="text-xs text-muted-foreground hover:text-foreground focus-ring rounded-sm px-1"
                                           onClick={() => setExpandedValueKeys((prev) => ({ ...prev, [k]: !expanded }))}
                                         >
                                           {expanded ? '收起' : '展开'}
                                         </button>
                                       )}
                                     </span>
                                   );
                                 })()}
                              </div>
                              <div>
                                <span className="text-success font-medium">→</span>{' '}
                                {(() => {
                                   const k = `v:${index}:new`;
                                   const expanded = step2EnhancementsEnabled && !!expandedValueKeys[k];
                                   const { text, canToggle } = formatValue(d.path, d.newValue, expanded, revealSensitive);
                                   return (
                                     <span className="inline-flex items-center gap-2 min-w-0">
                                       <code className="text-xs break-all">{text}</code>
                                       {step2EnhancementsEnabled && canToggle && (
                                         <button
                                           type="button"
                                           className="text-xs text-muted-foreground hover:text-foreground focus-ring rounded-sm px-1"
                                           onClick={() => setExpandedValueKeys((prev) => ({ ...prev, [k]: !expanded }))}
                                         >
                                           {expanded ? '收起' : '展开'}
                                         </button>
                                       )}
                                     </span>
                                   );
                                 })()}
                              </div>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {d.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {visibleDiffWithIndex.length > 80 && (
                    <div className="p-3 text-xs text-muted-foreground">… 还有 {visibleDiffWithIndex.length - 80} 项</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setBaselineConfig(null);
                setExpandedValueKeys({});
                setDiffTypeFilter('all');
                setStep(1);
              }}
            >
              ← 返回
            </Button>
            <Button onClick={handleApply} disabled={!canApply}>
              应用变更
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div className="font-medium">已应用变更</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {diffSummary.total === 0 ? '未检测到任何变更。' : `共应用 ${diffSummary.total} 项变更。`}
              <div className="mt-1">变更尚未保存到磁盘。请点击「保存」写入配置文件。</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => requestUndo(true)}
            >
              撤销本次导入
            </Button>
            <Button onClick={handleClose}>
              完成
            </Button>
          </div>
        </div>
      )}

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
          toast({ title: '已撤销本次导入', description: '已恢复到导入前的状态。' });
          if (undoCloseAfter) handleClose();
        }}
      />

      <ConfirmDialog
        open={revealSensitiveConfirmOpen}
        title="显示敏感值？"
        description="这可能暴露 API Key/Token。请确认当前环境安全。"
        confirmLabel="继续显示"
        confirmVariant="destructive"
        onCancel={() => setRevealSensitiveConfirmOpen(false)}
        onConfirm={() => {
          setRevealSensitiveConfirmOpen(false);
          setRevealSensitiveConfirmed(true);
          setRevealSensitive(true);
        }}
      />
    </div>
  );
}
