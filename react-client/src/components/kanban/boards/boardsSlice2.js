import { arrayMove } from "@dnd-kit/sortable";
import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { selectActiveBoardId } from "../app/uiState";
import { taskAdded, taskMoved, taskRemoved, taskUpdated } from "../tasks/tasksSlice";

const boardsAdapter = createEntityAdapter();

const initialState = boardsAdapter.getInitialState();

const boardsSlice = createSlice({
    name: "boards",
    initialState,
    reducers: {
        boardAdded: {
            reducer: boardsAdapter.addOne,
            prepare: (board) => {
                // debugger;
                return {
                payload: { ...board, taskIds: board.taskIds || [], id: board.id || nanoid() },
            }},
        },
        boardUpdated: boardsAdapter.updateOne,
        boardsRemoved: boardsAdapter.removeMany,
        boardRemoved: boardsAdapter.removeOne,
    },
    extraReducers: (builder) => {
        builder
            .addCase(taskAdded, (state, action) => {
                // debugger;
                const { task } = action.payload;
                state.entities[task.projectId]?.taskIds.push(task);
            })
            .addCase(taskUpdated, (state, action) => {
                const { id: taskId, projectId, changes } = action.payload;
                const task = state.entities[projectId].taskIds.find((task) => task.id === taskId);
                if (task) {
                    Object.assign(task, changes);
                }
            })
            .addCase(taskMoved, (state, action) => {
                const { task, index } = action.payload;
                // debugger;
                const taskIds = state.entities[task.projectId].taskIds;
                const currentTask = taskIds.find((t) => t.id === task.id);
                const oldIndex = taskIds.indexOf(currentTask);
                state.entities[task.projectId].taskIds = arrayMove(taskIds, oldIndex, index);
            })
            .addCase(taskRemoved, (state, action) => {
                const { task } = action.payload;
                const stageTaskIds = state.entities[task.projectId].taskIds;
                stageTaskIds.splice(stageTaskIds.indexOf(task), 1);
            });
    },
});

export const {
    selectAll: selectAllBoards,
    selectById: selectBoardById,
    selectIds: selectBoardIds,
} = boardsAdapter.getSelectors((state) => state.boards);

export const selectBoardTasks = createSelector(selectBoardById, (board) => {
    return board?.taskIds ?? [];
});

export const selectActiveBoard = createSelector(
    [selectActiveBoardId, selectAllBoards],
    (activeBoardId, boards) => (activeBoardId ? boards[activeBoardId] : undefined),
);

export const selectColumnTaskIds = createSelector(
    [selectActiveBoard, (_, columnId) => columnId],
    (activeBoard, columnId) => {
        if (activeBoard) {
            // debugger;
            return activeBoard.taskIds.filter((task) => task.stage === columnId).map(task => task.id);
        }
    },
);

export const { boardAdded, boardUpdated, boardsRemoved, boardRemoved } = boardsSlice.actions;

export default boardsSlice.reducer;
