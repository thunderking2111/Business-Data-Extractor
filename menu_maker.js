const { app, dialog, Menu, shell } = require("electron");
const { dataSource, dataSourceDefered } = require("./data-source");

const IS_MAC = process.platform === "darwin";
const IS_DEV = process.env.IS_DEV ? process.env.IS_DEV === "true" : false;

const template = [
    ...(IS_MAC
        ? [
              {
                  label: app.name,
                  submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
              },
          ]
        : []),
    {
        label: "File",
        submenu: [
            {
                label: "Set Reports Directory",
                click: async () => {
                    await dataSourceDefered;
                    const settingsRepo = dataSource.getRepository("Settings");
                    const setting = (await settingsRepo.find())[0];
                    const path = await dialog.showOpenDialog({
                        title: "Select Directory to store exports",
                        defaultPath: setting.reportsDir,
                        properties: ["openDirectory", "createDirectory"],
                    });
                    console.log(path);
                    if (!path.canceled) {
                        setting.reportsDir = path.filePaths[0];
                        await settingsRepo.save(setting);
                    }
                },
            },
            {
                label: "Open Reports",
                click: async () => {
                    await dataSourceDefered;
                    const settingsRepo = dataSource.getRepository("Settings");
                    const setting = (await settingsRepo.find())[0];
                    await shell.openPath(setting.reportsDir);
                },
            },
            { role: "quit" },
        ],
    },
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            ...(IS_MAC
                ? [
                      { role: "pasteAndMatchStyle" },
                      { role: "delete" },
                      { role: "selectAll" },
                      { type: "separator" },
                      {
                          label: "Speech",
                          submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
                      },
                  ]
                : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
        ],
    },
    {
        label: "About",
        submenu: [{ role: "about" }, { role: "help" }],
    },
    ...(IS_DEV
        ? [
              {
                  label: "Dev",
                  submenu: [
                      { role: "reload" },
                      { role: "forceReload" },
                      { role: "toggleDevTools" },
                  ],
              },
          ]
        : [{
            label: "Dev",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
            ],
        },]),
];

module.exports = {
    mainMenu: Menu.buildFromTemplate(template),
};
