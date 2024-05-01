const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("./shared/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    scrapSend: (data) => ipcRenderer.send(channels.SCRAPP, data),
    scrapListen: (cb) => ipcRenderer.on(channels.SCRAPP, cb),
    sendProjectDataReq: (data=false) => ipcRenderer.send(channels.PROJECT_DATA, data),
    receiveProjectData: (cb) => ipcRenderer.on(channels.PROJECT_DATA, cb),
    removeAllEventListeners: () => ipcRenderer.removeAllListeners(),
    channels,
});
