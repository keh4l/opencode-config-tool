// src/components/layout/Sidebar.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useFeatureFlagsStore } from '@/hooks/useFeatureFlags';
import { getEffectiveFeatureFlag } from '@/lib/featureFlags';
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
  Sparkles,
  Layers,
  Terminal,
  Ban,
  Settings2,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';

// OpenCode 导航项类型
export type OpenCodeNavItem =
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

// Oh My OpenCode 导航项类型
export type OmoNavItem =
  | 'omo-agents'
  | 'omo-categories'
  | 'omo-background'
  | 'omo-tmux'
  | 'omo-sisyphus'
  | 'omo-disabled'
  | 'omo-claude-code'
  | 'omo-experimental';

// 统一导航项类型
export type NavItem = OpenCodeNavItem | OmoNavItem;

// 配置模式类型
export type ConfigMode = 'opencode' | 'oh-my-opencode';

interface SidebarProps {
  activeItem: NavItem;
  onItemChange: (item: NavItem) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  configMode: ConfigMode;
  modifiedItems?: Record<string, boolean>;
}

type NavDef = { id: NavItem; label: string; icon: React.ElementType; keywords?: string[] };
type NavGroup = { id: string; label: string; items: NavDef[] };

const openCodeNavGroups: NavGroup[] = [
  {
    id: 'oc-models',
    label: '模型与提供商',
    items: [
      { id: 'model', label: '模型配置', icon: Cpu, keywords: ['model', 'small_model', 'temperature', 'reasoning', 'thinking', 'limit', 'context', 'output', 'modalities'] },
      {
        id: 'provider',
        label: '模型提供商',
        icon: Server,
        keywords: ['provider', 'providers', 'api', 'apikey', 'api key', 'token', 'baseurl', 'base url', 'headers'],
      },
    ],
  },
  {
    id: 'oc-agents-tools',
    label: '智能体与工具',
    items: [
      { id: 'agent', label: '智能体', icon: Bot, keywords: ['agent', 'subagent', 'tools', 'prompt', 'permissions', 'model', 'variant'] },
      { id: 'mcp', label: 'MCP 服务器', icon: Plug, keywords: ['mcp', 'server', 'local', 'remote', 'oauth', 'headers', 'timeout'] },
      { id: 'permission', label: '权限', icon: Shield, keywords: ['permission', 'allow', 'deny', 'ask', 'bash', 'edit', 'read', 'glob', 'grep'] },
    ],
  },
  {
    id: 'oc-ux',
    label: '界面与交互',
    items: [
      { id: 'keybinds', label: '快捷键', icon: Keyboard, keywords: ['keybind', 'keybinds', 'shortcut', 'leader', 'hotkey'] },
      { id: 'theme', label: '主题', icon: Palette, keywords: ['theme', 'dark', 'light', 'system'] },
      { id: 'plugin', label: '插件', icon: Package, keywords: ['plugin', 'plugins'] },
      { id: 'instructions', label: '指令', icon: FileText, keywords: ['instructions', 'prompt', 'system prompt'] },
    ],
  },
  {
    id: 'oc-runtime',
    label: '运行与系统',
    items: [
      { id: 'tui', label: 'TUI 设置', icon: Monitor, keywords: ['tui', 'terminal', 'diff style', 'scroll'] },
      { id: 'server', label: '服务器', icon: Server, keywords: ['server', 'serve', 'web', 'cors', 'mdns', 'port', 'hostname'] },
      { id: 'lsp', label: 'LSP 配置', icon: Code2, keywords: ['lsp', 'language server', 'typescript', 'python', 'go', 'rust'] },
      { id: 'formatter', label: '格式化器', icon: Paintbrush, keywords: ['formatter', 'format', 'prettier', 'gofmt'] },
      { id: 'compaction', label: '上下文压缩', icon: Minimize2, keywords: ['compaction', 'compact', 'prune', 'context'] },
    ],
  },
  {
    id: 'oc-advanced',
    label: '高级与其他',
    items: [
      { id: 'experimental', label: '实验性功能', icon: FlaskConical, keywords: ['experimental', 'flags', 'feature flag'] },
      { id: 'misc', label: '其他', icon: MoreHorizontal, keywords: ['misc'] },
      { id: 'settings', label: '其他设置', icon: Settings, keywords: ['settings', 'share', 'autoupdate', 'update'] },
    ],
  },
];

