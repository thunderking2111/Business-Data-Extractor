const { EntitySchema } = require("typeorm");
const path = require("path");
const os = require('os');

const homeDir = os.homedir();
let documentsPath;

if (process.platform === 'win32') {
    documentsPath = path.join(homeDir, 'Documents');
} else if (process.platform === 'linux' || process.platform === 'darwin') {
    documentsPath = path.join(homeDir, 'Documents');
} else {
    documentsPath = "";
}


module.exports = new EntitySchema({
    name: "Settings",
    columns: {
        id: { primary: true, type: "int", generated: true },
        reportsDir: { type: "text", default: documentsPath },
    },
    hooks: {
        afterLoad: async (entity) => {
            const connection = entity.manager.connection;
            const settingsRepository = connection.getRepository("Settings");
            console.log("Inside Afterload hook");
            const count = await settingsRepository.count();
            if (count === 0) {
                const defaultSettings = new settingsRepository.create({
                    reportsDir: documentsPath,
                });
                await settingsRepository.save(defaultSettings);
            }
        },
    },
});
