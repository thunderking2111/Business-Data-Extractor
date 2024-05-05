import { channels } from "../shared/constants";

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

interface ElectronAPI {
    scrapSend: (data: any) => void;
    scrapListen: (cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    sendProjectDataReq: (data?: any) => void;
    receiveProjectData: (cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    sendTaskDataReq: (data: any) => void;
    receiveTaskData: (cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    removeTaskDataListeners: () => void;
    listenForTaskUpdates: (cb: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
    stopListeningForTaskUpdates: () => void;
    removeAllListeners: () => void;
    channels: typeof channels;
}
