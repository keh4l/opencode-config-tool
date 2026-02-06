// src/lib/oh-my-opencode-defaults.ts
import type { OhMyOpenCodeConfig, OmocPreset } from '@/types/oh-my-opencode';

// 默认配置
export const DEFAULT_OMOC_CONFIG: OhMyOpenCodeConfig = {
  $schema: 'https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json'
};

// 预设模板
export const OMOC_PRESETS: OmocPreset[] = [
  {
    id: 'performance',
    name: '🚀 高性能模式',
    description: '使用最强模型，最大并发，适合复杂项目',
    icon: '🚀',
    config: {
      categories: {
        'ultrabrain': { model: 'anthropic/claude-opus-4-5', variant: 'max' },
        'unspecified-high': { model: 'anthropic/claude-opus-4-5', variant: 'max' },
      },
      background_task: {
        defaultConcurrency: 10,
        providerConcurrency: { anthropic: 5, openai: 10, google: 15 }
      },
      sisyphus_agent: {
        disabled: false,
        planner_enabled: true,
        replace_plan: true
      }
    }
  },
  {
    id: 'budget',
    name: '💰 省钱模式',
    description: '使用经济实惠的模型，降低 API 成本',
    icon: '💰',
    config: {
      categories: {
        'quick': { model: 'anthropic/claude-haiku-4-5' },
        'unspecified-low': { model: 'anthropic/claude-haiku-4-5' },
        'unspecified-high': { model: 'anthropic/claude-sonnet-4-5' },
        'writing': { model: 'google/gemini-3-flash' }
      },
      background_task: {
        defaultConcurrency: 3
      }
    }
  },
  {
    id: 'full-experience',
    name: '✨ 完整体验',
    description: '启用所有功能，包括 Tmux 集成和 Sisyphus',
    icon: '✨',
    config: {
      tmux: {
        enabled: true,
        layout: 'main-vertical',
        main_pane_size: 60
      },
      sisyphus_agent: {
        disabled: false,
        planner_enabled: true,
        replace_plan: true
      },
      claude_code: {
        mcp: true,
        commands: true,
        skills: true,
        agents: true,
        hooks: true,
        plugins: true
      }
    }
  },
  {
    id: 'minimal',
    name: '🎯 极简模式',
    description: '禁用非必要功能，专注核心体验',
    icon: '🎯',
    config: {
      tmux: { enabled: false },
      sisyphus_agent: { disabled: true },
      disabled_hooks: ['comment-checker', 'auto-update-checker'],
      claude_code: {
        mcp: false,
        commands: false,
        skills: false,
        agents: false,
        hooks: false,
        plugins: false
      }
    }
  },
  {
    id: 'google-first',
    name: '🔷 Google 优先',
    description: '优先使用 Google Gemini 模型',
    icon: '🔷',
    config: {
      categories: {
        'quick': { model: 'google/gemini-3-flash' },
        'visual-engineering': { model: 'google/gemini-3-pro' },
        'artistry': { model: 'google/gemini-3-pro-preview', variant: 'max' },
        'writing': { model: 'google/gemini-3-flash-preview' }
      },
      background_task: {
        providerConcurrency: { google: 15 }
      }
    }
  }
];

