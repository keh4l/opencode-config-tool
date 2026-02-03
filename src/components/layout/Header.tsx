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
import { FolderOpen } from 'lucide-react';
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
} from 'lucide-react';

interface HeaderProps {
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
  onTemplates: () => void;
}

export function Header({ onImport, onExport, onReset, onTemplates }: HeaderProps) {
  const { theme, setTheme } = useThemeStore();
  const { isDirty, isLoading, saveConfig, configPath, error } = useConfigStore();

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

      <div className="flex items-center justify-between h-12 px-6">
      {/* Left: Title and Config Path */}
      <div className="flex items-center gap-3">
        <FileJson className="h-6 w-6 text-blue-500" />
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-foreground">
            配置编辑器
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FolderOpen className="h-3 w-3" />
            <span className="font-mono truncate max-w-[300px]" title={configPath || '未加载'}>
              {configPath || '未加载配置文件'}
            </span>
            {error && (
              <span className="text-destructive">({error})</span>
            )}
          </div>
        </div>
        {isDirty && (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
            未保存
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Templates */}
        <Button variant="outline" size="sm" onClick={onTemplates}>
          <LayoutTemplate className="h-4 w-4 mr-2" />
          模板
        </Button>

        {/* Import */}
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-2" />
          导入
        </Button>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          导出
        </Button>

        {/* Reset */}
        <Button variant="outline" size="sm" onClick={onReset} disabled={!isDirty}>
          <RotateCcw className="h-4 w-4 mr-2" />
          重置
        </Button>

        {/* Save */}
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
    </header>
  );
}
