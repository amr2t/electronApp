const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
// const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
// const { download } = require('electron-dl');
const ProgressBar = require('electron-progressbar');

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  mainWindow.loadFile(indexPath);
  mainWindow.webContents.openDevTools();
  
}


ipcMain.handle('download-postgres', async (event, url) => {
  dialog.showMessageBox({
    type: 'error' ,
    buttons: ['Contact', 'Ok'],
    defaultId: 0,
    message: 'Are you sure you want to download PostgreSQL?',
    detail: 'Downloading PostgreSQL will take a while. Do you want to continue?',
    cancelId: 1,
    
  })
  console.log(url);
  const mainWindow = BrowserWindow.getFocusedWindow();
  try {
    downloadItem = await download(mainWindow, url, {
      onProgress: (progress) => {
        mainWindow.webContents.send('download-progress', progress);
      },
      onCompleted: () => {
        downloadItem = null; // Clear download item on completion
        mainWindow.webContents.send('download-complete');
      },
    });

    // Check for pause and resume methods
    if (typeof downloadItem.pause !== 'function' || typeof downloadItem.resume !== 'function') {
      console.warn('The downloadItem does not support pause/resume functionality.');
      downloadItem.pause = () => Promise.reject(new Error('Pause not supported'));
      downloadItem.resume = () => Promise.reject(new Error('Resume not supported'));
    }

    return downloadItem; // Return download item for external use
  } catch (error) {
    console.error('Error during download:', error);
    throw error; // Throw error for external handling
  }
}

ipcMain.handle('download-postgres', async (event, url) => {
  try {
    await startDownload(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-download', async () => {
  if (downloadItem) {
    try {
      await downloadItem.pause();
      console.log('Download paused successfully');
      return { success: true };
    } catch (error) {
      console.error('Error pausing download:', error.message);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, message: 'No active download to pause' };
  }
});

ipcMain.handle('download-something', async (event, url) => {
  try {
    const { download } = await import('electron-dl');
    await download(BrowserWindow.getFocusedWindow(), url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('notify', (event, dialog) => {
  dialog.showMessageBox({
    message: 'Notification',  
    buttons: ['OK', 'Contact','Cancel'],
    defaultId: 0,
  })
  console.log(message);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
