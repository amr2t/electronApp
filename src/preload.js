const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  downloadPostgres: (url) => ipcRenderer.invoke('download-postgres', url),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onDownloadComplete: (callback) => ipcRenderer.on('download-complete', callback),

  // installPostgres: (installerPath) => {
  //   console.log('Invoking install-postgres with path:', installerPath);
  //   return ipcRenderer.invoke('install-postgres', installerPath);
  // },
  // downloadSomething: (url) => {
  //   console.log('Invoking download-something with URL:', url);
  //   return ipcRenderer.invoke('download-something', url);
  // }
});
