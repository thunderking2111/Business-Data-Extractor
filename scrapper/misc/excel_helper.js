const ExcelJS = require("exceljs");
const { getFormattedFileName, getUniqueFilePath } = require("./utils");

// Function to create Excel file
async function createExcel(headers, data, reportsDir, taskName) {
    // Create a workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Define header row style
    const headerRowStyle = {
        font: { bold: true },
    };

    // Add header row
    worksheet.addRow(headers.map((header) => header.value)).eachCell((cell) => {
        cell.style = headerRowStyle;
    });

    // Add data rows
    const rows = data.map((item) => headers.map((header) => item[header.key]));
    worksheet.addRows(rows);

    // Freeze the header row
    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
    const outputFilePath = getUniqueFilePath(reportsDir, getFormattedFileName(taskName), ".xlsx");

    await workbook.xlsx.writeFile(outputFilePath);
}

module.exports = { createExcel };
