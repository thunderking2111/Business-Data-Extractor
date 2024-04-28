import { arrayMove } from "@dnd-kit/sortable";
import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { selectActiveBoardId } from "../app/uiState";
import { taskAdded, taskMoved, taskRemoved, taskUpdated } from "../tasks/tasksSlice";

const columnsAdapter = createEntityAdapter();

const initialState = columnsAdapter.getInitialState();

const columnsSlice = createSlice({
    name: "columns",
    initialState,
    reducers: {
        columnAdded: {
            reducer: columnsAdapter.addOne,
            prepare: (column) => ({
                payload: { ...column, id: column.id || nanoid() },
            }),
        },
        columnUpdated: columnsAdapter.updateOne,
        columnsRemoved: columnsAdapter.removeMany,
    },
    extraReducers: (builder) => {
        builder
            .addCase(taskAdded, (state, action) => {
                const { task } = action.payload;
                state.entities[task.column]?.taskIds.push(task.id);
            })
            .addCase(taskMoved, (state, action) => {
                const { task, newColumnId, index } = action.payload;
                if (task.column !== newColumnId) {
                    const oldColumnTaskIds = state.entities[task.column].taskIds;
                    oldColumnTaskIds.splice(oldColumnTaskIds.indexOf(task.id), 1);
                    state.entities[newColumnId].taskIds.splice(index, 0, task.id);
                } else {
                    const taskIds = state.entities[newColumnId].taskIds;
                    const oldIndex = taskIds.indexOf(task.id);
                    state.entities[newColumnId].taskIds = arrayMove(taskIds, oldIndex, index);
                }
            })
            .addCase(taskUpdated, (state, action) => {
                const { id, changes, oldColumn } = action.payload;
                if (changes.column) {
                    const oldColumnTaskIds = state.entities[oldColumn].taskIds;
                    oldColumnTaskIds.splice(oldColumnTaskIds.indexOf(id), 1);
                    state.entities[changes.column].taskIds.splice(0, 0, id);
                }
            })
            .addCase(taskRemoved, (state, action) => {
                const { task } = action.payload;
                const columnTaskIds = state.entities[task.column].taskIds;
                columnTaskIds.splice(columnTaskIds.indexOf(task.id), 1);
            });
    },
});

export const {
    selectIds: selectColumnIds,
    selectById: selectColumnById,
    selectAll: selectAllColumns,
} = columnsAdapter.getSelectors((state) => state.columns);

export const selectColumnTaskIds = createSelector(selectColumnById, (column) =>
    column ? column.taskIds : [],
);

const selectActiveBoard = createSelector(
    [(state) => state.boards, (state) => state.UI.activeBoardId],
    (boards, activeBoardId) => (activeBoardId ? boards.entities[activeBoardId] : undefined),
);

export const selectActiveBoardColumnIds = createSelector(
    [selectActiveBoardId, selectAllColumns],
    (activeBoardId, columns) =>
        columns.filter((column) => column.boardId === activeBoardId).map((column) => column.id),
);

export const selectActiveColumns = createSelector(
    [selectAllColumns, selectActiveBoard],
    (columns, activeBoard) =>
        columns.filter((column) => activeBoard?.columnIds.includes(column.id)),
);

export const { columnAdded, columnUpdated, columnsRemoved } = columnsSlice.actions;

export default columnsSlice.reducer;
