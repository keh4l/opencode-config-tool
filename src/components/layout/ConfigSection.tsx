import { ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface ConfigSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function ConfigSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: ConfigSectionProps) {
  if (!collapsible) {
    return (
      <section className={cn('space-y-3', className)}>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="space-y-2">{children}</div>
      </section>
    );
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className={cn('space-y-3', className)}>
      <CollapsibleTrigger asChild>
        <button type="button" className="w-full flex items-center justify-between rounded-md hover:bg-accent px-2 py-1 focus-ring">
          <div className="text-left">
            <div className="text-sm font-medium text-foreground">{title}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}
