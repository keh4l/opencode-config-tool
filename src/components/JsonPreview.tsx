// src/components/JsonPreview.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { X, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { redactConfig } from '@/lib/sensitiveRedaction';
import { FieldMessage } from '@/components/layout/FieldMessage';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';

interface JsonPreviewProps {
  onClose: () => void;
  /** 默认 false：脱敏展示/复制 */
  includeSensitive?: boolean;
}

export function JsonPreview({ onClose, includeSensitive = false }: JsonPreviewProps) {
  const config = useConfigStore((s) => s.config);
  const [copied, setCopied] = useState(false);

  const { ensureConsent, dialogProps } = useSensitiveConsent();

  const [showSensitive, setShowSensitive] = useState(includeSensitive);

  const safeConfig = useMemo(() => {
    return showSensitive ? config : redactConfig(config);
  }, [config, showSensitive]);

  const json = useMemo(() => {
    return JSON.stringify(safeConfig, null, 2);
  }, [safeConfig]);

  const handleCopy = async () => {
    if (showSensitive) {
      const ok = await ensureConsent('copySensitive', {
        title: '复制包含敏感信息？',
        description: '复制到剪贴板将包含敏感信息（如 API Key/Token）。请确认当前环境安全，避免误粘贴或泄露。',
        confirmLabel: '继续复制',
      });
      if (!ok) return;
    }
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-medium">JSON 预览</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (showSensitive) {
                setShowSensitive(false);
                return;
              }
              (async () => {
                const ok = await ensureConsent('revealSensitive', {
                  title: '显示敏感信息？',
                  description: '这会在屏幕上显示敏感信息。请确认当前环境安全，避免录屏/投屏泄露。',
                  confirmLabel: '继续显示',
                });
                if (!ok) return;
                setShowSensitive(true);
              })();
            }}
            title={showSensitive ? '隐藏敏感信息' : '显示敏感信息'}
            aria-label={showSensitive ? '隐藏敏感信息' : '显示敏感信息'}
          >
            {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            title={showSensitive ? '复制（含敏感信息）' : '复制（脱敏）'}
            aria-label={showSensitive ? '复制（含敏感信息）' : '复制（脱敏）'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {showSensitive && (
        <div className="px-4 pt-3">
          <FieldMessage variant="warning">
            当前正在显示敏感信息（如 API Key/Token）。请确认环境安全，避免录屏/投屏泄露。
          </FieldMessage>
        </div>
      )}
      <pre className="flex-1 overflow-auto p-4 text-xs font-mono text-secondary-foreground">
        {json}
      </pre>

      <ConfirmDialog
        {...dialogProps}
      />
    </div>
  );
}
