// import {preload} from './preload.js';
// import {renderer} from './renderer.js';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
// const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
// const { download } = require('electron-dl');
const ProgressBar = require('electron-progressbar');

async function createWindow() {
  // console.log('object');
  const preloadPath = path.join(__dirname, 'preload.js');
  // console.log(`Preload script path: ${preloadPath}`);
  // console.log(`Does preload.js exist? ${fs.existsSync(preloadPath)}`);
  const indexPath = path.join(__dirname, 'index.html');

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
  const { download } = await import('electron-dl');

  try {
    await download(mainWindow, url, {
      onProgress: (progress) => {
        mainWindow.webContents.send('download-progress', progress);
      },
      onCompleted: () => {
        mainWindow.webContents.send('download-complete');
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-postgres', (event, installerPath) => {
  exec(installerPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
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

