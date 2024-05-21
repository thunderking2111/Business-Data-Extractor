import { electronAPIMethods } from "../preload";

declare global {
    interface Window {
        electronAPI: typeof electronAPIMethods;
    }
}
