import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { FieldMessage, type FieldMessageVariant } from '@/components/layout/FieldMessage';

export interface SettingRowProps {
  label: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  /**
   * Deprecated: use `messages` instead for consistent status rendering.
   * Kept for backward compatibility.
   */
  error?: ReactNode;
  /**
   * Status message slot (shown under description).
   * Precedence: error > warning > info. Only ONE message is shown.
   */
  messages?: {
    error?: ReactNode;
    warning?: ReactNode;
    info?: ReactNode;
  };
  children: ReactNode;
  className?: string;
}

export function SettingRow({ label, description, htmlFor, error, messages, children, className }: SettingRowProps) {
  const mergedMessages = {
    error: error,
    ...messages,
  };

  const activeVariant: FieldMessageVariant | null = mergedMessages.error
    ? 'error'
    : mergedMessages.warning
      ? 'warning'
      : mergedMessages.info
        ? 'info'
        : null;

  const activeMessage = activeVariant ? mergedMessages[activeVariant] : null;

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2',
        'md:grid-cols-[minmax(220px,1fr)_minmax(280px,420px)] md:gap-6',
        'py-3',
        className
      )}
    >
      <div className="space-y-1">
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
        </Label>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
        {activeMessage && activeVariant && (
          <FieldMessage variant={activeVariant} className="mt-1">
            {activeMessage}
          </FieldMessage>
        )}
      </div>
      <div className="min-w-0 flex items-center justify-end md:justify-start">
        {children}
      </div>
    </div>
  );
}
