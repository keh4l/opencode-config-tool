// src/components/config/ThemeSelector.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectableCard } from '@/components/ui/selectable-card';
import { Palette, Check } from 'lucide-react';

const BUILTIN_THEMES = [
  { id: 'opencode', name: 'OpenCode', description: '默认主题' },
  { id: 'tokyonight', name: 'Tokyo Night', description: '深色主题' },
  { id: 'catppuccin', name: 'Catppuccin', description: '柔和色彩' },
  { id: 'gruvbox', name: 'Gruvbox', description: '复古风格' },
  { id: 'nord', name: 'Nord', description: '北欧风格' },
  { id: 'dracula', name: 'Dracula', description: '暗色主题' },
  { id: 'solarized', name: 'Solarized', description: '护眼主题' },
  { id: 'monokai', name: 'Monokai', description: '经典编辑器主题' },
];

export function ThemeSelector() {
  const { config, updateConfig } = useConfigStore();
  const currentTheme = config.theme || 'opencode';

  const handleThemeChange = (themeId: string) => {
    updateConfig({ theme: themeId });
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="OpenCode 主题"
        description="选择 OpenCode TUI 的显示主题"
        icon={Palette}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BUILTIN_THEMES.map((theme) => (
            <SelectableCard
              key={theme.id}
              selected={currentTheme === theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className="p-4"
            >
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-ring" />
                </div>
              )}
              <div className="font-medium text-foreground">{theme.name}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </SelectableCard>
          ))}
        </div>
      </ConfigCard>

      <ConfigCard title="自定义主题" icon={Palette}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>主题名称</Label>
            <Input
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              placeholder="my-custom-theme"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            自定义主题文件放置在 <code className="text-info">~/.config/opencode/themes/</code> 或
            <code className="text-info">.opencode/themes/</code> 目录下
          </p>
        </div>
      </ConfigCard>
    </div>
  );
}
