// src/components/TemplateDialog.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { BUILTIN_TEMPLATES, type ConfigTemplate } from '@/lib/templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectableCard } from '@/components/ui/selectable-card';
// Button imported for potential future use
import { LayoutTemplate } from 'lucide-react';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
  const { applyTemplate } = useConfigStore();

  const handleApplyTemplate = (template: ConfigTemplate) => {
    applyTemplate(template.config);
    onOpenChange(false);
  };

  const categories = [
    { id: 'general', name: '通用' },
    { id: 'security', name: '安全' },
    { id: 'local', name: '本地模型' },
    { id: 'enterprise', name: '企业级' },
    { id: 'custom', name: '自定义' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            配置模板
          </DialogTitle>
          <DialogDescription>
            选择一个预设模板快速配置 OpenCode
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => {
            const templates = BUILTIN_TEMPLATES.filter(t => t.category === category.id);
            if (templates.length === 0) return null;

            return (
              <div key={category.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <SelectableCard
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className="p-4"
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
                    </SelectableCard>
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
