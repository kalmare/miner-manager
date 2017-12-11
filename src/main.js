const {app, BrowserWindow, shell, Menu} = require('electron');
const path = require('path');
const url = require('url');

let window;

function createWindow() {
    window = new BrowserWindow({width:1280, height:960});
    window.loadURL(__dirname+'/../build/index.html');

    Menu.setApplicationMenu(null);

    window.on('closed', () => {
        window = null;
    });

    window.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});
