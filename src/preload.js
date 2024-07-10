const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadPostgres: (url) => ipcRenderer.invoke('download-postgres', url),
  pauseDownload: () => ipcRenderer.invoke('pause-download'),
  resumeDownload: () => ipcRenderer.invoke('resume-download'),
  installPostgres: (path) => ipcRenderer.invoke('install-postgres', path),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),
  notify: (message) => ipcRenderer.invoke('notify', message)
});
