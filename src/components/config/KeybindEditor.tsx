// src/components/config/KeybindEditor.tsx
import { useState } from 'react';
import { useConfigStore } from '@/hooks/useConfig';
import { ConfigCard } from '@/components/layout/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Keyboard, Search, RotateCcw } from 'lucide-react';
import { KEYBIND_CATEGORIES } from '@/types/config';
import { DEFAULT_KEYBINDS } from '@/lib/defaults';

// 快捷键描述
const KEYBIND_DESCRIPTIONS: Record<string, string> = {
  leader: '前缀键',
  app_exit: '退出应用',
  editor_open: '打开编辑器',
  theme_list: '主题列表',
  sidebar_toggle: '切换侧边栏',
  session_new: '新建会话',
  session_list: '会话列表',
  session_interrupt: '中断会话',
  messages_page_up: '消息向上翻页',
  messages_page_down: '消息向下翻页',
  messages_copy: '复制消息',
  messages_undo: '撤销',
  messages_redo: '重做',
  model_list: '模型列表',
  model_cycle_recent: '切换最近模型',
  agent_list: '智能体列表',
  agent_cycle: '切换智能体',
  input_submit: '提交输入',
  input_newline: '换行',
  input_clear: '清除输入',
  input_paste: '粘贴',
  history_previous: '上一条历史',
  history_next: '下一条历史',
};

const CATEGORY_NAMES: Record<string, string> = {
  application: '应用控制',
  session: '会话管理',
  messages: '消息导航',
  model: '模型切换',
  command: '命令/智能体',
  input: '输入控制',
  history: '历史导航',
  terminal: '终端',
};

export function KeybindEditor() {
  const { config, updateKeybind, resetKeybinds } = useConfigStore();
  const [searchQuery, setSearchQuery] = useState('');

  const keybinds = config.keybinds || {};

  const filterKeybinds = (keys: readonly string[]) => {
    if (!searchQuery) return keys;
    return keys.filter(key =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      KEYBIND_DESCRIPTIONS[key]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleKeybindChange = (key: string, value: string) => {
    updateKeybind(key, value);
  };

  return (
    <div className="space-y-6">
      <ConfigCard
        title="快捷键配置"
        description="自定义 OpenCode 的键盘快捷键"
        icon={Keyboard}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索快捷键..."
                className="pl-8 w-48"
              />
            </div>
            <Button variant="outline" size="sm" onClick={resetKeybinds}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重置默认
            </Button>
          </div>
        }
      >
        {/* 前缀键 (Leader)特殊显示 */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">前缀键 (Leader)</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                大多数快捷键的前缀，使用 {'<leader>'} 表示
              </p>
            </div>
            <Input
              value={keybinds.leader || DEFAULT_KEYBINDS.leader}
              onChange={(e) => handleKeybindChange('leader', e.target.value)}
              className="w-40 font-mono"
            />
          </div>
        </div>

        {/* 分类快捷键 */}
        <Accordion type="multiple" defaultValue={['application', 'session']} className="w-full">
          {Object.entries(KEYBIND_CATEGORIES).map(([categoryId, keys]) => {
            const filteredKeys = filterKeybinds(keys);
            if (filteredKeys.length === 0) return null;

            return (
              <AccordionItem key={categoryId} value={categoryId}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4 text-muted-foreground" />
                    <span>{CATEGORY_NAMES[categoryId] || categoryId}</span>
                    <span className="text-xs text-muted-foreground">({filteredKeys.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {filteredKeys.map((key) => {
                      const currentValue = keybinds[key as keyof typeof keybinds] || DEFAULT_KEYBINDS[key as keyof typeof DEFAULT_KEYBINDS] || 'none';
                      const isModified = keybinds[key as keyof typeof keybinds] !== undefined &&
                        keybinds[key as keyof typeof keybinds] !== DEFAULT_KEYBINDS[key as keyof typeof DEFAULT_KEYBINDS];

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-medium">{key}</code>
                              {isModified && (
                                <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
                                  已修改
                                </span>
                              )}
                            </div>
                            {KEYBIND_DESCRIPTIONS[key] && (
                              <p className="text-xs text-muted-foreground">{KEYBIND_DESCRIPTIONS[key]}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={currentValue as string}
                              onChange={(e) => handleKeybindChange(key, e.target.value)}
                              className="w-48 font-mono text-sm"
            placeholder="none（禁用）"
                            />
                            {isModified && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleKeybindChange(key, DEFAULT_KEYBINDS[key as keyof typeof DEFAULT_KEYBINDS] || '')}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ConfigCard>

      {/* 快捷键语法说明 */}
      <ConfigCard title="快捷键语法" icon={Keyboard}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">修饰键</h4>
            <ul className="space-y-1 text-muted-foreground">
            <li><code className="text-blue-500">ctrl</code> - Ctrl 键</li>
            <li><code className="text-blue-500">alt</code> - Alt/Option 键</li>
            <li><code className="text-blue-500">shift</code> - Shift 键</li>
            <li><code className="text-blue-500">super</code> - Win/Cmd 键</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">特殊语法</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><code className="text-blue-500">{'<leader>'}</code> - 前缀键 (Leader)前缀</li>
              <li><code className="text-blue-500">none</code> - 禁用快捷键</li>
              <li><code className="text-blue-500">key1,key2</code> - 多个快捷键</li>
              <li><code className="text-blue-500">ctrl+x</code> - 组合键</li>
            </ul>
          </div>
        </div>
      </ConfigCard>
    </div>
  );
}