// Legacy flat nav (used when sidebarGroupingEnabled is disabled)
const openCodeNavFlat: NavDef[] = [
  { id: 'model', label: '模型配置', icon: Cpu, keywords: ['model', 'small_model', 'temperature', 'reasoning', 'thinking', 'limit', 'context', 'output', 'modalities'] },
  {
    id: 'provider',
    label: '模型提供商',
    icon: Server,
    keywords: ['provider', 'providers', 'api', 'apikey', 'api key', 'token', 'baseurl', 'base url', 'headers'],
  },
  { id: 'agent', label: '智能体', icon: Bot, keywords: ['agent', 'subagent', 'tools', 'prompt', 'permissions', 'model', 'variant'] },
  { id: 'permission', label: '权限', icon: Shield, keywords: ['permission', 'allow', 'deny', 'ask', 'bash', 'edit', 'read', 'glob', 'grep'] },
  { id: 'mcp', label: 'MCP 服务器', icon: Plug, keywords: ['mcp', 'server', 'local', 'remote', 'oauth', 'headers', 'timeout'] },
  { id: 'keybinds', label: '快捷键', icon: Keyboard, keywords: ['keybind', 'keybinds', 'shortcut', 'leader', 'hotkey'] },
  { id: 'theme', label: '主题', icon: Palette, keywords: ['theme', 'dark', 'light', 'system'] },
  { id: 'plugin', label: '插件', icon: Package, keywords: ['plugin', 'plugins'] },
  { id: 'instructions', label: '指令', icon: FileText, keywords: ['instructions', 'prompt', 'system prompt'] },
  { id: 'tui', label: 'TUI 设置', icon: Monitor, keywords: ['tui', 'terminal', 'diff style', 'scroll'] },
  { id: 'server', label: '服务器', icon: Server, keywords: ['server', 'serve', 'web', 'cors', 'mdns', 'port', 'hostname'] },
  { id: 'lsp', label: 'LSP 配置', icon: Code2, keywords: ['lsp', 'language server', 'typescript', 'python', 'go', 'rust'] },
  { id: 'formatter', label: '格式化器', icon: Paintbrush, keywords: ['formatter', 'format', 'prettier', 'gofmt'] },
  { id: 'compaction', label: '上下文压缩', icon: Minimize2, keywords: ['compaction', 'compact', 'prune', 'context'] },
  { id: 'experimental', label: '实验性功能', icon: FlaskConical, keywords: ['experimental', 'flags', 'feature flag'] },
  { id: 'misc', label: '其他', icon: MoreHorizontal, keywords: ['misc'] },
  { id: 'settings', label: '其他设置', icon: Settings, keywords: ['settings', 'share', 'autoupdate', 'update'] },
];

const omoNavGroups: NavGroup[] = [
  {
    id: 'omo-core',
    label: '核心配置',
    items: [
      { id: 'omo-agents', label: '代理模型覆盖', icon: Bot },
      {
        id: 'omo-categories',
        label: '任务分类模型',
        icon: Layers,
        keywords: ['category', 'categories', 'variant', 'quick', 'ultrabrain', 'writing'],
      },
    ],
  },
  {
    id: 'omo-runtime',
    label: '运行控制',
    items: [
      { id: 'omo-background', label: '后台任务', icon: Settings2, keywords: ['background', 'concurrency', 'timeout', 'providerConcurrency', 'modelConcurrency'] },
      { id: 'omo-tmux', label: 'Tmux 集成', icon: Terminal, keywords: ['tmux', 'pane', 'layout'] },
      { id: 'omo-sisyphus', label: '西西弗斯代理', icon: Bot, keywords: ['sisyphus', 'loop', 'planner', 'builder'] },
    ],
  },
  {
    id: 'omo-compat',
    label: '兼容与禁用',
    items: [
      { id: 'omo-disabled', label: '禁用功能', icon: Ban },
      { id: 'omo-claude-code', label: 'Claude Code 兼容', icon: Settings2, keywords: ['claude', 'claude code', 'mcp', 'hooks', 'plugins'] },
      { id: 'omo-experimental', label: '实验性功能', icon: FlaskConical },
    ],
  },
];

const omoNavFlat: NavDef[] = [
  { id: 'omo-agents', label: '代理模型覆盖', icon: Bot },
  { id: 'omo-categories', label: '任务分类模型', icon: Layers, keywords: ['category', 'categories', 'variant', 'quick', 'ultrabrain', 'writing'] },
  { id: 'omo-background', label: '后台任务', icon: Settings2, keywords: ['background', 'concurrency', 'timeout', 'providerConcurrency', 'modelConcurrency'] },
  { id: 'omo-tmux', label: 'Tmux 集成', icon: Terminal, keywords: ['tmux', 'pane', 'layout'] },
  { id: 'omo-sisyphus', label: '西西弗斯代理', icon: Bot, keywords: ['sisyphus', 'loop', 'planner', 'builder'] },
  { id: 'omo-disabled', label: '禁用功能', icon: Ban },
  { id: 'omo-claude-code', label: 'Claude Code 兼容', icon: Settings2, keywords: ['claude', 'claude code', 'mcp', 'hooks', 'plugins'] },
  { id: 'omo-experimental', label: '实验性功能', icon: FlaskConical },
];

