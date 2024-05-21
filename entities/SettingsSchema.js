const { EntitySchema } = require("typeorm");
const { getDocumentsFolderPath } = require("./../misc");

module.exports = new EntitySchema({
    name: "Settings",
    columns: {
        id: { primary: true, type: "int", generated: true },
        reportsDir: { type: "text", default: getDocumentsFolderPath() },
    },
});
