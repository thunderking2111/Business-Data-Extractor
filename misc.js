const path = require("path");
const os = require("os");

function getDocumentsFolderPath() {
    const homeDir = os.homedir();
    let documentsPath;

    if (process.platform === "win32") {
        documentsPath = path.join(homeDir, "Documents");
    } else if (process.platform === "linux" || process.platform === "darwin") {
        documentsPath = path.join(homeDir, "Documents");
    } else {
        throw new Error("Unsupported platform: " + process.platform);
    }

    return documentsPath;
}

module.exports = { getDocumentsFolderPath };
