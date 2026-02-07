// src/components/layout/LoadingOverlay.tsx
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = '正在加载配置...' }: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
