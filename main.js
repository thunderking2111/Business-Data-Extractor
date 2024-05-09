const { app, BrowserWindow, ipcMain } = require("electron");
const { dataSource, dataSourceDefered } = require("./data-source");
const path = require("path");
const { channels } = require("./shared/constants");
const { startScrapping } = require("./scrapper");
const scrapGoogleMaps = require("./scrapper/plugins/google_maps_scrapper");
const { HEADERS: googleMapsHeaders } = require("./scrapper/plugins/google_maps_scrapper");
const scrapBingMaps = require("./scrapper/plugins/bing_maps_scrapper");
const { HEADERS: bingMapsHeader } = require("./scrapper/plugins/bing_maps_scrapper");

const isDev = true;

let mainWindow;

const browserByTask = {};
let initialDbProcessDefered;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "preload.js") // Load a preload script to expose __dirname to renderer process
        },
    });
    mainWindow.webContents.openDevTools();
    if (isDev) {
        const startURL = "http://localhost:3000";
        mainWindow.loadURL(startURL);
    } else {
        mainWindow.loadFile(path.join(__dirname, "react-client/build/index.html"));
    }
}

app.on("ready", async () => {
    initialDbProcessDefered = new Promise(async (resolve) => {
        await dataSourceDefered;
        const taskRepo = dataSource.getRepository("Task");
        const ongoingTasks = await taskRepo.findBy({ stage: "ongoing" });
        await taskRepo.save(ongoingTasks.map((task) => {
            return {
                id: task.id,
                stage: "done",
            };
        }))
        resolve();
    });
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});

app.on("before-quit", async () => {
    console.log("Called Before quit");
    const taskRepo = dataSource.getRepository("Task");
    const taskIds = Object.keys(browserByTask);
    if (!taskIds || !taskIds.length) {
        return;
    }
    const tasks = taskRepo.findBy({ id: taskIds });
    const updatedTasks = [];
    const proms = [];
    for (const task of tasks) {
        updatedTasks.push({
            id: task.id,
            stage: "done",
        });
        const browser = browserByTask[task.id].browser;
        (await browser.pages()).forEach(page => proms.push(page.close()));
        proms.push(browser.close());
    }
    proms.push(taskRepo.save(updatedTasks));
    await Promise.all(proms);
    await dataSource.destroy();
});

ipcMain.on(channels.SCRAPP, async (event, data) => {
    let stopScrapping = false;
    const { task, ...changes } =  data;
    debugger;
    let taskRecord;
    try {
        const taskRepo = dataSource.getRepository("Task");
        const updateData = prepareTaskDataForDb(changes);

        taskRecord = await taskRepo.save({
            id: task.id,
            ...updateData,
        });
        taskRecord.scrapDatas = taskRecord.scrapDatas || [];
    } catch (err) {
        console.log(err);
    }
    let scrapperFn;
    let headers;
    switch (task.resource) {
        case "google-maps":
            scrapperFn = scrapGoogleMaps;
            headers = googleMapsHeaders;
            break;
        case "bing-maps":
            scrapperFn = scrapBingMaps;
            headers = bingMapsHeader;
        default:
            break;
    }
    console.log("Scrapping Started");
    let counter = 0;
    try {
        const taskRepo = dataSource.getRepository("Task");
        mainWindow.webContents.send(channels.TASK_UPDATES, { taskId: task.id, headers });
        const resultGenerator = startScrapping(scrapperFn, changes.keywords, changes.locations, changes.maxResPerQuery, changes.delay, () => stopScrapping, false);
        browserByTask[taskRecord.id] = { browser: (await resultGenerator.next()), stop: () => stopScrapping = true };
        for await (const result of resultGenerator) {
            if (result.row) {
                result.row.id = ++counter;
                taskRecord.scrapDatas.push({
                    location: result.location,
                    keyword: result.keyword,
                    data: convertScrapDataForDB(result.row),
                })
                console.log(taskRecord.scrapDatas);
                taskRepo.save(taskRecord);
                delete result.keyword;
                delete result.location;
            }
            result.taskId = task.id;
            console.log(result);
            mainWindow.webContents.send(channels.TASK_UPDATES, result);
        }
        delete browserByTask[taskRecord.id];
        await taskRepo.save({
            id: taskRecord.id,
            stage: "done",
        })
    } catch (error) {
        console.log(error);
    }
});

ipcMain.on(channels.PROJECT_DATA, async (event, data) => {
    await initialDbProcessDefered;
    const projectRepo = dataSource.getRepository("Project");
    const projectData = await projectRepo.find({relations: ["tasks", "tasks.project"]});
    for (const project of projectData) {
        project.tasks = project.tasks.map((task) => prepareTaskDataForClient(task));
    }
    console.log(projectData);
    const res = {
        projects: projectData,
        columns: require("./data/columns.json").columns,
    }
    console.log("Res:", res);
    event.sender.send(channels.PROJECT_DATA, res);
});

