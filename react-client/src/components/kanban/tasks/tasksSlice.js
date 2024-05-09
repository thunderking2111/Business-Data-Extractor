import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { boardAdded, boardRemoved } from "../boards/boardsSlice2";

const tasksAdapter = createEntityAdapter();

const initialState = tasksAdapter.getInitialState();

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        taskAdded: {
            reducer: tasksAdapter.addOne,
            prepare: (task) => {
                return {
                    payload: {
                        ...task,
                        headers: [],
                        id: task.id || nanoid(),
                    },
                    meta: {},
                    error: {},
                };
            },
        },
        taskUpdated: {
            reducer: tasksAdapter.updateOne,
            prepare: (task, changes) => ({
                payload: { id: task.id, projectId: task.projectId, changes, oldStage: task.stage },
            }),
        },
        taskRemoved: (state, action) => tasksAdapter.removeOne(state, action.payload.task.id),
        tasksRemoved: tasksAdapter.removeMany,
        taskMoved: (state, action) => {
            const { task, newStageId } = action.payload;
            state.entities[task.id].stage = newStageId;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(boardAdded, (state, action) => {
                const { tasks } = action.payload;
                tasks.forEach((task) => {
                    task.projectId = action.payload.id;
                    tasksAdapter.setOne(state, task);
                });
            })
            .addCase(boardRemoved, (state, action) => {
                const projectId = action.payload;
                const taskIdsToRemove = Object.values(state.entities)
                    .filter((task) => task.projectId === projectId)
                    .map((task) => task.id);
                // Remove tasks with the specified IDs
                tasksAdapter.removeMany(state, taskIdsToRemove);
            });
    },
});

export const { selectById: selectTaskById, selectAll: selectAllTasks } = tasksAdapter.getSelectors(
    (state) => state.tasks,
);

export const selectTasksByIds = createSelector(
    [selectAllTasks, (_state, ids) => ids],
    (tasks, ids) => {
        return tasks.filter((task) => ids.includes(task.id));
    },
);

export const { taskAdded, taskUpdated, taskMoved, taskRemoved, tasksRemoved } = tasksSlice.actions;

export default tasksSlice.reducer;
