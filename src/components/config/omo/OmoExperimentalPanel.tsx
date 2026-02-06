// src/components/config/omo/OmoExperimentalPanel.tsx
import { useEffect, useState, type ChangeEvent } from 'react';
import { ConfigCard } from '@/components/layout/Card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical } from 'lucide-react';
import { useOhMyOpenCodeStore } from '@/hooks/useOhMyOpenCode';

export function OmoExperimentalPanel() {
  const { config, updateConfig } = useOhMyOpenCodeStore();
  const [skillsRaw, setSkillsRaw] = useState('');
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    if (config.skills === undefined) {
      setSkillsRaw('');
      setSkillsError(null);
      return;
    }
    setSkillsRaw(JSON.stringify(config.skills, null, 2));
    setSkillsError(null);
  }, [config.skills]);

  return (
    <ConfigCard
      title="实验性功能"
      description="启用或禁用实验性功能"
      icon={FlaskConical}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>激进截断</Label>
            <p className="text-xs text-muted-foreground">启用更激进的上下文截断策略</p>
          </div>
          <Switch
            checked={config.experimental?.aggressive_truncation ?? false}
            onCheckedChange={(checked) => updateConfig({
              experimental: { ...config.experimental, aggressive_truncation: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>自动恢复</Label>
            <p className="text-xs text-muted-foreground">启用自动恢复未完成的任务</p>
          </div>
          <Switch
            checked={config.experimental?.auto_resume ?? false}
            onCheckedChange={(checked) => updateConfig({
              experimental: { ...config.experimental, auto_resume: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>截断所有工具输出</Label>
            <p className="text-xs text-muted-foreground">启用后会截断所有工具输出</p>
          </div>
          <Switch
            checked={config.experimental?.truncate_all_tool_outputs ?? false}
            onCheckedChange={(checked) => updateConfig({
              experimental: { ...config.experimental, truncate_all_tool_outputs: checked }
            })}
          />
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>动态上下文裁剪</Label>
              <p className="text-xs text-muted-foreground">启用动态上下文裁剪策略</p>
            </div>
            <Switch
              checked={config.experimental?.dynamic_context_pruning?.enabled ?? false}
              onCheckedChange={(checked) => updateConfig({
                experimental: {
                  ...config.experimental,
                  dynamic_context_pruning: {
                    ...config.experimental?.dynamic_context_pruning,
                    enabled: checked
                  }
                }
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">通知级别</Label>
              <Select
                value={config.experimental?.dynamic_context_pruning?.notification || 'detailed'}
                onValueChange={(value: 'off' | 'minimal' | 'detailed') => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      notification: value
                    }
                  }
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">关闭</SelectItem>
                  <SelectItem value="minimal">简洁</SelectItem>
                  <SelectItem value="detailed">详细</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">保护回合数</Label>
              <Input
                className="mt-1"
                type="number"
                min="1"
                max="10"
                value={config.experimental?.dynamic_context_pruning?.turn_protection?.turns ?? ''}
                onChange={(e) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      turn_protection: {
                        ...config.experimental?.dynamic_context_pruning?.turn_protection,
                        turns: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }
                  }
                })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>启用回合保护</Label>
              <p className="text-xs text-muted-foreground">保护最近 N 回合内容</p>
            </div>
            <Switch
              checked={config.experimental?.dynamic_context_pruning?.turn_protection?.enabled ?? true}
              onCheckedChange={(checked) => updateConfig({
                experimental: {
                  ...config.experimental,
                  dynamic_context_pruning: {
                    ...config.experimental?.dynamic_context_pruning,
                    turn_protection: {
                      ...config.experimental?.dynamic_context_pruning?.turn_protection,
                      enabled: checked
                    }
                  }
                }
              })}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">受保护工具 (逗号分隔)</Label>
            <Input
              className="mt-1"
              placeholder="task, todowrite"
              value={(config.experimental?.dynamic_context_pruning?.protected_tools || []).join(', ')}
              onChange={(e) => {
                const value = e.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean);
                updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      protected_tools: value.length > 0 ? value : undefined
                    }
                  }
                });
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">去重策略</Label>
              <Switch
                checked={config.experimental?.dynamic_context_pruning?.strategies?.deduplication?.enabled ?? true}
                onCheckedChange={(checked) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      strategies: {
                        ...config.experimental?.dynamic_context_pruning?.strategies,
                        deduplication: { enabled: checked }
                      }
                    }
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">覆盖写入</Label>
              <Switch
                checked={config.experimental?.dynamic_context_pruning?.strategies?.supersede_writes?.enabled ?? true}
                onCheckedChange={(checked) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      strategies: {
                        ...config.experimental?.dynamic_context_pruning?.strategies,
                        supersede_writes: {
                          ...config.experimental?.dynamic_context_pruning?.strategies?.supersede_writes,
                          enabled: checked
                        }
                      }
                    }
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">错误清理</Label>
              <Switch
                checked={config.experimental?.dynamic_context_pruning?.strategies?.purge_errors?.enabled ?? true}
                onCheckedChange={(checked) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      strategies: {
                        ...config.experimental?.dynamic_context_pruning?.strategies,
                        purge_errors: {
                          ...config.experimental?.dynamic_context_pruning?.strategies?.purge_errors,
                          enabled: checked
                        }
                      }
                    }
                  }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">覆盖写入 - 激进模式</Label>
              <Switch
                checked={config.experimental?.dynamic_context_pruning?.strategies?.supersede_writes?.aggressive ?? false}
                onCheckedChange={(checked) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      strategies: {
                        ...config.experimental?.dynamic_context_pruning?.strategies,
                        supersede_writes: {
                          ...config.experimental?.dynamic_context_pruning?.strategies?.supersede_writes,
                          aggressive: checked
                        }
                      }
                    }
                  }
                })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">错误清理回合数</Label>
              <Input
                className="mt-1"
                type="number"
                min="1"
                max="20"
                value={config.experimental?.dynamic_context_pruning?.strategies?.purge_errors?.turns ?? ''}
                onChange={(e) => updateConfig({
                  experimental: {
                    ...config.experimental,
                    dynamic_context_pruning: {
                      ...config.experimental?.dynamic_context_pruning,
                      strategies: {
                        ...config.experimental?.dynamic_context_pruning?.strategies,
                        purge_errors: {
                          ...config.experimental?.dynamic_context_pruning?.strategies?.purge_errors,
                          turns: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      }
                    }
                  }
                })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>自动更新检查</Label>
              <p className="text-xs text-muted-foreground">启用 OMO 自动更新</p>
            </div>
            <Switch
              checked={config.auto_update ?? false}
              onCheckedChange={(checked) => updateConfig({ auto_update: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>通知强制启用</Label>
              <p className="text-xs text-muted-foreground">强制启用通知功能</p>
            </div>
            <Switch
              checked={config.notification?.force_enable ?? false}
              onCheckedChange={(checked) => updateConfig({
                notification: { ...config.notification, force_enable: checked }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">注释检查器自定义提示</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="输入自定义注释检查提示..."
              value={config.comment_checker?.custom_prompt || ''}
              onChange={(e) => updateConfig({
                comment_checker: { custom_prompt: e.target.value || undefined }
              })}
            />
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Git Master：提交页脚（commit_footer）</Label>
                <Switch
                  checked={config.git_master?.commit_footer ?? true}
                  onCheckedChange={(checked) => updateConfig({
                    git_master: { ...config.git_master, commit_footer: checked }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Git Master：协作者署名（Co-authored-by）</Label>
                <Switch
                  checked={config.git_master?.include_co_authored_by ?? true}
                  onCheckedChange={(checked) => updateConfig({
                    git_master: { ...config.git_master, include_co_authored_by: checked }
                  })}
                />
              </div>
            </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ralph 循环</Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm">启用 Ralph 循环</Label>
              <Switch
                checked={config.ralph_loop?.enabled ?? false}
                onCheckedChange={(checked) => updateConfig({
                  ralph_loop: { ...config.ralph_loop, enabled: checked }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">默认最大迭代</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min="1"
                  max="1000"
                  value={config.ralph_loop?.default_max_iterations ?? ''}
                  onChange={(e) => updateConfig({
                    ralph_loop: {
                      ...config.ralph_loop,
                      default_max_iterations: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">状态目录</Label>
                <Input
                  className="mt-1"
                  placeholder=".omc/state"
                  value={config.ralph_loop?.state_dir || ''}
                  onChange={(e) => updateConfig({
                    ralph_loop: { ...config.ralph_loop, state_dir: e.target.value || undefined }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">技能配置（JSON）</Label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={4}
              placeholder={`例如: ["playwright", "git-master"]`}
              value={skillsRaw}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSkillsRaw(e.target.value)}
              onBlur={() => {
                if (!skillsRaw.trim()) {
                  setSkillsError(null);
                  updateConfig({ skills: undefined });
                  return;
                }
                try {
                  const parsed = JSON.parse(skillsRaw);
                  setSkillsError(null);
                  updateConfig({ skills: parsed });
                } catch (parseError) {
                  setSkillsError(parseError instanceof Error ? parseError.message : '无效 JSON');
                }
              }}
            />
            {skillsError && <p className="text-xs text-destructive">{skillsError}</p>}
          </div>
        </div>
      </div>
    </ConfigCard>
  );
}
