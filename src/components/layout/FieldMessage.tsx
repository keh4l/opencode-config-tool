import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type FieldMessageVariant = 'error' | 'warning' | 'info';

export interface FieldMessageProps {
  variant: FieldMessageVariant;
  children: ReactNode;
  className?: string;
}

export function FieldMessage({ variant, children, className }: FieldMessageProps) {
  const styles =
    variant === 'error'
      ? 'border-destructive/20 bg-destructive/10 text-destructive'
      : variant === 'warning'
        ? 'border-warning/20 bg-warning/10 text-warning'
        : 'border-info/20 bg-info/10 text-info';

  return (
    <div
      className={cn(
        'rounded-md border px-2 py-1 text-xs leading-snug',
        styles,
        className
      )}
    >
      {children}
    </div>
  );
}
