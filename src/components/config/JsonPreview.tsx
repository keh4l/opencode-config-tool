// src/components/config/JsonPreview.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  FileJson
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { ConfigCard } from '@/components/layout/Card';

interface JsonPreviewProps {
  className?: string;
}

export function JsonPreview({ className = '' }: JsonPreviewProps) {
  const { config } = useConfigStore();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFormatted, setIsFormatted] = useState(true);

  // Generate JSON with validation
  const { json, isValid, error, size } = useMemo(() => {
    try {
      const formatted = isFormatted
        ? JSON.stringify(config, null, 2)
        : JSON.stringify(config);

      // Calculate size in KB
      const bytes = new Blob([formatted]).size;
      const kb = (bytes / 1024).toFixed(2);

      return {
        json: formatted,
        isValid: true,
        error: null,
        size: `${kb} KB`
      };
    } catch (err) {
      return {
        json: '',
        isValid: false,
        error: err instanceof Error ? err.message : '无效 JSON',
        size: '0 KB'
      };
    }
  }, [config, isFormatted]);

  // Syntax highlighting
  const highlightedJson = useMemo(() => {
    if (!isValid || !isFormatted) return json;

    return json
      .split('\n')
      .map((line, index) => {
        // Apply syntax highlighting
        let content = line;

        // Keys (property names)
        content = content.replace(
          /"([^"]+)":/g,
          '<span class="json-key">"$1"</span>:'
        );

        // String values
        content = content.replace(
          /: "([^"]*)"/g,
          ': <span class="json-string">"$1"</span>'
        );

        // Numbers
        content = content.replace(
          /: (\d+\.?\d*)/g,
          ': <span class="json-number">$1</span>'
        );

        // Booleans
        content = content.replace(
          /: (true|false)/g,
          ': <span class="json-boolean">$1</span>'
        );

        // Null
        content = content.replace(
          /: (null)/g,
          ': <span class="json-null">$1</span>'
        );

        // Brackets and braces
        content = content.replace(
          /([{}[\],])/g,
          '<span class="json-punctuation">$1</span>'
        );

        return (
          <div key={index} className="json-line">
            <span className="json-line-number">{index + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      });
  }, [json, isValid, isFormatted]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const toggleFormat = () => {
    setIsFormatted(!isFormatted);
  };

  return (
    <ConfigCard
      title="JSON 预览"
      description="实时查看当前配置的 JSON 格式"
      icon={FileJson}
      className={className}
    >
      <div className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-center gap-4">
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    有效 JSON
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    无效 JSON
                  </span>
                </>
              )}
            </div>

            {/* Size */}
            <div className="text-sm text-muted-foreground">
              大小: <span className="font-mono">{size}</span>
            </div>

            {/* Line Count */}
            {isFormatted && (
              <div className="text-sm text-muted-foreground">
                行数: <span className="font-mono">{json.split('\n').length}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Format Toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFormat}
              title={isFormatted ? '压缩' : '格式化'}
            >
              {isFormatted ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Collapse Toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? '折叠' : '展开'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Copy Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              disabled={!isValid}
              title="复制到剪贴板"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-xs">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="ml-1 text-xs">复制</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {!isValid && error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  JSON 验证错误
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* JSON Content */}
        {isExpanded && (
          <div className="relative">
            <div className="json-preview-container max-h-[600px] overflow-auto rounded-lg border border-border bg-muted">
              {isFormatted ? (
                <pre className="p-4 text-xs font-mono">
                  {highlightedJson}
                </pre>
              ) : (
                <pre className="p-4 text-xs font-mono text-secondary-foreground whitespace-pre-wrap break-all">
                  {json}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Collapsed State */}
        {!isExpanded && (
          <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            点击展开按钮查看 JSON 内容
          </div>
        )}
      </div>

      {/* Syntax Highlighting Styles */}
      <style>{`
        .json-preview-container {
          scrollbar-width: thin;
          scrollbar-color: rgb(148 163 184) transparent;
        }

        .json-preview-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .json-preview-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .json-preview-container::-webkit-scrollbar-thumb {
          background-color: rgb(148 163 184);
          border-radius: 4px;
        }

        .json-preview-container::-webkit-scrollbar-thumb:hover {
          background-color: rgb(100 116 139);
        }

        .json-line {
          display: flex;
          gap: 1rem;
        }

        .json-line:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }

        .json-line-number {
          display: inline-block;
          width: 3rem;
          text-align: right;
          color: rgb(148 163 184);
          user-select: none;
          flex-shrink: 0;
        }

        .json-key {
          color: rgb(59 130 246);
          font-weight: 500;
        }

        .dark .json-key {
          color: rgb(96 165 250);
        }

        .json-string {
          color: rgb(34 197 94);
        }

        .dark .json-string {
          color: rgb(74 222 128);
        }

        .json-number {
          color: rgb(249 115 22);
        }

        .dark .json-number {
          color: rgb(251 146 60);
        }

        .json-boolean {
          color: rgb(168 85 247);
          font-weight: 600;
        }

        .dark .json-boolean {
          color: rgb(192 132 252);
        }

        .json-null {
          color: rgb(148 163 184);
          font-style: italic;
        }

        .dark .json-null {
          color: rgb(148 163 184);
        }

        .json-punctuation {
          color: rgb(100 116 139);
        }

        .dark .json-punctuation {
          color: rgb(148 163 184);
        }
      `}</style>
    </ConfigCard>
  );
}
