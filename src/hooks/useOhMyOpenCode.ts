// src/hooks/useOhMyOpenCode.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OhMyOpenCodeConfig, OmocPreset, OmocAgentModelOverride, OmocCategoryConfig } from '@/types/oh-my-opencode';
import { DEFAULT_OMOC_CONFIG } from '@/lib/oh-my-opencode-defaults';

interface OhMyOpenCodeState {
  // 配置数据
  config: OhMyOpenCodeConfig;
  originalConfig: OhMyOpenCodeConfig;
  configPath: string;
  configScope: 'global' | 'project';

  // UI 状态
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConfig: (config: OhMyOpenCodeConfig) => void;
  updateConfig: (partial: Partial<OhMyOpenCodeConfig>) => void;
  loadConfig: (scope?: 'global' | 'project') => Promise<void>;
  saveConfig: () => Promise<void>;
  applyPreset: (preset: OmocPreset) => void;
  resetConfig: () => void;

  // Agent overrides
  updateAgentOverride: (agentId: string, override: OmocAgentModelOverride | null) => void;
  removeAgentOverride: (agentId: string) => void;

  // Category config
  updateCategory: (categoryId: string, config: OmocCategoryConfig | null) => void;

  // Disabled lists
  toggleDisabledHook: (hookId: string) => void;
  toggleDisabledAgent: (agentId: string) => void;
  toggleDisabledMcp: (mcpId: string) => void;

  // Scope
  setConfigScope: (scope: 'global' | 'project') => void;
}

// Check if running in Electron
const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hasElectronAPI = window.electronAPI !== undefined;
  const hasReadFile = hasElectronAPI && typeof window.electronAPI?.readFile === 'function';
  return hasReadFile;
};

// Get config path based on scope
const getConfigPath = async (scope: 'global' | 'project'): Promise<string> => {
  if (scope === 'project') {
    return '.opencode/oh-my-opencode.json';
  }
  // Global scope - use the same pattern as useConfig.ts
  return '~/.config/opencode/oh-my-opencode.json';
};

