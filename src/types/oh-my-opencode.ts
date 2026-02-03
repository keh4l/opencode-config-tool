// src/types/oh-my-opencode.ts
// oh-my-opencode 配置类型定义

export interface OmocAgentModelOverride {
  model: string;
  temperature?: number;
  thinking?: {
    type: 'enabled' | 'disabled';
    budgetTokens?: number;
  };
}

export interface OmocCategoryConfig {
  model: string;
  variant?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
}

export interface OmocBackgroundTaskConfig {
  defaultConcurrency?: number;
  staleTimeoutMs?: number;
  providerConcurrency?: Record<string, number>;
}

export interface OmocTmuxConfig {
  enabled?: boolean;
  layout?: 'main-vertical' | 'main-horizontal' | 'tiled' | 'even-horizontal' | 'even-vertical';
  main_pane_size?: number;
}

export interface OmocSisyphusConfig {
  disabled?: boolean;
  planner_enabled?: boolean;
  replace_plan?: boolean;
}

export interface OmocClaudeCodeConfig {
  mcp?: boolean;
  commands?: boolean;
  skills?: boolean;
  agents?: boolean;
  hooks?: boolean;
  plugins?: boolean;
}

export interface OmocExperimentalConfig {
  aggressive_truncation?: boolean;
}

export interface OhMyOpenCodeConfig {
  $schema?: string;
  agents?: Record<string, OmocAgentModelOverride>;
  categories?: Record<string, OmocCategoryConfig>;
  background_task?: OmocBackgroundTaskConfig;
  tmux?: OmocTmuxConfig;
  sisyphus_agent?: OmocSisyphusConfig;
  disabled_hooks?: string[];
  disabled_agents?: string[];
  disabled_mcps?: string[];
  claude_code?: OmocClaudeCodeConfig;
  experimental?: OmocExperimentalConfig;
}

// 预设模板类型
export interface OmocPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  config: Partial<OhMyOpenCodeConfig>;
}

// 安装选项类型
export interface OmocInstallOptions {
  claude?: boolean;
  openai?: boolean;
  gemini?: boolean;
  copilot?: boolean;
  noTui?: boolean;
}

// 已知的 Agent 列表（带中文名称和描述）
export const KNOWN_AGENTS = [
  { id: 'oracle', name: '神谕者', description: '智能问答和知识检索' },
  { id: 'librarian', name: '图书管理员', description: '文档和代码库管理' },
  { id: 'explore', name: '探索者', description: '代码库探索和分析' },
  { id: 'Sisyphus', name: '西西弗斯', description: '持久化任务执行' },
  { id: 'architect', name: '架构师', description: '系统设计和架构规划' },
  { id: 'executor', name: '执行者', description: '代码执行和任务完成' },
  { id: 'designer', name: '设计师', description: 'UI/UX 设计和前端开发' },
  { id: 'writer', name: '写作者', description: '文档编写和内容创作' },
  { id: 'analyst', name: '分析师', description: '数据分析和问题诊断' },
  { id: 'researcher', name: '研究员', description: '深度研究和信息收集' },
  { id: 'scientist', name: '科学家', description: '数据科学和实验分析' },
  { id: 'vision', name: '视觉专家', description: '图像分析和视觉处理' },
  { id: 'planner', name: '规划师', description: '任务规划和策略制定' },
] as const;

// 已知的 Category 列表（带中文名称和描述）
export const KNOWN_CATEGORIES = [
  { id: 'quick', name: '快速任务', description: '简单快速的小任务' },
  { id: 'visual-engineering', name: '视觉工程', description: '图像处理和视觉相关任务' },
  { id: 'ultrabrain', name: '超级大脑', description: '复杂推理和高难度任务' },
  { id: 'artistry', name: '艺术创作', description: '创意设计和艺术相关任务' },
  { id: 'unspecified-low', name: '通用低级', description: '未分类的简单任务' },
  { id: 'unspecified-high', name: '通用高级', description: '未分类的复杂任务' },
  { id: 'writing', name: '写作任务', description: '文档编写和内容创作' },
] as const;

// Tmux 布局选项
export const TMUX_LAYOUTS = [
  'main-vertical', 'main-horizontal', 'tiled',
  'even-horizontal', 'even-vertical'
] as const;

// Category 变体选项
export const CATEGORY_VARIANTS = [
  'low', 'medium', 'high', 'xhigh', 'max'
] as const;
