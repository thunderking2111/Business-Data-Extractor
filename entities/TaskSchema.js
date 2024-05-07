const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Task",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        },
        stage: {
            type: "text",
            default: "todo",
        },
        description: {
            type: "varchar",
            default: "",
        },
        resource: {
            type: "text"
        },
        sequence: {
            type: "int",
            default: 0,
        },
        useProxy: { type: "int", default: 0},
        emailMandatory: { type: "int", default: 0 },
        maxResPerQuery: { type: "int", default: 1000 },
        delay: { type: "int", default: 10000 },
        keywords: { type: "text", default: "" },
        locations: { type: "text", default: "" },
    },
    relations: {
        project: {
            target: "Project",
            type: "many-to-one",
            joinColumn: {
                name: 'project_id',
            },
            inverseSide: "tasks",
        },
        scrapDatas: {
            target: "ScrapData",
            type: "one-to-many",
            cascade: true,
            inverseSide: "task",
        },
    },
});
