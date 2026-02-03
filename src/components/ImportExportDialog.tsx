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
import { Upload, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { ConfigMode } from '@/components/layout/Sidebar';

interface ImportExportDialogProps {
  mode: 'import' | 'export' | null;
  configMode: ConfigMode;
  onClose: () => void;
}

export function ImportExportDialog({ mode, configMode, onClose }: ImportExportDialogProps) {
  const openCodeStore = useConfigStore();
  const omoStore = useOhMyOpenCodeStore();
  const { toast } = useToast();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);

  const isOpenCodeMode = configMode === 'opencode';
  const configName = isOpenCodeMode ? 'OpenCode' : 'Oh My OpenCode';
  const fileName = isOpenCodeMode ? 'opencode.json' : 'oh-my-opencode.json';

  // 根据模式选择对应的导出函数
  const exportJson = mode === 'export'
    ? (isOpenCodeMode ? openCodeStore.exportConfig() : JSON.stringify(omoStore.config, null, 2))
    : '';

  const handleImport = () => {
    try {
      if (isOpenCodeMode) {
        openCodeStore.importConfig(importText);
      } else {
        const parsed = JSON.parse(importText);
        omoStore.setConfig(parsed);
      }
      toast({
        title: '导入成功',
        description: `${configName} 配置已成功导入`,
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
    await navigator.clipboard.writeText(exportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: '已复制',
      description: `${configName} 配置已复制到剪贴板`,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={mode !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'import' ? (
              <>
                <Upload className="h-5 w-5" />
                导入 {configName} 配置
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                导出 {configName} 配置
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'import'
              ? `粘贴 ${configName} JSON 配置内容导入`
              : `复制或下载当前 ${configName} 配置`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === 'import' ? (
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
          ) : (
            <div className="relative">
              <Textarea
                value={exportJson}
                readOnly
                rows={15}
                className="font-mono text-sm"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          {mode === 'import' ? (
            <Button onClick={handleImport} disabled={!importText}>
              导入
            </Button>
          ) : (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              下载 {fileName}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
