// src/components/config/OtherSettings.tsx
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Switch } from '@/components/ui/switch';
import { SettingRow } from '@/components/layout/SettingRow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Share2, RefreshCw } from 'lucide-react';

export function OtherSettings() {
  const { config, updateConfig } = useConfigStore();

  return (
    <div className="space-y-6">
      <ConfigCard title="分享设置" icon={Share2}>
        <div className="space-y-4">
          <SettingRow
            label="会话分享"
            description="控制是否允许分享会话"
          >
            <Select
              value={config.share || 'auto'}
              onValueChange={(value: 'manual' | 'auto' | 'disabled') => updateConfig({ share: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">手动</SelectItem>
                <SelectItem value="auto">自动</SelectItem>
                <SelectItem value="disabled">禁用</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </ConfigCard>

      <ConfigCard title="更新设置" icon={RefreshCw}>
        <SettingRow
          label="自动更新"
          description="启用后 OpenCode 将自动检查并安装更新"
        >
          <Switch
            checked={config.autoupdate === true || config.autoupdate === 'notify' || config.autoupdate === undefined}
            onCheckedChange={(checked) => updateConfig({ autoupdate: checked ? true : false })}
          />
        </SettingRow>
      </ConfigCard>

      <ConfigCard title="模型配置" icon={Settings}>
        <div className="space-y-4">
          <SettingRow label="默认模型" description="当前默认模型（只读）">
            <div className="text-sm text-muted-foreground font-mono">
              {config.model || '未设置'}
            </div>
          </SettingRow>
          <SettingRow label="小模型" description="当前小模型（只读）">
            <div className="text-sm text-muted-foreground font-mono">
              {config.small_model || '未设置'}
            </div>
          </SettingRow>
          <p className="text-xs text-muted-foreground">
            模型配置请在 "模型配置" 页面进行设置
          </p>
        </div>
      </ConfigCard>
    </div>
  );
}
