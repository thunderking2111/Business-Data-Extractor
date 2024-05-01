const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { channels } = require("./shared/constants");
const { startScrapping } = require("./scrapper");
const scrapGoogleMaps = require("./scrapper/plugins/google_maps_scrapper");

const isDev = true;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js") // Load a preload script to expose __dirname to renderer process
        },
    });
    mainWindow.webContents.openDevTools();
    if (isDev) {
        const startURL = "http://localhost:3000";
        mainWindow.loadURL(startURL);
    } else {
        mainWindow.loadFile(path.join(__dirname, "react-client/build/index.html"));
    }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on(channels.SCRAPP, async (event, data) => {
    if (data.resource === "google") {
        const results = await startScrapping(scrapGoogleMaps, isDev);
        event.sender.send(channels.SCRAPP, results);
    }
});

ipcMain.on(channels.PROJECT_DATA, async (event, data) => {
    const res = {
        projects: require("./data/projects.json"),
        tasks: require("./data/tasks.json"),
    }
    event.sender.send(channels.PROJECT_DATA, res);
});