export const useOhMyOpenCodeStore = create<OhMyOpenCodeState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_OMOC_CONFIG,
      originalConfig: DEFAULT_OMOC_CONFIG,
      configPath: '',
      configScope: 'global',
      isDirty: false,
      isLoading: false,
      error: null,

      setConfig: (config) => {
        set({
          config,
          isDirty: JSON.stringify(config) !== JSON.stringify(get().originalConfig)
        });
      },

      updateConfig: (partial) => {
        const newConfig = { ...get().config, ...partial };
        set({
          config: newConfig,
          isDirty: JSON.stringify(newConfig) !== JSON.stringify(get().originalConfig)
        });
      },

      loadConfig: async (scope) => {
        const targetScope = scope || get().configScope;
        set({ isLoading: true, error: null, configScope: targetScope });

        try {
          const configPath = await getConfigPath(targetScope);
          let configJson: string;

          if (isElectron() && window.electronAPI) {
            try {
              configJson = await window.electronAPI.readFile(configPath);
            } catch {
              // 文件不存在，使用默认配置
              configJson = JSON.stringify(DEFAULT_OMOC_CONFIG);
            }
          } else {
            // WebUI mode
            const response = await fetch(`/api/config?path=${encodeURIComponent(configPath)}`);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('WebUI 服务器未运行，请先执行 npm run server:dev');
            }
            configJson = await response.text();
          }

          const config = JSON.parse(configJson) as OhMyOpenCodeConfig;
          set({
            config,
            originalConfig: config,
            configPath,
            isDirty: false,
            isLoading: false
          });
        } catch (error) {
          set({
            config: DEFAULT_OMOC_CONFIG,
            originalConfig: DEFAULT_OMOC_CONFIG,
            error: error instanceof Error ? error.message : '加载配置失败',
            isLoading: false,
            isDirty: false
          });
        }
      },

      saveConfig: async () => {
        set({ isLoading: true, error: null });
        try {
          const { config, configPath } = get();
          const configJson = JSON.stringify(config, null, 2);

          if (isElectron() && window.electronAPI) {
            await window.electronAPI.writeFile(configPath, configJson);
          } else {
            const response = await fetch('/api/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: configPath, content: configJson }),
            });
            if (!response.ok) throw new Error('保存配置失败');
          }

          set({
            originalConfig: config,
            isDirty: false,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '保存配置失败',
            isLoading: false
          });
        }
      },

      applyPreset: (preset) => {
        const currentConfig = get().config;
        const newConfig = {
          ...currentConfig,
          ...preset.config,
          // 深度合并 categories
          categories: {
            ...currentConfig.categories,
            ...preset.config.categories
          },
          // 深度合并 background_task
          background_task: {
            ...currentConfig.background_task,
            ...preset.config.background_task,
            providerConcurrency: {
              ...currentConfig.background_task?.providerConcurrency,
              ...preset.config.background_task?.providerConcurrency
            }
          }
        };
        set({ config: newConfig, isDirty: true });
      },

      resetConfig: () => {
        set({
          config: get().originalConfig,
          isDirty: false
        });
      },

      updateAgentOverride: (agentId, override) => {
        const { config } = get();
        if (override === null) {
          const { [agentId]: _, ...rest } = config.agents || {};
          set({
            config: { ...config, agents: rest },
            isDirty: true
          });
        } else {
          set({
            config: {
              ...config,
              agents: { ...config.agents, [agentId]: override }
            },
            isDirty: true
          });
        }
      },

      removeAgentOverride: (agentId) => {
        const { config } = get();
        const { [agentId]: _, ...rest } = config.agents || {};
        set({
          config: { ...config, agents: rest },
          isDirty: true
        });
      },

      updateCategory: (categoryId, categoryConfig) => {
        const { config } = get();
        if (categoryConfig === null) {
          const { [categoryId]: _, ...rest } = config.categories || {};
          set({
            config: { ...config, categories: rest },
            isDirty: true
          });
        } else {
          set({
            config: {
              ...config,
              categories: { ...config.categories, [categoryId]: categoryConfig }
            },
            isDirty: true
          });
        }
      },

      toggleDisabledHook: (hookId) => {
        const { config } = get();
        const disabled = config.disabled_hooks || [];
        const newDisabled = disabled.includes(hookId)
          ? disabled.filter(id => id !== hookId)
          : [...disabled, hookId];
        set({
          config: { ...config, disabled_hooks: newDisabled },
          isDirty: true
        });
      },

      toggleDisabledAgent: (agentId) => {
        const { config } = get();
        const disabled = config.disabled_agents || [];
        const newDisabled = disabled.includes(agentId)
          ? disabled.filter(id => id !== agentId)
          : [...disabled, agentId];
        set({
          config: { ...config, disabled_agents: newDisabled },
          isDirty: true
        });
      },

      toggleDisabledMcp: (mcpId) => {
        const { config } = get();
        const disabled = config.disabled_mcps || [];
        const newDisabled = disabled.includes(mcpId)
          ? disabled.filter(id => id !== mcpId)
          : [...disabled, mcpId];
        set({
          config: { ...config, disabled_mcps: newDisabled },
          isDirty: true
        });
      },

      setConfigScope: (scope) => {
        set({ configScope: scope });
      }
    }),
    {
      name: 'oh-my-opencode-config-storage',
      partialize: (state) => ({ configPath: state.configPath, configScope: state.configScope }),
    }
  )
);

// Selector hooks
export const useOmocConfig = () => useOhMyOpenCodeStore((state) => state.config);
export const useOmocIsDirty = () => useOhMyOpenCodeStore((state) => state.isDirty);
export const useOmocIsLoading = () => useOhMyOpenCodeStore((state) => state.isLoading);
export const useOmocError = () => useOhMyOpenCodeStore((state) => state.error);