ipcMain.on(channels.TASK_DATA, async (event, data) => {
    const { taskId } = data;
    try {
        const taskRepo = dataSource.getRepository("Task");
        const task = await taskRepo.findOne({
            where: {
                id: taskId,
            },
            relations: ["scrapDatas"],
        })
        debugger;
        task.scrapDatas = task.scrapDatas ? task.scrapDatas.map((data) => convertScrapDataForClient(data)): [];
        if (task.stage !== "todo") {
            switch(task.resource) {
                case "google-maps":
                    task.headers = googleMapsHeaders;
                    break;
                case "bing-maps":
                    task.headers = bingMapsHeader;
                    break;
                default:
                    break;
            }
        }
    event.sender.send(channels.TASK_DATA, prepareTaskDataForClient(task));
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.RESET_TASK, async (event, data) => {
    const { taskId, changes } = data;
    try {
        const taskRepo = dataSource.getRepository("Task");
        const scrapDataRepo = dataSource.getRepository("ScrapData");
        const task = await taskRepo.findOne({
            where: { id: taskId },
            relations: ["scrapDatas"],
        });
        browserByTask[taskId]?.stop();
        await scrapDataRepo.delete(task.scrapDatas.map(data => data.id));
        task.scrapDatas = [];
        Object.assign(task, prepareTaskDataForDb(changes));
        await taskRepo.save(task);
    } catch (err) {
        console.log(err);
    }
})

// Database related listeners

const convertScrapDataForClient = (scrapData) => {
    scrapData.data = JSON.parse(scrapData.data);
    return scrapData;
}

const convertScrapDataForDB = (data) => {

    return JSON.stringify(data);
}

const prepareTaskDataForClient = (data) => {
    const updatedData = {...data};
    if (updatedData.project) {
        updatedData.projectId = typeof updatedData.project === "object" ? updatedData.project.id : updatedData.project;
        delete updatedData.project;
    }
    if (updatedData.locations) {
        updatedData.locations = JSON.parse(updatedData.locations);
    }
    if (updatedData.keywords) {
        updatedData.keywords = JSON.parse(updatedData.keywords);
    }
    if (updatedData.useProxy) {
        updatedData.useProxy = updatedData.useProxy === 1 ? true : false;
    }
    if (updatedData.emailMandatory) {
        updatedData.emailMandatory = updatedData.emailMandatory === 1 ? true : false;
    }
    if (updatedData.maxResPerQuery) {
        updatedData.maxResPerQuery =  updatedData.maxResPerQuery === 1000 ? "max" : updatedData.maxResPerQuery;
    }
    if (updatedData.delay) {
        updatedData.delay = updatedData.delay === 100000 ? "random" : updatedData.delay;
    }
    return updatedData;
}

const prepareTaskDataForDb = (data) => {
    const updateData = { ...data };
    if (updateData.projectId) {
        updateData.project = updateData.projectId;
        delete updateData.projectId;
    }
    if (updateData.locations) {
        updateData.locations = JSON.stringify(updateData.locations);
    }
    if (updateData.keywords) {
        updateData.keywords = JSON.stringify(updateData.keywords);
    }
    if (updateData.useProxy) {
        updateData.useProxy = updateData.useProxy ? 1 : 0;
    }
    if (updateData.emailMandatory) {
        updateData.emailMandatory = updateData.emailMandatory ? 1 : 0;
    }
    if (updateData.maxResPerQuery) {
        updateData.maxResPerQuery = typeof updateData.maxResPerQuery === "string" ? 1000 : updateData.maxResPerQuery;
    }
    if (updateData.delay) {
        updateData.delay = typeof updateData.delay === "string" ? 100000 : updateData.delay;
    }
    return updateData;
}

ipcMain.on(channels.UPDATE_TASK_DB, async (event, data) => {
    const { task, changes } =  data;
    const updateData = prepareTaskDataForDb(changes);
    try {
        const taskRepo = dataSource.getRepository("Task");
        await taskRepo.save({
            id: task.id,
            ...updateData,
        });
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.REMOVE_TASK_DB, (event, taskId) => {
    try {
        const taskRepo = dataSource.getRepository("Task");
        taskRepo.delete(taskId);
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.CREATE_TASK_DB, async (event, data) => {
    console.log("called crate task")
    console.log(data);
    const createData = prepareTaskDataForDb(data);
    try {
        const projectRepo = dataSource.getRepository("Project");
        const project = await projectRepo.findOne({
            where: {
                id: data.projectId,
            },
            relations: ["tasks", "tasks.project"],
        });
        if (project) {
            project.tasks.push(createData);
            const updatedProject = await projectRepo.save(project);
            console.log(updatedProject);
            const newTask = updatedProject.tasks[updatedProject.tasks.length-1];
            console.log(newTask);
            event.sender.send(channels.CREATE_TASK_DB, {task: prepareTaskDataForClient(newTask)})
        }
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.UPDATE_PROJECT_DB, (event, data) => {
    const { id: projectId, changes } = data;
    try {
        const projectRepo = dataSource.getRepository("Project");
        projectRepo.save({
            id: projectId,
            ...changes,
        });
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.REMOVE_PROJECT_DB, async (event, projectId) => {
    try {
        const projectRepo = dataSource.getRepository("Project");
        const taskRepo = dataSource.getRepository("Task");
        const project = await projectRepo.findOne({
            where: {
                id: projectId
            },
            relations: ["tasks"],
        })
        await taskRepo.delete(project.tasks.map((task) => task.id));
        await projectRepo.delete(project.id);
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on(channels.CREATE_PROJECT_DB, async (event, data) => {
    try {
        const projectRepo = dataSource.getRepository("Project");
        const project = await projectRepo.save(data);
        event.sender.send(channels.CREATE_PROJECT_DB, project);
    } catch (err) {
        console.log(err);
    }
});
