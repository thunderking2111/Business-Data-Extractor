const { contextBridge, ipcRenderer } = require("electron");
const { channels } = require("./shared/constants");

contextBridge.exposeInMainWorld('electronAPI', {
    scrapSend: (data) => ipcRenderer.send(channels.SCRAPP, data),
    scrapListen: (cb) => ipcRenderer.on(channels.SCRAPP, cb),
    sendProjectDataReq: (data=false) => ipcRenderer.send(channels.PROJECT_DATA, data),
    receiveProjectData: (cb) => ipcRenderer.on(channels.PROJECT_DATA, cb),
    sendTaskDataReq: (data) => ipcRenderer.send(channels.TASK_DATA, data),
    receiveTaskData: (cb) => ipcRenderer.on(channels.TASK_DATA, cb),
    removeTaskDataListeners: (cb) => ipcRenderer.removeListener(channels.TASK_DATA, cb),
    listenForTaskUpdates: (cb) => ipcRenderer.on(channels.TASK_UPDATES, cb),
    stopListeningForTaskUpdates: (cb) => ipcRenderer.removeListener(channels.TASK_UPDATES, cb),
    resetTask: (data) => ipcRenderer.send(channels.RESET_TASK, data),
    removeAllListeners: () => ipcRenderer.removeAllListeners(),
    channels,

    updateTaskRecord: (data) => ipcRenderer.send(channels.UPDATE_TASK_DB, data),
    removeTaskRecord: (taskId) => ipcRenderer.send(channels.REMOVE_TASK_DB, taskId),
    createTaskRecord: (data) => ipcRenderer.send(channels.CREATE_TASK_DB, data),
    receiveNewTaskRecord: (cb) => ipcRenderer.on(channels.CREATE_TASK_DB, cb),
    removeNewTaskListener: (cb) => ipcRenderer.removeListener(channels.CREATE_TASK_DB, cb),
    updateProjectRecord: (data) => ipcRenderer.send(channels.UPDATE_PROJECT_DB, data),
    removeProjectRecord: (projectId) => ipcRenderer.send(channels.REMOVE_PROJECT_DB, projectId),
    createProjectRecord: (data) => ipcRenderer.send(channels.CREATE_PROJECT_DB, data),
    receiveNewProjectRecord: (cb) => ipcRenderer.on(channels.CREATE_PROJECT_DB, cb),
    removeNewProjectListener: (cb) => ipcRenderer.removeListener(channels.CREATE_PROJECT_DB, cb),
});
