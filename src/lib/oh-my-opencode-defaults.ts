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

// 已知的 Hooks 列表
export const KNOWN_HOOKS = [
  { id: 'comment-checker', name: '注释检查器', description: '检查代码注释质量' },
  { id: 'auto-update-checker', name: '自动更新检查', description: '检查插件更新' },
  { id: 'delegation-audit', name: '委派审计', description: '审计代理委派行为' },
  { id: 'path-write-guard', name: '路径写入保护', description: '保护敏感路径' }
];

// 已知的 MCP 服务列表
export const KNOWN_MCPS = [
  { id: 'websearch', name: 'Web 搜索', description: '网络搜索功能' },
  { id: 'context7', name: 'Context7', description: '文档查询服务' },
  { id: 'grep_app', name: 'Grep App', description: '代码搜索服务' },
  { id: 'filesystem', name: '文件系统', description: '文件系统访问' },
  { id: 'github', name: 'GitHub', description: 'GitHub 集成' }
];

// 已知的可禁用 Agents 列表
export const KNOWN_DISABLED_AGENTS = [
  { id: 'multimodal-looker', name: '多模态查看器', description: '图像分析代理' },
  { id: 'vision', name: '视觉代理', description: '视觉处理代理' }
];
