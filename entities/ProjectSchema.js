const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Project",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "text"
        }
    },
    relations: {
        tasks: {
            target: "Task",
            type: "one-to-many",
            cascade: true,
            inverseSide: 'project'
        }
    }
});
