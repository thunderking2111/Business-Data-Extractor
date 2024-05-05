const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { channels } = require("./shared/constants");
const { startScrapping } = require("./scrapper");
const scrapGoogleMaps = require("./scrapper/plugins/google_maps_scrapper");
const { HEADERS: googleMapsHeaders } = require("./scrapper/plugins/google_maps_scrapper");
const scrapBingMaps = require("./scrapper/plugins/bing_maps_scrapper");

const isDev = true;

const datas = {};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
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
    let scrapperFn;
    let headers;
    switch (data.resource) {
        case "google":
            scrapperFn = scrapGoogleMaps;
            headers = googleMapsHeaders;
            break;
        case "bing":
            scrapperFn = scrapBingMaps;
        default:
            break;
    }
    console.log("Scrapping Started");
    let counter = 0;
    try {
        mainWindow.webContents.send(channels.TASK_UPDATES, { headers });
        const resultGenerator = startScrapping(scrapGoogleMaps, data.keywords, data.locations, false);
        for await (const result of resultGenerator) {
            if (result.row) {
                result.row.id = ++counter;
            }
            console.log(result);
            mainWindow.webContents.send(channels.TASK_UPDATES, result);
        }
    } catch (error) {
        console.log(error);
    }
});

ipcMain.on(channels.PROJECT_DATA, async (event, data) => {
    const res = {
        projects: require("./data/projects.json").projects,
        tasks: require("./data/tasks.json").tasks,
        columns: require("./data/columns.json").columns,
    }
    console.log("Res:", res);
    event.sender.send(channels.PROJECT_DATA, res);
});

ipcMain.on(channels.TASK_DATA, (event, data) => {
    const { taskId } = data;
    const res = {
        locations: ["ahmedabad", "mumbai"],
        keywords: ["school"],
        rows: [],
    }
    event.sender.send(channels.TASK_DATA, res);
});
