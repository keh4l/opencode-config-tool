// src/components/config/TemplateDialog.tsx
import { useState, useMemo } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { BUILTIN_TEMPLATES, type ConfigTemplate } from '@/lib/templates';
import { redactConfig } from '@/lib/sensitiveRedaction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutTemplate, Search, Eye, Check, X } from 'lucide-react';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
  const { applyTemplate } = useConfigStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return BUILTIN_TEMPLATES;

    const query = searchQuery.toLowerCase();
    return BUILTIN_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group templates by category
  const categories = [
    { id: 'general', name: '通用' },
    { id: 'security', name: '安全' },
    { id: 'local', name: '本地模型' },
    { id: 'enterprise', name: '企业级' },
    { id: 'custom', name: '自定义' },
  ];

  const handleTemplateClick = (template: ConfigTemplate) => {
    setSelectedTemplate(template);
    setShowConfirm(true);
  };

  const handlePreview = (template: ConfigTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleConfirmApply = () => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate.config);
      setShowConfirm(false);
      setSelectedTemplate(null);
      onOpenChange(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setSelectedTemplate(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedTemplate(null);
      setShowPreview(false);
      setShowConfirm(false);
    }
    onOpenChange(open);
  };

  // Render template preview
  if (showPreview && selectedTemplate) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              模板预览: {selectedTemplate.icon} {selectedTemplate.name}
            </DialogTitle>
            <DialogDescription>{selectedTemplate.description}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              <code>{JSON.stringify(redactConfig(selectedTemplate.config), null, 2)}</code>
            </pre>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClosePreview}>
              <X className="h-4 w-4 mr-2" />
              关闭
            </Button>
            <Button
              onClick={() => {
                setShowPreview(false);
                setShowConfirm(true);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              应用此模板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render confirmation dialog
  if (showConfirm && selectedTemplate) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              确认应用模板
            </DialogTitle>
            <DialogDescription>
              您确定要应用以下模板吗？这将替换当前的配置。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-lg border border-border bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <span className="font-medium text-lg">{selectedTemplate.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedTemplate.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground">
                  {categories.find((c) => c.id === selectedTemplate.category)?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowConfirm(false);
                    setShowPreview(true);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  查看详情
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirm}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleConfirmApply}>
              <Check className="h-4 w-4 mr-2" />
              确认应用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render main template selection dialog
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            配置模板
          </DialogTitle>
          <DialogDescription>
            选择一个预设模板快速配置 OpenCode
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              未找到匹配的模板
            </div>
          ) : (
            categories.map((category) => {
              const templates = filteredTemplates.filter(
                (t) => t.category === category.id
              );
              if (templates.length === 0) return null;

              return (
                <div key={category.id}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative p-4 rounded-lg border border-border hover:border-ring hover:bg-accent transition-colors"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => handleTemplateClick(template)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{template.icon}</span>
                            <span className="font-medium text-foreground">
                              {template.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                        </div>

                        {/* Preview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
