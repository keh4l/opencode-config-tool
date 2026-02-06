// src/components/config/PluginManager.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Trash2, FolderOpen } from 'lucide-react';

export function PluginManager() {
  const { config, updateConfig } = useConfigStore();
  const [newPlugin, setNewPlugin] = useState('');

  const plugins = config.plugin || [];

  const handleAddPlugin = () => {
    if (!newPlugin) return;
    updateConfig({ plugin: [...plugins, newPlugin] });
    setNewPlugin('');
  };

  const handleRemovePlugin = (index: number) => {
    updateConfig({ plugin: plugins.filter((_, i) => i !== index) });
  };

  return (
    <ConfigCard
      title="插件管理"
      description="加载自定义插件扩展 OpenCode 功能"
      icon={Package}
    >
      <div className="space-y-4">
        {/* 添加插件 */}
        <div className="flex gap-2">
          <Input
            value={newPlugin}
            onChange={(e) => setNewPlugin(e.target.value)}
            placeholder="./custom-plugin.ts 或 npm 包名"
            className="flex-1"
          />
          <Button onClick={handleAddPlugin} disabled={!newPlugin}>
            <Plus className="h-4 w-4 mr-2" />
            添加
          </Button>
        </div>

        {/* 插件列表 */}
        {plugins.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            暂无加载的插件
          </div>
        ) : (
          <div className="space-y-2">
            {plugins.map((plugin, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {plugin.startsWith('./') || plugin.startsWith('../') ? (
                    <FolderOpen className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Package className="h-4 w-4 text-blue-500" />
                  )}
                  <code className="text-sm">{plugin}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleRemovePlugin(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 说明 */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>插件可以从以下位置加载:</p>
          <ul className="list-disc list-inside ml-2">
            <li><code>.opencode/plugins/</code> - 项目本地插件</li>
            <li><code>~/.config/opencode/plugins/</code> - 全局插件</li>
            <li>npm 包名 - 从 npm 安装的插件</li>
          </ul>
        </div>
      </div>
    </ConfigCard>
  );
}
