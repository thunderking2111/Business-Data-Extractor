const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("./shared/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    scrapSend: (data) => ipcRenderer.send(channels.SCRAPP, data),
    scrapListen: (cb) => ipcRenderer.on(channels.SCRAPP, cb),
    sendProjectDataReq: (data=false) => ipcRenderer.send(channels.PROJECT_DATA, data),
    receiveProjectData: (cb) => ipcRenderer.on(channels.PROJECT_DATA, cb),
    sendTaskDataReq: (data) => ipcRenderer.send(channels.TASK_DATA, data),
    receiveTaskData: (cb) => ipcRenderer.on(channels.TASK_DATA, cb),
    removeTaskDataListeners: () => ipcRenderer.removeListener(channels.TASK_DATA),
    listenForTaskUpdates: (cb) => ipcRenderer.on(channels.TASK_UPDATES, cb),
    stopListeningForTaskUpdates: (cb) => ipcRenderer.removeListener(channels.TASK_UPDATES, cb),
    removeAllListeners: () => ipcRenderer.removeAllListeners(),
    channels,
});
