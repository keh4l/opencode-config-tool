import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  getOmoConfigPath: () => ipcRenderer.invoke('get-omo-config-path'),
  getConfigDir: () => ipcRenderer.invoke('get-config-dir'),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  showItemInFolder: (path: string) => ipcRenderer.invoke('show-item-in-folder', path),
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
      getOmoConfigPath: () => Promise<string>;
      getConfigDir: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<boolean>;
      openFileDialog: () => Promise<string | null>;
      saveFileDialog: (defaultPath?: string) => Promise<string | null>;
      showItemInFolder: (path: string) => Promise<boolean>;
      getOpencodeModels: (provider?: string) => Promise<OpencodeModelsResult>;
      platform: string;
      isElectron: boolean;
    };
  }
}
