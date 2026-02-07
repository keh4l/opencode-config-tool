// electron/preload.cjs
// CommonJS format for Electron preload script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  getOmoConfigPath: () => ipcRenderer.invoke('get-omo-config-path'),
  getConfigDir: () => ipcRenderer.invoke('get-config-dir'),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
  getOpencodeModels: (provider) => ipcRenderer.invoke('opencode-models', provider),

  platform: process.platform,
  isElectron: true,
});