export function Sidebar({ activeItem, onItemChange, collapsed = false, onCollapsedChange, configMode, modifiedItems }: SidebarProps) {
  const sidebarGroupingStored = useFeatureFlagsStore((s) => s.sidebarGroupingEnabled);
  const sidebarEscStored = useFeatureFlagsStore((s) => s.sidebarSearchEscEnhancedEnabled);

  const sidebarGroupingEnabled = getEffectiveFeatureFlag('sidebarGroupingEnabled', sidebarGroupingStored);
  const sidebarSearchEscEnhancedEnabled = getEffectiveFeatureFlag('sidebarSearchEscEnhancedEnabled', sidebarEscStored);
  const navGroups = configMode === 'opencode' ? openCodeNavGroups : omoNavGroups;
  const navFlat = configMode === 'opencode' ? openCodeNavFlat : omoNavFlat;
  const title = configMode === 'opencode' ? 'OpenCode 配置' : 'OMO 配置';

  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  const parsedQuery = useMemo(() => {
    const parts = query.trim().split(/\s+/).filter(Boolean);
    const tags = new Set(parts.filter((p) => p.startsWith('@')).map((p) => p.toLowerCase()));
    const text = parts.filter((p) => !p.startsWith('@')).join(' ').trim();

    return {
      text,
      tagModified: tags.has('@modified'),
      tagOc: tags.has('@oc'),
      tagOmo: tags.has('@omo'),
    };
  }, [query]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g, idx) => {
      init[g.id] = idx === 0;
    });
    // Ensure active group is open.
    const activeGroup = navGroups.find((g) => g.items.some((i) => i.id === activeItem));
    if (activeGroup) init[activeGroup.id] = true;
    return init;
  });

  useEffect(() => {
    const activeGroup = navGroups.find((g) => g.items.some((i) => i.id === activeItem));
    if (!activeGroup) return;
    setExpanded((prev) => ({ ...prev, [activeGroup.id]: true }));
  }, [activeItem, navGroups]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        if (collapsed) {
          onCollapsedChange?.(false);
          setTimeout(() => searchRef.current?.focus(), 0);
        } else {
          searchRef.current?.focus();
        }
      }

      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        if (!sidebarSearchEscEnhancedEnabled) {
          searchRef.current?.blur();
          return;
        }

        if (query.trim()) {
          e.preventDefault();
          setQuery('');
          // 保持焦点，便于继续输入
          setTimeout(() => searchRef.current?.focus(), 0);
        } else {
          searchRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [collapsed, onCollapsedChange, query, sidebarSearchEscEnhancedEnabled]);

  const filteredGroups = useMemo(() => {
    const q = parsedQuery.text.toLowerCase();
    if (!q && !parsedQuery.tagModified && !parsedQuery.tagOc && !parsedQuery.tagOmo) return navGroups;

    const matches = (item: NavDef) => {
      const isOmoItem = String(item.id).startsWith('omo-');
      if (parsedQuery.tagOc && isOmoItem) return false;
      if (parsedQuery.tagOmo && !isOmoItem) return false;
      if (parsedQuery.tagModified && !modifiedItems?.[item.id]) return false;

      if (!q) return true;
      const haystacks = [item.label, item.id, ...(item.keywords || [])].map((s) => s.toLowerCase());
      return haystacks.some((h) => h.includes(q));
    };

    return navGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(matches),
      }))
      .filter((g) => g.items.length > 0);
  }, [modifiedItems, navGroups, parsedQuery]);

  const filteredFlat = useMemo(() => {
    const q = parsedQuery.text.toLowerCase();

    const matches = (item: NavDef) => {
      const isOmoItem = String(item.id).startsWith('omo-');
      if (parsedQuery.tagOc && isOmoItem) return false;
      if (parsedQuery.tagOmo && !isOmoItem) return false;
      if (parsedQuery.tagModified && !modifiedItems?.[item.id]) return false;

      if (!q) return true;
      const haystacks = [item.label, item.id, ...(item.keywords || [])].map((s) => s.toLowerCase());
      return haystacks.some((h) => h.includes(q));
    };

    if (!q && !parsedQuery.tagModified && !parsedQuery.tagOc && !parsedQuery.tagOmo) return navFlat;
    return navFlat.filter(matches);
  }, [modifiedItems, navFlat, parsedQuery]);

  const collapsedItems = useMemo(() => {
    const q = parsedQuery.text.toLowerCase();
    const hasFilter = q || parsedQuery.tagModified || parsedQuery.tagOc || parsedQuery.tagOmo;
    const groups = hasFilter ? filteredGroups : navGroups;
    return groups.flatMap((g) => g.items);
  }, [filteredGroups, navGroups, parsedQuery]);

  const renderLabel = (label: string) => {
    const q = parsedQuery.text;
    if (!q) return label;
    const idx = label.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return label;
    const before = label.slice(0, idx);
    const match = label.slice(idx, idx + q.length);
    const after = label.slice(idx + q.length);
    return (
      <span>
        {before}
        <span className="font-semibold text-foreground">{match}</span>
        {after}
      </span>
    );
  };

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
          <div className="flex items-center gap-2">
            {configMode === 'oh-my-opencode' && <Sparkles className="h-4 w-4 text-brand-secondary" />}
            <span className="text-lg font-semibold text-foreground">
              {title}
            </span>
          </div>
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
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {/* Search (filters sidebar items only; not panel content) */}
        {!collapsed && (
          <div className="px-2">
            <div className="relative w-full max-w-full min-w-0">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索…"
                aria-describedby="sidebar-search-help"
                className={cn(
                  'pl-8 w-full max-w-full min-w-0 focus-visible:ring-inset focus-visible:ring-offset-0',
                  query.trim() ? 'pr-10' : 'pr-24 sm:pr-32 lg:pr-56'
                )}
              />

              {/* 读屏提示：不要把关键信息塞进 placeholder */}
              <span id="sidebar-search-help" className="sr-only">
                侧栏搜索。快捷键：Cmd 或 Ctrl + K 聚焦。支持语法：@modified。
              </span>

              {/* 辅助提示：仅在空输入时展示，避免挡住输入内容 */}
              {!query.trim() && (
                <div
                  className={cn(
                    'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2',
                    'flex items-center gap-2 text-xs text-muted-foreground'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                      ⌘K
                    </kbd>
                    <kbd className="hidden sm:inline-flex rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground">
                      Ctrl K
                    </kbd>
                  </span>
                  <span className="hidden lg:inline">支持 @modified</span>
                </div>
              )}

              {query.trim() && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm opacity-70 hover:opacity-100 focus-ring"
                  aria-label="清除搜索"
                  onClick={() => {
                    setQuery('');
                    setTimeout(() => searchRef.current?.focus(), 0);
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}

        {!sidebarGroupingEnabled ? (
          <div className="space-y-1">
            {filteredFlat.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground">
                  <div>未找到匹配的设置项</div>
                  <div className="mt-1 text-xs">试试输入 @modified</div>
                  {query.trim() && (
                    <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setQuery('');
                      setTimeout(() => searchRef.current?.focus(), 0);
                    }}
                  >
                    清除搜索
                  </Button>
                )}
              </div>
            ) : filteredFlat.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isModified = !!modifiedItems?.[item.id];
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn('w-full justify-start relative', collapsed ? 'px-2' : 'px-3')}
                  onClick={() => onItemChange(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('h-5 w-5', collapsed ? '' : 'mr-3')} />
                  {!collapsed && <span className="flex-1 truncate">{renderLabel(item.label)}</span>}
                  {isModified && (
                    <span className={cn('h-2 w-2 rounded-full bg-warning', collapsed ? 'absolute top-2 right-2' : '')} aria-hidden="true" />
                  )}
                </Button>
              );
            })}
          </div>
        ) : (
          <>
            {collapsed ? (
              <div className="space-y-1">
                {collapsedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  const isModified = !!modifiedItems?.[item.id];

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start px-2 relative"
                      onClick={() => onItemChange(item.id)}
                      title={item.label}
                    >
                      <Icon className="h-5 w-5" />
                      {isModified && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                      )}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    <div>未找到匹配的设置项</div>
                    <div className="mt-1 text-xs">试试输入 @modified</div>
                    {query.trim() && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setQuery('');
                          setTimeout(() => searchRef.current?.focus(), 0);
                        }}
                      >
                        清除搜索
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <Collapsible
                      key={group.id}
                      open={!!expanded[group.id]}
                      onOpenChange={(open) => setExpanded((prev) => ({ ...prev, [group.id]: open }))}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="w-full px-3 py-2 flex items-center justify-between rounded-md hover:bg-accent text-xs text-muted-foreground focus-ring"
                        >
                          <span>{group.label}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              expanded[group.id] ? 'rotate-180' : 'rotate-0'
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-1 space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeItem === item.id;
                          const isModified = !!modifiedItems?.[item.id];

                          return (
                            <Button
                              key={item.id}
                              variant={isActive ? 'secondary' : 'ghost'}
                              className="w-full justify-start px-3"
                              onClick={() => onItemChange(item.id)}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              <span className="flex-1 truncate">{renderLabel(item.label)}</span>
                              {isModified && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                              )}
                            </Button>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            v{__APP_VERSION__}
          </p>
        )}
      </div>
    </aside>
  );
}
