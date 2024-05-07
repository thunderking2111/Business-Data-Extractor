const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ScrapData",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        keyword: { type: "text" },
        location: { type: "text" },
        data: { type: "text" },
    },
    relations: {
        task: {
            target: "Task",
            type: "many-to-one",
            joinColumn: {
                name: 'task_id',
            },
            inverseSide: "scrapDatas",
        },
    },
});
