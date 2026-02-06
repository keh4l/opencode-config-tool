import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  getOpencodeModels: (provider?: string) => ipcRenderer.invoke('opencode-models', provider),

  // 平台信息
  platform: process.platform,
  isElectron: true,
});

type OpencodeModelsResult =
  | { ok: true; output: string }
  | { ok: false; message: string; details?: string };

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      getConfigPath: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<boolean>;
      openFileDialog: () => Promise<string | null>;
      saveFileDialog: (defaultPath?: string) => Promise<string | null>;
      getOpencodeModels: (provider?: string) => Promise<OpencodeModelsResult>;
      platform: string;
      isElectron: boolean;
    };
  }
}
