const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const api = require('./src/api');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  win.loadFile(path.join(__dirname, 'gui', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('init', async (event, path) => {
  return api.init(path);
});

ipcMain.handle('loadMusicHistory', async (event) => {
  return api.loadMusicHistory();
});


