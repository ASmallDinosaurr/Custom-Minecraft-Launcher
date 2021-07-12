//-- Defines
const {app, BrowserWindow} = require('electron');
const path = require('path');

function createWindow() {
    //-- Create new window
    const win = new BrowserWindow({
        resizable: false,
        width: 350,
        height: 570,
        webPreferences: {nodeIntegration: true}
    });
    
    win.loadFile(path.join(__dirname, 'index.html'));  //--- Load URL into new window    
    win.removeMenu();  //-- Remove "help" and other stuff bar
    //win.webContents.openDevTools()
    //win.setIcon(path.join(__dirname, '/resources/minecraft.ico'));
}

//-- Run createWindow
app.on('ready', createWindow);