// src/components/ImportExportDialog.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ConfigMode } from '@/components/layout/Sidebar';
import { ImportWizard } from '@/components/import/ImportWizard';
import { useFeatureFlagsStore } from '@/hooks/useFeatureFlags';
import { FieldMessage } from '@/components/layout/FieldMessage';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { buildJsonText } from '@/lib/buildJsonText';

interface ImportExportDialogProps {
  mode: 'import' | 'export' | null;
  configMode: ConfigMode;
  onClose: () => void;
}

export function ImportExportDialog({ mode, configMode, onClose }: ImportExportDialogProps) {
  const openCodeStore = useConfigStore();
  const omoStore = useOhMyOpenCodeStore();
  const { toast } = useToast();
  const { importWizardEnabled } = useFeatureFlagsStore();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeSensitiveInExport, setIncludeSensitiveInExport] = useState(false);
  const { ensureConsent, dialogProps } = useSensitiveConsent();

  const isOpenCodeMode = configMode === 'opencode';
  const configName = isOpenCodeMode ? 'OpenCode' : 'Oh My OpenCode';
  const fileName = isOpenCodeMode ? 'opencode.json' : 'oh-my-opencode.json';

  const isElectron = typeof window !== 'undefined' &&
    window.electronAPI !== undefined &&
    typeof window.electronAPI.saveFileDialog === 'function' &&
    typeof window.electronAPI.writeFile === 'function';

  const exportConfigObj = isOpenCodeMode ? openCodeStore.config : omoStore.config;
  const exportJson = mode === 'export'
    ? buildJsonText(exportConfigObj, { includeSensitive: includeSensitiveInExport, formatted: true })
    : '';

  const handleLegacyImport = () => {
    try {
      if (isOpenCodeMode) {
        openCodeStore.importConfig(importText);
      } else {
        const parsed = JSON.parse(importText);
        omoStore.setConfig(parsed);
      }
      toast({
        title: '导入成功',
        description: '变更尚未保存到磁盘。请点击「保存」写入配置文件。',
      });
      onClose();
    } catch (error) {
      toast({
        title: '导入失败',
        description: '无效的 JSON 格式',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    try {
      if (includeSensitiveInExport) {
        const ok = await ensureConsent('exportSensitive', {
          title: '复制包含敏感信息？',
          description: '复制到剪贴板将包含敏感信息（如 API Key/Token）。请确认当前环境安全，避免误粘贴或泄露。',
          confirmLabel: '继续复制',
        });
        if (!ok) return;
      }
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: '已复制到剪贴板',
        description: '你可以将内容粘贴到任意位置保存。',
      });
    } catch (e) {
      toast({
        title: '复制失败',
        description: e instanceof Error ? e.message : '无法写入剪贴板',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    if (includeSensitiveInExport) {
      const ok = await ensureConsent('exportSensitive', {
        title: '导出包含敏感信息？',
        description: '导出/下载的文件将包含敏感信息（如 API Key/Token）。请确认当前环境安全，并妥善保管导出文件。',
        confirmLabel: '继续导出',
      });
      if (!ok) return;
    }
    if (isElectron && window.electronAPI) {
      const savePath = await window.electronAPI.saveFileDialog(fileName);
      if (!savePath) return;
      await window.electronAPI.writeFile(savePath, exportJson);

      toast({
        title: `已导出：${fileName}`,
        description: `位置：${savePath}`,
        action: typeof window.electronAPI.showItemInFolder === 'function' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await window.electronAPI?.showItemInFolder(savePath);
              } catch {
                toast({
                  title: '无法打开文件位置',
                  description: '请检查系统权限或手动在文件管理器中定位。',
                  variant: 'destructive',
                });
              }
            }}
          >
            打开文件位置
          </Button>
        ) : undefined,
        duration: 8000,
      });
      return;
    }

    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: `已导出：${fileName}`,
      description: '文件已开始下载。',
    });
  };

  return (
    <Dialog open={mode !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'import' ? (
              <>
                <Upload className="h-5 w-5" />
                导入配置
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                导出配置
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'import'
              ? (importWizardEnabled
                ? '导入前会先进行校验并展示变更预览。支持文件、拖拽和粘贴。导入不会自动保存到磁盘。'
                : '在此粘贴 JSON 配置内容后导入。导入不会自动保存到磁盘。')
              : `复制或下载当前 ${configName} 配置`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === 'import' ? (
            importWizardEnabled ? (
              <ImportWizard configMode={configMode} onClose={onClose} />
            ) : (
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={isOpenCodeMode
                  ? '{"$schema": "https://opencode.ai/config.json", ...}'
                  : '{"$schema": "https://raw.githubusercontent.com/...", ...}'
                }
                rows={15}
                className="font-mono text-sm"
              />
            )
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label>包含敏感信息（API Key/Token 等）</Label>
                    <p className="text-xs text-muted-foreground">
                      默认关闭：导出内容会对敏感字段做脱敏处理，便于安全分享。
                    </p>
                  </div>
                  <Switch
                    checked={includeSensitiveInExport}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        setIncludeSensitiveInExport(false);
                        return;
                      }

                      (async () => {
                        const ok = await ensureConsent('revealSensitive', {
                          title: '显示敏感信息？',
                          description: '这会在屏幕上显示敏感信息。请确认当前环境安全，避免录屏/投屏泄露。',
                          confirmLabel: '继续显示',
                        });
                        if (!ok) return;
                        setIncludeSensitiveInExport(true);
                      })();
                    }}
                  />
                </div>

                {includeSensitiveInExport && (
                  <FieldMessage variant="warning" className="mt-2">
                    包含敏感信息的导出文件请妥善保管，避免泄露。复制/下载将包含敏感信息。
                  </FieldMessage>
                )}
              </div>

              <div className="relative">
                <Textarea
                  value={exportJson}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    title={includeSensitiveInExport ? '复制（含敏感信息）' : '复制（脱敏）'}
                    aria-label={includeSensitiveInExport ? '复制（含敏感信息）' : '复制（脱敏）'}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {(mode === 'export' || (mode === 'import' && !importWizardEnabled)) && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            {mode === 'import' ? (
              <Button onClick={handleLegacyImport} disabled={!importText.trim()}>
                导入
              </Button>
            ) : (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载 {fileName}
              </Button>
            )}
          </DialogFooter>
        )}

        <ConfirmDialog {...dialogProps} />
      </DialogContent>
    </Dialog>
  );
}
