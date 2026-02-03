// src/components/layout/Header.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/hooks/useTheme';
import { useConfigStore } from '@/hooks/useConfig';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';
import { FolderOpen, Sparkles } from 'lucide-react';
import {
  Save,
  Upload,
  Download,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  FileJson,
  LayoutTemplate,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfigMode } from './Sidebar';

interface HeaderProps {
  configMode: ConfigMode;
  onConfigModeChange: (mode: ConfigMode) => void;
  onImport: () => void;
  onExport: () => void;
  onTemplates: () => void;
  onOmoPresets?: () => void;
  onOmoImport?: () => void;
  onOmoExport?: () => void;
}

export function Header({
  configMode,
  onConfigModeChange,
  onImport,
  onExport,
  onTemplates,
  onOmoPresets,
  onOmoImport,
  onOmoExport,
}: HeaderProps) {
  const { theme, setTheme } = useThemeStore();
  const openCodeStore = useConfigStore();
  const omoStore = useOhMyOpenCodeStore();

  // 根据当前模式选择对应的状态
  const isOpenCodeMode = configMode === 'opencode';
  const isDirty = isOpenCodeMode ? openCodeStore.isDirty : omoStore.isDirty;
  const isLoading = isOpenCodeMode ? openCodeStore.isLoading : omoStore.isLoading;
  const configPath = isOpenCodeMode ? openCodeStore.configPath : omoStore.configPath;
  const error = isOpenCodeMode ? openCodeStore.error : omoStore.error;
  const saveConfig = isOpenCodeMode ? openCodeStore.saveConfig : omoStore.saveConfig;
  const resetConfig = isOpenCodeMode ? openCodeStore.resetConfig : omoStore.resetConfig;

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };
  const ThemeIcon = themeIcons[theme];

  return (
    <header className="flex flex-col bg-card border-b border-border">
      {/* macOS Traffic Light Spacer - 为红绿灯按钮预留空间 */}
      <div className="h-8 flex-shrink-0 app-drag-region" />

      {/* 第一行：Tab 切换器 + 操作按钮 */}
      <div className="flex items-center justify-between h-12 px-6">
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-3 rounded-md transition-all',
                isOpenCodeMode
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
              onClick={() => onConfigModeChange('opencode')}
            >
              <FileJson className="h-4 w-4 mr-2" />
              OpenCode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-3 rounded-md transition-all',
                !isOpenCodeMode
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
              onClick={() => onConfigModeChange('oh-my-opencode')}
            >
              <Sparkles className={cn('h-4 w-4 mr-2', !isOpenCodeMode ? 'text-purple-500' : '')} />
              Oh My OpenCode
            </Button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* OpenCode Mode Actions */}
          {isOpenCodeMode ? (
            <>
              <Button variant="outline" size="sm" onClick={onTemplates}>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                模板
              </Button>
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </>
          ) : (
            <>
              {/* Oh My OpenCode Mode Actions */}
              <Button variant="outline" size="sm" onClick={onOmoPresets}>
                <Zap className="h-4 w-4 mr-2" />
                预设
              </Button>
              <Button variant="outline" size="sm" onClick={onOmoImport || onImport}>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="outline" size="sm" onClick={onOmoExport || onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </>
          )}

          {/* Common Actions */}
          <Button variant="outline" size="sm" onClick={resetConfig} disabled={!isDirty}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button size="sm" onClick={saveConfig} disabled={!isDirty || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                浅色
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                深色
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-2" />
                跟随系统
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 第二行：配置文件路径 + 状态 */}
      <div className="flex items-center justify-between h-8 px-6 bg-muted/30 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderOpen className="h-3 w-3" />
          <span className="font-mono truncate max-w-[500px]" title={configPath || '未加载'}>
            {configPath || '未加载配置文件'}
          </span>
          {error && (
            <span className="text-destructive">({error})</span>
          )}
        </div>
        {isDirty && (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
            未保存
          </span>
        )}
      </div>
    </header>
  );
}
