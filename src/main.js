const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { Client } = require('pg');

const preloadPath = path.join(__dirname, 'preload.js');
const indexPath = path.join(__dirname, 'index.html');

let downloadItem = null; // Store the download item for pausing/resuming

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

  mainWindow.webContents.on('did-start-loading', () => {
    downloadItem = null; // Reset download item on new navigation
  });
}

// Function to initiate download and return download item
async function startDownload(url) {
  const { download } = await import('electron-dl');
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

ipcMain.handle('resume-download', async () => {
  if (downloadItem) {
    try {
      await downloadItem.resume();
      console.log('Download resumed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error resuming download:', error.message);
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, message: 'No paused download to resume' };
  }
});



async function checkConnection() {
  const client = new Client({
    host: 'localhost', // Replace with your PostgreSQL server hostname
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



async function checkExtensions() {
  const client = new Client({
    // Your connection details (host, port, user, password)
    host: 'localhost', // Replace with your PostgreSQL server hostname
    port: 5432, // Default port for PostgreSQL
    user: 'postgres', // Replace with your PostgreSQL username
    password: '1234567890', // Replace with your PostgreSQL password
    database: 'electronApp' // Replace with your database name
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM pg_extension;');
    const installedExtensions = result.rows.map((row) => row.name);

    // Check if the desired extensions are present in the list
    // (implement logic to compare with expected extensions)

    console.log('Installed Extensions:', installedExtensions);
  } catch (err) {
    console.error('Error checking extensions:', err);
  } finally {
    await client.end();
  }
}

checkExtensions();

// async function performCrudOperations() {
//   const client = new Client({
//     host: 'localhost', // Replace with your PostgreSQL server hostname
//     port: 5432, // Default port for PostgreSQL
//     user: 'postgres', // Replace with your PostgreSQL username
//     password: '1234567890', // Replace with your PostgreSQL password
//     database: 'electronApp' // Replace with your database name
//   });

//   try {
//     await client.connect();

//     // 2. INSERT Example
//     const newEmail = 'jane.doe@example.com';
//     const insertQuery = 'INSERT INTO users (email) VALUES ($1)';
//     await client.query(insertQuery, [newEmail]);
//     console.log('INSERT successful');


//     // 1. SELECT Example
//     const name = 'John Doe';
//     const selectQuery = 'SELECT * FROM users WHERE name = $1'; // Prepared statement
//     const selectResult = await client.query(selectQuery, [name]);
//     console.log('SELECT results:', selectResult.rows);

    
//     // 3. UPDATE Example (assuming an ID column)
//     const userId = 1;
//     const newName = 'Jane Doe';
//     const updateQuery = 'UPDATE users SET name = $1 WHERE id = $2';
//     await client.query(updateQuery, [newName, userId]);
//     console.log('UPDATE successful');

//     // 4. DELETE Example (assuming an ID column)
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

// Other IPC handlers and app lifecycle events...

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
