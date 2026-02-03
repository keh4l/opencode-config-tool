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

// 已知的 Agent 列表
export const KNOWN_AGENTS = [
  'oracle', 'librarian', 'explore', 'Sisyphus', 'architect',
  'executor', 'designer', 'writer', 'analyst', 'researcher',
  'scientist', 'vision', 'planner'
] as const;

// 已知的 Category 列表
export const KNOWN_CATEGORIES = [
  'quick', 'visual-engineering', 'ultrabrain', 'artistry',
  'unspecified-low', 'unspecified-high', 'writing'
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