// 已知的 Hooks 列表（与 oh-my-opencode schema disabled_hooks enum 对齐）
export const KNOWN_HOOKS = [
  { id: 'todo-continuation-enforcer', name: 'TODO 延续执行器', description: '确保 TODO 任务持续执行' },
  { id: 'context-window-monitor', name: '上下文窗口监控', description: '监控上下文窗口使用情况' },
  { id: 'session-recovery', name: '会话恢复', description: '会话异常恢复' },
  { id: 'session-notification', name: '会话通知', description: '会话状态变更通知' },
  { id: 'comment-checker', name: '注释检查器', description: '检查代码注释质量' },
  { id: 'grep-output-truncator', name: 'Grep 输出截断器', description: '截断过长的 grep 输出' },
  { id: 'tool-output-truncator', name: '工具输出截断器', description: '截断过长的工具输出' },
  { id: 'directory-agents-injector', name: '目录代理注入器', description: '注入目录级 AGENTS.md 指令' },
  { id: 'directory-readme-injector', name: '目录 README 注入器', description: '注入目录级 README 指令' },
  { id: 'empty-task-response-detector', name: '空任务响应检测器', description: '检测空的任务响应' },
  { id: 'think-mode', name: '思考模式', description: '启用深度思考模式' },
  { id: 'anthropic-context-window-limit-recovery', name: 'Anthropic 上下文限制恢复', description: 'Anthropic 上下文窗口超限恢复' },
  { id: 'rules-injector', name: '规则注入器', description: '注入自定义规则' },
  { id: 'background-notification', name: '后台通知', description: '后台任务完成通知' },
  { id: 'auto-update-checker', name: '自动更新检查', description: '检查插件更新' },
  { id: 'startup-toast', name: '启动提示', description: '启动时显示提示信息' },
  { id: 'keyword-detector', name: '关键词检测器', description: '检测特定关键词触发动作' },
  { id: 'agent-usage-reminder', name: '代理使用提醒', description: '提醒合理使用代理' },
  { id: 'non-interactive-env', name: '非交互环境', description: '非交互环境适配' },
  { id: 'interactive-bash-session', name: '交互式 Bash 会话', description: '交互式 Bash 会话管理' },
  { id: 'thinking-block-validator', name: '思考块验证器', description: '验证思考块格式和内容' },
  { id: 'ralph-loop', name: 'Ralph 循环', description: 'Ralph 循环任务执行' },
  { id: 'compaction-context-injector', name: '压缩上下文注入器', description: '注入压缩后的上下文' },
  { id: 'claude-code-hooks', name: 'Claude Code 钩子', description: 'Claude Code 兼容钩子' },
  { id: 'auto-slash-command', name: '自动斜杠命令', description: '自动执行斜杠命令' },
  { id: 'edit-error-recovery', name: '编辑错误恢复', description: '编辑操作错误自动恢复' },
  { id: 'delegate-task-retry', name: '委派任务重试', description: '委派任务失败自动重试' },
  { id: 'prometheus-md-only', name: 'Prometheus 仅 MD', description: 'Prometheus 代理仅输出 Markdown' },
  { id: 'start-work', name: '启动工作', description: '从规划启动工作流程' },
  { id: 'atlas', name: 'Atlas 钩子', description: 'Atlas 多代理协调钩子' },
];

// 已知的 MCP 服务列表
export const KNOWN_MCPS = [
  { id: 'websearch', name: 'Web 搜索', description: '网络搜索功能' },
  { id: 'context7', name: 'Context7', description: '文档查询服务' },
  { id: 'grep_app', name: 'Grep App', description: '代码搜索服务' },
  { id: 'filesystem', name: '文件系统', description: '文件系统访问' },
  { id: 'github', name: 'GitHub', description: 'GitHub 集成' }
];

// 已知的可禁用 Agents 列表（与 oh-my-opencode schema disabled_agents enum 对齐）
export const KNOWN_DISABLED_AGENTS = [
  { id: 'sisyphus', name: '西西弗斯', description: '持久化任务执行代理' },
  { id: 'prometheus', name: '普罗米修斯', description: '规划代理，任务分解和策略制定' },
  { id: 'oracle', name: '神谕者', description: '高智商推理专家' },
  { id: 'librarian', name: '图书管理员', description: '文档查询和知识检索' },
  { id: 'explore', name: '探索者', description: '代码库探索和上下文搜索' },
  { id: 'multimodal-looker', name: '多模态观察者', description: '图像分析代理' },
  { id: 'metis', name: '墨提斯', description: '智慧代理，策略分析和决策支持' },
  { id: 'momus', name: '摩墨斯', description: '审查代理，代码审查和质量检测' },
  { id: 'atlas', name: '阿特拉斯', description: '任务编排和多代理协调' },
];

// 已知的 Skills 列表（与 oh-my-opencode schema disabled_skills enum 对齐）
export const KNOWN_SKILLS = [
  { id: 'playwright', name: 'Playwright', description: '浏览器自动化测试' },
  { id: 'frontend-ui-ux', name: '前端 UI/UX', description: '前端界面开发' },
  { id: 'git-master', name: 'Git 大师', description: 'Git 版本控制操作' },
];

export const KNOWN_COMMANDS = [
  { id: 'init-deep', name: 'init-deep', description: '初始化深度代理知识库' },
  { id: 'start-work', name: 'start-work', description: '从规划启动工作流程' },
];
