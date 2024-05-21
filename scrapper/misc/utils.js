const path = require("path");
const fs = require("fs");

const CONSTANTS = {
    BROWSER_HEIGHT: 800,
    BROWSER_WIDTH: 1400,
    ITEM_SWITCH_DELAY: 1500,
    MAX_SCROLLS: 120,
    OBSERVER_DELAY: 5000,
    RESULTS_SCROLL_DELAY: 2000,
};

class ElNotFoundError extends Error {
    constructor(selector) {
        super(`Timeout waiting for: ${selector}`);
        this.name = this.constructor.name;
        this.selector = selector;
        Error.captureStackTrace(this, this.constructor);
    }
}

const sleep = (delay = 1000) => new Promise((resolve) => setTimeout(resolve, delay));

function getFormattedFileName(taskName) {
    // Convert the task name to lowercase
    let formattedName = taskName.toLowerCase();

    // Replace spaces with underscores
    formattedName = formattedName.replace(/\s+/g, "_");

    // Get the current date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(currentDate.getDate()).padStart(2, "0");

    // Append the current date to the formatted name
    formattedName += `_${year}-${month}-${day}`;

    return formattedName;
}

function getUniqueFilePath(dir, baseFileName, extension) {
    let filePath = path.join(dir, `${baseFileName}${extension}`);
    let counter = 1;

    while (fs.existsSync(filePath)) {
        filePath = path.join(dir, `${baseFileName}_${counter}${extension}`);
        counter++;
    }

    return filePath;
}

module.exports = { CONSTANTS, sleep, ElNotFoundError, getFormattedFileName, getUniqueFilePath };
