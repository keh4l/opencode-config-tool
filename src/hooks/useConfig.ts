// src/hooks/useConfig.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenCodeConfig } from '@/types/config';
import { DEFAULT_CONFIG } from '@/lib/defaults';

interface ConfigState {
  // Current config being edited
  config: OpenCodeConfig;

  // Original config (for detecting changes)
  originalConfig: OpenCodeConfig;

  // Config file path
  configPath: string;

  // UI state
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConfig: (config: OpenCodeConfig) => void;
  updateConfig: (partial: Partial<OpenCodeConfig>) => void;
  resetConfig: () => void;
  loadConfig: (path?: string) => Promise<void>;
  saveConfig: () => Promise<void>;
  importConfig: (json: string) => void;
  exportConfig: () => string;
  applyTemplate: (config: OpenCodeConfig) => void;

  // Provider actions
  addProvider: (id: string, config: any) => void;
  updateProvider: (id: string, config: any) => void;
  removeProvider: (id: string) => void;

  // Agent actions
  addAgent: (id: string, config: any) => void;
  updateAgent: (id: string, config: any) => void;
  removeAgent: (id: string) => void;

  // MCP actions
  addMcpServer: (id: string, config: any) => void;
  updateMcpServer: (id: string, config: any) => void;
  removeMcpServer: (id: string) => void;

  // Permission actions
  updatePermission: (tool: string, rule: any) => void;

  // Keybind actions
  updateKeybind: (key: string, value: string) => void;
  resetKeybinds: () => void;
}

// Check if running in Electron
const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check multiple indicators
  const hasElectronAPI = window.electronAPI !== undefined;
  const hasReadFile = hasElectronAPI && typeof window.electronAPI?.readFile === 'function';
  // Also check for Electron-specific properties
  const hasElectronFlag = hasElectronAPI && window.electronAPI?.isElectron === true;

  console.log('[isElectron] Check:', { hasElectronAPI, hasReadFile, hasElectronFlag });
  return hasReadFile || hasElectronFlag;
};

// Wait for Electron API to be available
const waitForElectronAPI = (timeout = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isElectron()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isElectron()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 50);
  });
};

// Default config path
const getDefaultConfigPath = async (): Promise<string> => {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.getConfigPath();
  }
  return '~/.config/opencode/opencode.json';
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      originalConfig: DEFAULT_CONFIG,
      configPath: '',
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

      resetConfig: () => {
        set({
          config: get().originalConfig,
          isDirty: false
        });
      },

      loadConfig: async (path) => {
        set({ isLoading: true, error: null });
        try {
          // Wait for Electron API to be available (if in Electron)
          await waitForElectronAPI(1000);

          const configPath = path || await getDefaultConfigPath();
          let configJson: string;

          console.log('[loadConfig] isElectron:', isElectron(), 'configPath:', configPath);

          if (isElectron() && window.electronAPI) {
            // Electron mode - use IPC
            console.log('[loadConfig] Using Electron IPC');
            configJson = await window.electronAPI.readFile(configPath);
          } else {
            // WebUI mode - fetch from API
            console.log('[loadConfig] Using WebUI fetch');
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

          const config = JSON.parse(configJson) as OpenCodeConfig;
          set({
            config,
            originalConfig: config,
            configPath,
            isDirty: false,
            isLoading: false
          });
        } catch (error) {
          console.error('Load config error:', error);
          // 加载失败时使用默认配置，但保留错误信息
          const configPath = path || await getDefaultConfigPath();
          set({
            config: DEFAULT_CONFIG,
            originalConfig: DEFAULT_CONFIG,
            configPath,
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
            // WebUI mode - POST to API
            const response = await fetch('/api/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: configPath, content: configJson }),
            });
            if (!response.ok) throw new Error('Failed to save config');
          }

          set({
            originalConfig: config,
            isDirty: false,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to save config',
            isLoading: false
          });
        }
      },

      importConfig: (json) => {
        try {
          const config = JSON.parse(json) as OpenCodeConfig;
          set({ config, isDirty: true, error: null });
        } catch (error) {
          set({ error: 'Invalid JSON format' });
        }
      },

      exportConfig: () => {
        return JSON.stringify(get().config, null, 2);
      },

      applyTemplate: (templateConfig) => {
        set({
          config: { ...templateConfig },
          isDirty: true
        });
      },

      // Provider actions
      addProvider: (id, providerConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            provider: { ...config.provider, [id]: providerConfig },
          },
          isDirty: true,
        });
      },

      updateProvider: (id, providerConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            provider: { ...config.provider, [id]: providerConfig },
          },
          isDirty: true,
        });
      },

      removeProvider: (id) => {
        const { config } = get();
        const { [id]: _, ...rest } = config.provider || {};
        set({
          config: { ...config, provider: rest },
          isDirty: true,
        });
      },

      // Agent actions
      addAgent: (id, agentConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            agent: { ...config.agent, [id]: agentConfig },
          },
          isDirty: true,
        });
      },

      updateAgent: (id, agentConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            agent: { ...config.agent, [id]: agentConfig },
          },
          isDirty: true,
        });
      },

      removeAgent: (id) => {
        const { config } = get();
        const { [id]: _, ...rest } = config.agent || {};
        set({
          config: { ...config, agent: rest },
          isDirty: true,
        });
      },

      // MCP actions
      addMcpServer: (id, mcpConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            mcp: { ...config.mcp, [id]: mcpConfig },
          },
          isDirty: true,
        });
      },

      updateMcpServer: (id, mcpConfig) => {
        const { config } = get();
        set({
          config: {
            ...config,
            mcp: { ...config.mcp, [id]: mcpConfig },
          },
          isDirty: true,
        });
      },

      removeMcpServer: (id) => {
        const { config } = get();
        const { [id]: _, ...rest } = config.mcp || {};
        set({
          config: { ...config, mcp: rest },
          isDirty: true,
        });
      },

      // Permission actions
      updatePermission: (tool, rule) => {
        const { config } = get();
        set({
          config: {
            ...config,
            permission: { ...config.permission, [tool]: rule },
          },
          isDirty: true,
        });
      },

      // Keybind actions
      updateKeybind: (key, value) => {
        const { config } = get();
        set({
          config: {
            ...config,
            keybinds: { ...config.keybinds, [key]: value },
          },
          isDirty: true,
        });
      },

      resetKeybinds: () => {
        const { config } = get();
        set({
          config: {
            ...config,
            keybinds: DEFAULT_CONFIG.keybinds,
          },
          isDirty: true,
        });
      },
    }),
    {
      name: 'opencode-config-storage',
      partialize: (state) => ({ configPath: state.configPath }),
    }
  )
);

// Selector hooks for better performance
export const useConfig = () => useConfigStore((state) => state.config);
export const useIsDirty = () => useConfigStore((state) => state.isDirty);
export const useIsLoading = () => useConfigStore((state) => state.isLoading);
export const useError = () => useConfigStore((state) => state.error);
