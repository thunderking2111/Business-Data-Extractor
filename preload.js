const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("./shared/constants");

const electronAPIMethods = {
    channels,
    scrapSend: (data) => ipcRenderer.send(channels.SCRAPP, data),
    scrapStop: (taskId) => ipcRenderer.send(channels.SCRAPP_STOP, taskId),
    scrapListen: (cb) => ipcRenderer.on(channels.SCRAPP, cb),
    sendProjectDataReq: (data = false) => ipcRenderer.send(channels.PROJECT_DATA, data),
    receiveProjectData: (cb) => ipcRenderer.on(channels.PROJECT_DATA, cb),
    sendTaskDataReq: (data) => ipcRenderer.send(channels.TASK_DATA, data),
    receiveTaskData: (cb) => ipcRenderer.on(channels.TASK_DATA, cb),
    removeTaskDataListeners: () => ipcRenderer.removeAllListeners(channels.TASK_DATA),
    listenForTaskUpdates: (cb) => ipcRenderer.on(channels.TASK_UPDATES, cb),
    stopListeningForTaskUpdates: () => ipcRenderer.removeAllListeners(channels.TASK_UPDATES),
    resetTask: (data) => ipcRenderer.send(channels.RESET_TASK, data),
    removeAllListeners: () => ipcRenderer.removeAllListeners(),

    updateTaskRecord: (data) => ipcRenderer.send(channels.UPDATE_TASK_DB, data),
    removeTaskRecord: (taskId) => ipcRenderer.send(channels.REMOVE_TASK_DB, taskId),
    createTaskRecord: (data) => ipcRenderer.send(channels.CREATE_TASK_DB, data),
    receiveNewTaskRecord: (cb) => ipcRenderer.on(channels.CREATE_TASK_DB, cb),
    removeNewTaskListener: () => ipcRenderer.removeAllListeners(channels.CREATE_TASK_DB),
    updateProjectRecord: (data) => ipcRenderer.send(channels.UPDATE_PROJECT_DB, data),
    removeProjectRecord: (projectId) => ipcRenderer.send(channels.REMOVE_PROJECT_DB, projectId),
    createProjectRecord: (data) => ipcRenderer.send(channels.CREATE_PROJECT_DB, data),
    receiveNewProjectRecord: (cb) => ipcRenderer.on(channels.CREATE_PROJECT_DB, cb),
    removeNewProjectListener: () => ipcRenderer.removeAllListeners(channels.CREATE_PROJECT_DB),

    exportAsCsv: (taskId) => ipcRenderer.send(channels.EXPORT_CSV, taskId),
    exportAsExcel: (taskId) => ipcRenderer.send(channels.EXPORT_EXCEL, taskId),
    receiveExportConfirmation: (cb) => ipcRenderer.on(channels.TOASTER_NOTIFICATION, cb),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPIMethods);

module.exports = { electronAPIMethods };
