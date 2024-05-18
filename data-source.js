const { DataSource } = require("typeorm");
const TaskSchema = require("./entities/TaskSchema");
const ProjectSchema = require("./entities/ProjectSchema");
const ScrapData = require("./entities/ScrapData");
const path = require("path");
const os = require('os');
const SettingsSchema = require("./entities/SettingsSchema");

const IS_DEV = process.env.IS_DEV ? process.env.IS_DEV === 'true' : false;

function getDocumentsFolderPath() {
    const homeDir = os.homedir();
    let documentsPath;

    if (process.platform === 'win32') {
        documentsPath = path.join(homeDir, 'Documents');
    } else if (process.platform === 'linux' || process.platform === 'darwin') {
        documentsPath = path.join(homeDir, 'Documents');
    } else {
        throw new Error('Unsupported platform: ' + process.platform);
    }

    return documentsPath;
}

const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: path.join(__dirname, IS_DEV ? "" : "resources", "main.sqlite"),
    synchronize: true,
    logging: true,
    entities: [TaskSchema, ProjectSchema, ScrapData, SettingsSchema],
    subscribers: [],
    migrations: [],
});

const dataSourceDefered = AppDataSource.initialize();
dataSourceDefered.then(async (db) => {
    const settingsRepository = db.getRepository("Settings");

    const count = await settingsRepository.count();
    if (count === 0) {
        const defaultSettings = settingsRepository.create({
            reportsDir: getDocumentsFolderPath(),
        });
        await settingsRepository.save(defaultSettings);
    }
});

// AppDataSource
//     .initialize()
//     .then(async (db) => {
//         const projectrepo = db.getRepository("Project");
//         const task1 = {
//             name: "deletedtask1",
//             stage: "todo",
//             description: "",
//             resource: "google",
//             sequence: 1,
//         }
//         const task2 = {
//             name: "deletedtask2",
//             stage: "todo",
//             description: "",
//             resource: "google",
//             sequence: 1,
//         }
//         const proj1 =  {
//             id: 5,
//                     name: "Proj3",
//                     tasks: [task1, task2]
//                 };
//                 debugger;
//         const proj = await projectrepo.save(proj1);
//         const taskid1 = proj.tasks[0].id;
//         const taskid2 = proj.tasks[1].id;
//         debugger;
//         const taskrepo = db.getRepository("Task");
//         await taskrepo.delete(proj.tasks[0].id);
//         const data2 = await projectrepo.findOne({
//             where: {
//                 id: proj.id,
//             },
//             relations: ["tasks"],
//         });
//         debugger;
//         await projectrepo.remove(data2);
//         const data3 = await projectrepo.findOne({
//         where: {
//                 id: proj.id,
//             },
//             relations: ["tasks"],
//         })
//         const data4 = await taskrepo.findOne({
//             where: {
//                 id: taskid1
//             },
//             relations: ["project"],
//         })
//         const data5 = await taskrepo.findOne({
//             where: {
//                 id: taskid2
//             },
//             relations: ["project"],
//         })
//         debugger;
//         // taskrepo.delete()
//             });
//         debugger;
//         const project = await projectrepo.findOne({
//             where: {
//                 id: 5,
//             },
//             relations: ["tasks"]
//         })
//         project.tasks.push(task1);
//         const proj2 = await projectrepo.save(project);
//         debugger;
//         data.forEach(d => {
//             console.log(d);
//             console.log(d.tasks);
//         })
//         await new Promise(res => setTimeout(res, 10000));
//     })
    // .then(async (db) => {
    //     console.log("")
    //     console.log("Got something")
    //     console.log(db)
    //     console.log("")
    //     const proj1 = {
    //         name: "Proj2"
    //     };
    //     // const proj1 = new Project(0, "Proj1", []);
    //     const projrepo = await db.getRepository("Project");
    //     // await projrepo.save(proj1);
    //     const task1 = {
    //         name: "scrap",
    //         project: 0,
    //         stage: "todo",
    //         description: "",
    //         resource: "google",
    //         sequence: 1,
    //     }
    //     const taskRepo = db.getRepository("Task");
    //     // await taskRepo.save(task1);
    //     // await taskRepo.save(task2);
    //     proj1.tasks = [task1];
    //     await projrepo.save(proj1);
    //     const data2 = await AppDataSource.getRepository("Project").find({
    //         relations: ["tasks"],
    //     });
    //     const data = await AppDataSource.getRepository("Task").find({
    //         relations: ["project"],
    //     });
    //     console.log(data);
    //     console.log(data2);
    // }).catch(err => {
    //     console.log(err);
    // });

module.exports = { dataSource: AppDataSource, dataSourceDefered };
