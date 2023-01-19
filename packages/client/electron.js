/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 450,
        height: 767,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            // color: '#2f3241',
            // symbolColor: '#74b1be',
            height: 51,
        },
        trafficLightPosition: {
            x: 15,
            y: 18,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools({ mode: 'detach' });
    } else {
        win.loadFile('build/index.html');
    }
}

app.whenReady().then(() => {
    createWindow();
});
