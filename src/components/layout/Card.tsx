// src/components/layout/Card.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ConfigCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function ConfigCard({ title, description, icon: Icon, children, actions, badge, className }: ConfigCardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-xl border border-border',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-muted rounded-lg">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {badge}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
