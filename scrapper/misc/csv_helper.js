const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { getUniqueFilePath, getFormattedFileName } = require("./utils");

async function createCSV(headers, data, reportsDir, taskName) {
    const outputFilePath = getUniqueFilePath(reportsDir, getFormattedFileName(taskName), ".csv");

    const csvWriter = createCsvWriter({
        path: outputFilePath,
        header: headers.map((header) => ({ id: header.key, title: header.value })),
    });
    await csvWriter.writeRecords(data);
}

module.exports = { createCSV };
