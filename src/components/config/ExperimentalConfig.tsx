import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, AlertTriangle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { ExperimentalConfig } from '@/types/config';
import { useConfigStore } from '@/hooks/useConfig';
import { useFeatureFlagsStore } from '@/hooks/useFeatureFlags';

export function ExperimentalConfigPanel() {
  const { config, updateConfig } = useConfigStore();
  const experimental = config.experimental || {};
  const [newPrimaryTool, setNewPrimaryTool] = useState('');
  const {
    importWizardEnabled,
    sidebarGroupingEnabled,
    importWizardStep2EnhancementsEnabled,
    dirtyGuardEnabled,
    sidebarSearchEscEnhancedEnabled,
    setFlag,
  } = useFeatureFlagsStore();

  const updateExperimental = (updates: Partial<ExperimentalConfig>) => {
    updateConfig({
      experimental: { ...experimental, ...updates }
    });
  };

  const addPrimaryTool = () => {
    if (newPrimaryTool.trim()) {
      const tools = [...(experimental.primary_tools || []), newPrimaryTool.trim()];
      updateExperimental({ primary_tools: tools });
      setNewPrimaryTool('');
    }
  };

  const removePrimaryTool = (index: number) => {
    const tools = (experimental.primary_tools || []).filter((_, i) => i !== index);
    updateExperimental({ primary_tools: tools.length > 0 ? tools : undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          实验性功能
          <Badge variant="outline" className="ml-2">测试版</Badge>
        </CardTitle>
        <CardDescription>
          这些功能仍在测试中，可能不稳定或在未来版本中更改
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            实验性功能可能导致意外行为，请谨慎启用
          </p>
        </div>

        {/* Batch Tool */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>批量工具</Label>
            <p className="text-xs text-muted-foreground">
              启用批量执行多个工具调用
            </p>
          </div>
          <Switch
            checked={experimental.batch_tool ?? false}
            onCheckedChange={(checked) => updateExperimental({ batch_tool: checked })}
          />
        </div>

        {/* OpenTelemetry */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>可观测性（OpenTelemetry）</Label>
            <p className="text-xs text-muted-foreground">
              启用 AI SDK 调用的遥测追踪
            </p>
          </div>
          <Switch
            checked={experimental.openTelemetry ?? false}
            onCheckedChange={(checked) => updateExperimental({ openTelemetry: checked })}
          />
        </div>

        {/* Continue Loop on Deny */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>拒绝后继续循环</Label>
            <p className="text-xs text-muted-foreground">
              工具调用被拒绝后继续智能体循环
            </p>
          </div>
          <Switch
            checked={experimental.continue_loop_on_deny ?? false}
            onCheckedChange={(checked) => updateExperimental({ continue_loop_on_deny: checked })}
          />
        </div>

        {/* Disable Paste Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>禁用粘贴摘要</Label>
            <p className="text-xs text-muted-foreground">
              禁用大文本粘贴时的自动摘要
            </p>
          </div>
          <Switch
            checked={experimental.disable_paste_summary ?? false}
            onCheckedChange={(checked) => updateExperimental({ disable_paste_summary: checked })}
          />
        </div>

        {/* MCP Timeout */}
        <div className="space-y-2">
          <Label htmlFor="mcp-timeout">MCP 超时时间（毫秒）</Label>
          <Input
            id="mcp-timeout"
            type="number"
            min="1000"
            step="1000"
            value={experimental.mcp_timeout || ''}
            onChange={(e) => updateExperimental({
              mcp_timeout: parseInt(e.target.value) || undefined
            })}
            placeholder="5000"
          />
          <p className="text-xs text-muted-foreground">
            MCP 请求的超时时间，默认 5000ms
          </p>
        </div>

        {/* Primary Tools */}
        <div className="space-y-3">
          <Label>主 Agent 专用工具</Label>
          <p className="text-xs text-muted-foreground">
            这些工具只对主 agent 可用，子 agent 无法使用
          </p>

          <div className="flex gap-2">
            <Input
              value={newPrimaryTool}
              onChange={(e) => setNewPrimaryTool(e.target.value)}
              placeholder="工具名称"
              onKeyDown={(e) => e.key === 'Enter' && addPrimaryTool()}
            />
            <Button onClick={addPrimaryTool} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {experimental.primary_tools && experimental.primary_tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experimental.primary_tools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tool}
                  <button type="button" className="focus-ring rounded-sm" onClick={() => removePrimaryTool(index)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* UI Feature Flags (vNext rollback) */}
        <div className="space-y-4 pt-2 border-t">
          <div>
            <Label>UI Feature Flags</Label>
            <p className="text-xs text-muted-foreground">
              用于快速回退 vNext 的关键 UI 改动（不影响配置文件内容）
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用导入向导</Label>
              <p className="text-xs text-muted-foreground">三步导入向导（预览/校验/撤销）</p>
            </div>
            <Switch
              checked={importWizardEnabled}
              onCheckedChange={(checked) => setFlag('importWizardEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用侧栏分组与搜索</Label>
              <p className="text-xs text-muted-foreground">分组折叠 + 侧栏搜索（Cmd/Ctrl+K）</p>
            </div>
            <Switch
              checked={sidebarGroupingEnabled}
              onCheckedChange={(checked) => setFlag('sidebarGroupingEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用导入预览增强（Step2）</Label>
              <p className="text-xs text-muted-foreground">筛选/长值展开/复制摘要（仅 UI 行为，可回滚）</p>
            </div>
            <Switch
              checked={importWizardStep2EnhancementsEnabled}
              onCheckedChange={(checked) => setFlag('importWizardStep2EnhancementsEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用未保存更改拦截（dirty guard）</Label>
              <p className="text-xs text-muted-foreground">模式/面板切换拦截 + 关闭窗口提醒（仅 UI 行为，可回滚）</p>
            </div>
            <Switch
              checked={dirtyGuardEnabled}
              onCheckedChange={(checked) => setFlag('dirtyGuardEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用侧栏搜索 Esc 优化</Label>
              <p className="text-xs text-muted-foreground">有 query 时先清空并保持焦点；无 query 再退出焦点</p>
            </div>
            <Switch
              checked={sidebarSearchEscEnhancedEnabled}
              onCheckedChange={(checked) => setFlag('sidebarSearchEscEnhancedEnabled', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
