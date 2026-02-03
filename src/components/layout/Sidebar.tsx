// src/components/layout/Sidebar.tsx
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Server,
  Bot,
  Shield,
  Plug,
  Keyboard,
  Palette,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Code2,
  Paintbrush,
  Minimize2,
  FlaskConical,
  MoreHorizontal,
} from 'lucide-react';

export type NavItem =
  | 'model'
  | 'provider'
  | 'agent'
  | 'permission'
  | 'mcp'
  | 'keybinds'
  | 'theme'
  | 'plugin'
  | 'instructions'
  | 'settings'
  | 'tui'
  | 'server'
  | 'lsp'
  | 'formatter'
  | 'compaction'
  | 'experimental'
  | 'misc';

interface SidebarProps {
  activeItem: NavItem;
  onItemChange: (item: NavItem) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'model', label: '模型配置', icon: Cpu },
  { id: 'provider', label: '模型提供商', icon: Server },
  { id: 'agent', label: '智能体', icon: Bot },
  { id: 'permission', label: '权限', icon: Shield },
  { id: 'mcp', label: 'MCP 服务器', icon: Plug },
  { id: 'keybinds', label: '快捷键', icon: Keyboard },
  { id: 'theme', label: '主题', icon: Palette },
  { id: 'plugin', label: '插件', icon: Package },
  { id: 'instructions', label: '指令', icon: FileText },
  { id: 'tui', label: 'TUI 设置', icon: Monitor },
  { id: 'server', label: '服务器', icon: Server },
  { id: 'lsp', label: 'LSP 配置', icon: Code2 },
  { id: 'formatter', label: '格式化器', icon: Paintbrush },
  { id: 'compaction', label: '上下文压缩', icon: Minimize2 },
  { id: 'experimental', label: '实验性功能', icon: FlaskConical },
  { id: 'misc', label: '其他', icon: MoreHorizontal },
  { id: 'settings', label: '其他设置', icon: Settings },
];

export function Sidebar({ activeItem, onItemChange, collapsed = false, onCollapsedChange }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* macOS Traffic Light Spacer - 为红绿灯按钮预留空间 */}
      <div className="h-8 flex-shrink-0 app-drag-region" />

      {/* Logo */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground">
            OpenCode 配置
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                collapsed ? 'px-2' : 'px-3',
                isActive && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              )}
              onClick={() => onItemChange(item.id)}
            >
              <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
}
