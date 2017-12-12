const {app, BrowserWindow, shell, Menu, net, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

let window;

function createWindow() {
    window = new BrowserWindow({width: 1280, height: 960});
    window.loadURL(__dirname + '/../build/index.html');

    Menu.setApplicationMenu(null);

    window.on('closed', () => {
        window = null;
    });

    window.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    setTimeout(checkUpdate, 2500);
}

function checkUpdate() {
    const request = net.request({
        method: 'GET',
        protocol: 'https:',
        hostname: 'karquid.net',
        port: 443,
        path: '/znymmgr/latest_version?date='+Math.floor((new Date()).getTime() / 1000)
    });
    request.end();

    request.on('response', response => {
        let res = '';
        response.on('data', (chunk) => {
            res += chunk;
        });
        response.on('end', () => {
            if (JSON.parse(res)['version'] !== app.getVersion()) {
                window.webContents.send(
                    'can_update',
                    JSON.parse(res)['version']
                );
            }
        });
    })
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
