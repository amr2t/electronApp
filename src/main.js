// import {preload} from './preload.js';
// import {renderer} from './renderer.js';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
// const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
// const { download } = require('electron-dl');
const ProgressBar = require('electron-progressbar');
const { Client } = require('pg');

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
  //------------------------
  
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

function verifyPostgreSQLFiles() {
  
}

async function checkConnection() {
  const client = new Client({
    host: 'your_host', // Replace with your PostgreSQL server hostname
    port: 5432, // Default port for PostgreSQL
    user: 'postgres', // Replace with your PostgreSQL username
    password: '1234567890', // Replace with your PostgreSQL password
    database: 'electronApp' // Replace with your database name
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database successfully.');
  } catch (err) {
    console.error('Error connecting to database:', err);
    // Handle connection errors (e.g., display an error message to the user)
  } finally {
    await client.end();
  }
}

checkConnection();



// async function performCrudOperations() {
//   const client = new Client({
//     host: 'your_host', // Replace with your PostgreSQL server hostname
//     port: 5432, // Default port for PostgreSQL
//     user: 'postgres', // Replace with your PostgreSQL username
//     password: '1234567890', // Replace with your PostgreSQL password
//     database: 'electronApp' // Replace with your database name
//   });

//   try {
//     await client.connect();

//     // 1. SELECT Example
//     const name = 'John Doe';
//     const selectQuery = 'SELECT * FROM users WHERE name = $1'; // Prepared statement
//     const selectResult = await client.query(selectQuery, [name]);
//     console.log('SELECT results:', selectResult.rows);

//     // 2. INSERT Example
//     const newEmail = 'jane.doe@example.com';
//     const insertQuery = 'INSERT INTO users (email) VALUES ($1)';
//     await client.query(insertQuery, [newEmail]);
//     console.log('INSERT successful');

//     // 3. UPDATE Example 
//     const userId = 1;
//     const newName = 'Jane Doe';
//     const updateQuery = 'UPDATE users SET name = $1 WHERE id = $2';
//     await client.query(updateQuery, [newName, userId]);
//     console.log('UPDATE successful');

//     // 4. DELETE Example 
//     const deleteId = 2;
//     const deleteQuery = 'DELETE FROM users WHERE id = $1';
//     const deleteResult = await client.query(deleteQuery, [deleteId]);
//     console.log('DELETE rows affected:', deleteResult.rowCount);

//   } catch (err) {
//     console.error('Error during CRUD operations:', err);
//   } finally {
//     await client.end();
//   }
// }

// performCrudOperations();

// async function checkExtensions() {
//   const client = new Client({
//     // Your connection details (host, port, user, password)
//   });

//   try {
//     await client.connect();
//     const result = await client.query('SELECT * FROM pg_extension;');
//     const installedExtensions = result.rows.map((row) => row.name);

//     // Check if the desired extensions are present in the list
//     // (implement logic to compare with expected extensions)

//     console.log('Installed Extensions:', installedExtensions);
//   } catch (err) {
//     console.error('Error checking extensions:', err);
//   } finally {
//     await client.end();
//   }
// }

// checkExtensions();

// async function testExtensionFunctionality() {
//   const client = new Client({
//     // Your connection details
//   });

//   try {
//     await client.connect();
//     const result = await client.query('SELECT my_extension_function(10);');
//     console.log('Extension function result:', result.rows[0]); // Check for expected output
//   } catch (err) {
//     console.error('Error testing extension:', err);
//     // Handle potential errors (e.g., function not found)
//   } finally {
//     await client.end();
//   }
// }

// testExtensionFunctionality();


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

