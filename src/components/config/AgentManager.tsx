// src/components/config/AgentManager.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, Plus, Trash2, Edit, Code, Shield, Palette, Settings, Sliders } from 'lucide-react';
import type { AgentConfig, AgentMode } from '@/types/config';

interface AgentFormData {
  id: string;
  name: string;
  description: string;
  mode: AgentMode;
  model: string;
  variant: string;
  prompt: string;
  temperature: number;
  top_p: number;
  steps: number;
  color: string;
  hidden: boolean;
  disable: boolean;
  tools: {
    write: boolean;
    edit: boolean;
    bash: boolean;
  };
}

const emptyAgent: AgentFormData = {
  id: '',
  name: '',
  description: '',
  mode: 'subagent',
  model: '',
  variant: '',
  prompt: '',
  temperature: 0.3,
  top_p: 1.0,
  steps: 100,
  color: '#3b82f6',
  hidden: false,
  disable: false,
  tools: {
    write: true,
    edit: true,
    bash: false,
  },
};

export function AgentManager() {
  const { config, addAgent, updateAgent, removeAgent } = useConfigStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentFormData | null>(null);

  const agents = config.agent || {};

  const handleAddAgent = () => {
    setEditingAgent({ ...emptyAgent });
    setIsDialogOpen(true);
  };

  const handleEditAgent = (id: string) => {
    const agent = agents[id];
    if (agent) {
      setEditingAgent({
        id,
        name: agent.name || id,
        description: agent.description || '',
        mode: agent.mode || 'subagent',
        model: agent.model || '',
        variant: agent.variant || '',
        prompt: agent.prompt || '',
        temperature: agent.temperature ?? 0.3,
        top_p: agent.top_p ?? 1.0,
        steps: agent.steps ?? 100,
        color: agent.color || '#3b82f6',
        hidden: agent.hidden ?? false,
        disable: agent.disable ?? false,
        tools: {
          write: agent.tools?.write ?? true,
          edit: agent.tools?.edit ?? true,
          bash: agent.tools?.bash ?? false,
        },
      });
      setIsDialogOpen(true);
    }
  };

  const handleSaveAgent = () => {
    if (!editingAgent || !editingAgent.id) return;

    const agentConfig: AgentConfig = {
      name: editingAgent.name || editingAgent.id,
      description: editingAgent.description || undefined,
      mode: editingAgent.mode,
      model: editingAgent.model || undefined,
      variant: editingAgent.variant || undefined,
      prompt: editingAgent.prompt || undefined,
      temperature: editingAgent.temperature,
      top_p: editingAgent.top_p !== 1.0 ? editingAgent.top_p : undefined,
      steps: editingAgent.steps !== 100 ? editingAgent.steps : undefined,
      color: editingAgent.color !== '#3b82f6' ? editingAgent.color : undefined,
      hidden: editingAgent.hidden || undefined,
      disable: editingAgent.disable || undefined,
      tools: editingAgent.tools,
    };

    if (agents[editingAgent.id]) {
      updateAgent(editingAgent.id, agentConfig);
    } else {
      addAgent(editingAgent.id, agentConfig);
    }

    setIsDialogOpen(false);
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="智能体管理"
        description="创建和管理自定义 AI 智能体，配置专用的系统提示和工具权限"
        icon={Bot}
        actions={
          <Button size="sm" onClick={handleAddAgent}>
            <Plus className="h-4 w-4 mr-2" />
            添加智能体
          </Button>
        }
      >
        {Object.keys(agents).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无自定义智能体，点击上方按钮添加
          </div>
        ) : (
          <div className="grid gap-4">
            {Object.entries(agents).map(([id, agent]) => (
              <div
                key={id}
                className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                style={{
                  borderLeft: agent.color ? `4px solid ${agent.color}` : undefined,
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4" style={{ color: agent.color || '#3b82f6' }} />
                    <span className="font-medium text-foreground">
                      {agent.name || id}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        agent.mode === 'primary'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : agent.mode === 'all'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {agent.mode || 'subagent'}
                    </span>
                    {agent.hidden && (
                      <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400">
                        隐藏
                      </span>
                    )}
                    {agent.disable && (
                      <span className="px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        禁用
                      </span>
                    )}
                  </div>
                  {agent.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {agent.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {agent.model && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                        {agent.model}
                      </span>
                    )}
                    {agent.variant && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                        变体: {agent.variant}
                      </span>
                    )}
                    {agent.temperature !== undefined && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        温度: {agent.temperature}
                      </span>
                    )}
                    {agent.top_p !== undefined && agent.top_p !== 1.0 && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        Top-P: {agent.top_p}
                      </span>
                    )}
                    {agent.steps !== undefined && agent.steps !== 100 && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">
                        步数: {agent.steps}
                      </span>
                    )}
                    {agent.tools && (
                      <div className="flex gap-1">
                        {agent.tools.write && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                            写入
                          </span>
                        )}
                        {agent.tools.edit && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                            编辑
                          </span>
                        )}
                        {agent.tools.bash && (
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
                            命令行
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEditAgent(id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => removeAgent(id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ConfigCard>

      {/* Agent 预设模板 */}
      <ConfigCard title="快速添加智能体 模板" icon={Code}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'code-reviewer', name: '代码审查', desc: '专注于代码质量和安全', mode: 'subagent' as const, tools: { write: false, edit: false, bash: false } },
            { id: 'security-auditor', name: '安全审计', desc: '识别安全漏洞', mode: 'subagent' as const, tools: { write: false, edit: false, bash: false } },
            { id: 'docs-writer', name: '文档编写', desc: '生成技术文档', mode: 'subagent' as const, tools: { write: true, edit: true, bash: false } },
            { id: 'test-writer', name: '测试编写', desc: '生成单元测试', mode: 'subagent' as const, tools: { write: true, edit: true, bash: true } },
            { id: 'refactor', name: '重构专家', desc: '代码重构和优化', mode: 'primary' as const, tools: { write: true, edit: true, bash: false } },
            { id: 'planner', name: '规划助手', desc: '项目规划和任务分解', mode: 'primary' as const, tools: { write: false, edit: false, bash: false } },
          ].filter(template => !agents[template.id]).map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto py-3 flex flex-col items-start"
              onClick={() => {
                addAgent(template.id, {
                  name: template.name,
                  description: template.desc,
                  mode: template.mode,
                  tools: template.tools,
                  temperature: 0.3,
                });
              }}
            >
              <span className="font-medium text-foreground">{template.name}</span>
              <span className="text-xs text-muted-foreground">{template.desc}</span>
            </Button>
          ))}
        </div>
      </ConfigCard>

      {/* Agent 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAgent?.id && agents[editingAgent.id] ? `编辑智能体: ${editingAgent.id}` : '添加智能体'}
            </DialogTitle>
            <DialogDescription>
              配置智能体的名称、模式、提示词和工具权限
            </DialogDescription>
          </DialogHeader>

          {editingAgent && (
            <div className="space-y-6 py-4">
              {/* 基础设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Settings className="h-4 w-4" />
                  基础设置
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-id">智能体 ID *</Label>
                    <Input
                      id="agent-id"
                      value={editingAgent.id}
                      onChange={(e) => setEditingAgent({ ...editingAgent, id: e.target.value })}
                      placeholder="my-agent"
                      disabled={!!agents[editingAgent.id]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">显示名称</Label>
                    <Input
                      id="agent-name"
                      value={editingAgent.name}
                      onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                      placeholder="我的智能体"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-description">描述</Label>
                  <Input
                    id="agent-description"
                    value={editingAgent.description}
                    onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                    placeholder="智能体的用途描述"
                  />
                </div>

                <div className="space-y-2">
                  <Label>模式</Label>
                  <Select
                    value={editingAgent.mode}
                    onValueChange={(value: AgentMode) => setEditingAgent({ ...editingAgent, mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">主智能体</SelectItem>
                      <SelectItem value="subagent">子智能体</SelectItem>
                      <SelectItem value="all">全部</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    主智能体：可直接调用 | 子智能体：仅作为子任务 | 全部：两者皆可
                  </p>
                </div>
              </div>

              {/* 模型设置 */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bot className="h-4 w-4" />
                  模型设置
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-model">模型</Label>
                    <Input
                      id="agent-model"
                      value={editingAgent.model}
                      onChange={(e) => setEditingAgent({ ...editingAgent, model: e.target.value })}
                      placeholder="anthropic/claude-sonnet-4-20250514"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-variant">变体</Label>
                    <Input
                      id="agent-variant"
                      value={editingAgent.variant}
                      onChange={(e) => setEditingAgent({ ...editingAgent, variant: e.target.value })}
                      placeholder="extended"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>温度：{editingAgent.temperature.toFixed(1)}</Label>
                    <span className="text-xs text-muted-foreground">
                      {editingAgent.temperature < 0.3 ? '精确' : editingAgent.temperature < 0.6 ? '平衡' : '创意'}
                    </span>
                  </div>
                  <Slider
                    value={[editingAgent.temperature]}
                    onValueChange={([value]) => setEditingAgent({ ...editingAgent, temperature: value })}
                    max={1}
                    step={0.1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>采样概率（Top P）：{editingAgent.top_p.toFixed(2)}</Label>
                    <span className="text-xs text-muted-foreground">
                      控制输出多样性
                    </span>
                  </div>
                  <Slider
                    value={[editingAgent.top_p]}
                    onValueChange={([value]) => setEditingAgent({ ...editingAgent, top_p: value })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="py-2"
                  />
                </div>
              </div>

              {/* 行为设置 */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sliders className="h-4 w-4" />
                  行为设置
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-steps">最大迭代步数</Label>
                  <Input
                    id="agent-steps"
                    type="number"
                    min={1}
                    max={1000}
                    value={editingAgent.steps}
                    onChange={(e) => setEditingAgent({ ...editingAgent, steps: parseInt(e.target.value) || 100 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    智能体执行任务的最大步数，默认 100
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="agent-hidden" className="font-normal">隐藏智能体</Label>
                      <p className="text-xs text-muted-foreground">在列表中隐藏</p>
                    </div>
                    <Switch
                      id="agent-hidden"
                      checked={editingAgent.hidden}
                      onCheckedChange={(checked) => setEditingAgent({ ...editingAgent, hidden: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="agent-disable" className="font-normal">禁用智能体</Label>
                      <p className="text-xs text-muted-foreground">完全禁用</p>
                    </div>
                    <Switch
                      id="agent-disable"
                      checked={editingAgent.disable}
                      onCheckedChange={(checked) => setEditingAgent({ ...editingAgent, disable: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* 外观设置 */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Palette className="h-4 w-4" />
                  外观设置
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-color">主题颜色</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="agent-color"
                      type="color"
                      value={editingAgent.color}
                      onChange={(e) => setEditingAgent({ ...editingAgent, color: e.target.value })}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      value={editingAgent.color}
                      onChange={(e) => setEditingAgent({ ...editingAgent, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAgent({ ...editingAgent, color: '#3b82f6' })}
                    >
                      重置
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    用于在界面中标识此智能体
                  </p>
                </div>
              </div>

              {/* 系统提示词 */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="agent-prompt">系统提示词</Label>
                <Textarea
                  id="agent-prompt"
                  value={editingAgent.prompt}
                  onChange={(e) => setEditingAgent({ ...editingAgent, prompt: e.target.value })}
                  placeholder="你是一个有帮助的 AI 助手..."
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  支持 {'{file:./path/to/prompt.txt}'} 语法引用外部文件
                </p>
              </div>

              {/* 工具权限 */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  工具权限
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label htmlFor="tool-write" className="font-normal">写入</Label>
                    <Switch
                      id="tool-write"
                      checked={editingAgent.tools.write}
                      onCheckedChange={(checked) => setEditingAgent({
                        ...editingAgent,
                        tools: { ...editingAgent.tools, write: checked },
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label htmlFor="tool-edit" className="font-normal">编辑</Label>
                    <Switch
                      id="tool-edit"
                      checked={editingAgent.tools.edit}
                      onCheckedChange={(checked) => setEditingAgent({
                        ...editingAgent,
                        tools: { ...editingAgent.tools, edit: checked },
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Label htmlFor="tool-bash" className="font-normal">命令行</Label>
                    <Switch
                      id="tool-bash"
                      checked={editingAgent.tools.bash}
                      onCheckedChange={(checked) => setEditingAgent({
                        ...editingAgent,
                        tools: { ...editingAgent.tools, bash: checked },
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveAgent} disabled={!editingAgent?.id}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
