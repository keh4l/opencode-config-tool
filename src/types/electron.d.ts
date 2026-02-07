// src/types/electron.d.ts

/**
 * Electron API Type Definitions
 * Matches the API exposed in electron/preload.ts
 */

/**
 * Electron API exposed to renderer process via contextBridge
 */
export interface ElectronAPI {
  // File operations
  getConfigPath: () => Promise<string>;
  getOmoConfigPath: () => Promise<string>;
  getConfigDir: () => Promise<string>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<boolean>;
  openFileDialog: () => Promise<string | null>;
  saveFileDialog: (defaultPath?: string) => Promise<string | null>;
  showItemInFolder: (path: string) => Promise<boolean>;
  getOpencodeModels: (provider?: string) => Promise<
    | { ok: true; output: string }
    | { ok: false; message: string; details?: string }
  >;

  // Platform info
  platform: string;
  isElectron: boolean;
}

/**
 * Extend Window interface to include electronAPI
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Check if Electron API is available
 */
export function isElectronAvailable(): boolean {
  return typeof window !== 'undefined' &&
         window.electronAPI !== undefined &&
         typeof window.electronAPI.readFile === 'function';
}

/**
 * Get Electron API with type safety
 * @throws Error if Electron API is not available
 */
export function getElectronAPI(): ElectronAPI {
  if (!isElectronAvailable()) {
    throw new Error('Electron API is not available in this environment');
  }
  return window.electronAPI!;
}

/**
 * React hook for accessing Electron API
 * @returns Electron API or null if not available
 */
export function useElectronAPI(): ElectronAPI | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.electronAPI || null;
}

/**
 * React hook for Electron API with error handling
 * @throws Error if Electron API is not available
 */
export function useElectronAPIStrict(): ElectronAPI {
  const api = useElectronAPI();
  if (!api) {
    throw new Error('Electron API is not available');
  }
  return api;
}

export {};
