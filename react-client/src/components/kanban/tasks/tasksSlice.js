import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";

const tasksAdapter = createEntityAdapter();

const initialState = tasksAdapter.getInitialState();

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        taskAdded: {
            reducer: (state, action) => {
                // debugger;
                tasksAdapter.addOne(state, action.payload.task);
            },
            prepare: (task) => {
                // debugger;
                return {
                    payload: {
                        task: {
                            ...task,
                            projectId: task.projectId || task.boardId,
                            id: task.id || nanoid(),
                        },
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
