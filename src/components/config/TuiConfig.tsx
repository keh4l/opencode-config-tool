// src/components/config/TuiConfig.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SettingRow } from '@/components/layout/SettingRow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, Gauge, Layers } from 'lucide-react';
import type { TuiConfig } from '@/types/config';

export function TuiConfigPanel() {
  const { config, updateConfig } = useConfigStore();
  const tui = config.tui || {};

  const updateTui = (updates: Partial<TuiConfig>) => {
    updateConfig({
      tui: { ...tui, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="TUI 设置"
        description="终端用户界面的显示和交互设置"
        icon={Monitor}
      >
        <div className="space-y-6">
          {/* 滚动速度 */}
          <div className="divide-y">
            <SettingRow
              label={(
                <span className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  滚动速度
                </span>
              )}
              description="控制消息滚动的速度，最小值 0.001。留空使用默认值。"
              htmlFor="scroll-speed"
            >
              <Input
                id="scroll-speed"
                type="number"
                step="0.001"
                min="0.001"
                value={tui.scroll_speed ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateTui({
                    scroll_speed: value === '' ? undefined : parseFloat(value)
                  });
                }}
                placeholder="默认值"
              />
            </SettingRow>

            <SettingRow
              label="滚动加速"
              description="启用后滚动会随时间加速"
            >
              <Switch
                checked={tui.scroll_acceleration?.enabled ?? false}
                onCheckedChange={(checked) => updateTui({
                  scroll_acceleration: { enabled: checked }
                })}
              />
            </SettingRow>
          </div>

          {/* Diff 样式 */}
          <SettingRow
            label={(
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                差异显示样式
              </span>
            )}
            description={(
              <span>
                auto: 根据终端宽度自动选择并排或堆叠显示<br />
                stacked: 始终使用单列堆叠显示
              </span>
            )}
          >
            <Select
              value={tui.diff_style || 'auto'}
              onValueChange={(value: 'auto' | 'stacked') => updateTui({ diff_style: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择差异样式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动 (根据终端宽度)</SelectItem>
                <SelectItem value="stacked">堆叠 (单列显示)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </ConfigCard>
    </div>
  );
}
