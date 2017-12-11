const {app, BrowserWindow, shell, Menu} = require('electron');
const path = require('path');
const url = require('url');

let window;

function createWindow() {
    window.loadURL(__dirname+'/../build/index.html');

    Menu.setApplicationMenu(null);

    window.on('closed', () => {
        window = null;
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
