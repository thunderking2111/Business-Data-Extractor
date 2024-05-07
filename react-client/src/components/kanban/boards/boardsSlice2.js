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
                board.tasks = board.tasks || [];
                const tasksWithIds = board.tasks.map((task) => ({
                    ...task,
                    id: task.id || nanoid(),
                    projectId: board.id,
                }));
                return {
                    payload: { ...board, tasks: tasksWithIds || [], id: board.id || nanoid() },
                };
            },
        },
        boardUpdated: boardsAdapter.updateOne,
        boardsRemoved: boardsAdapter.removeMany,
        boardRemoved: boardsAdapter.removeOne,
    },
    extraReducers: (builder) => {
        builder
            .addCase(taskAdded, (state, action) => {
                const task = action.payload;
                const project = state.entities[task.projectId];
                if (project) {
                    project.tasks.push(task);
                }
            })
            .addCase(taskUpdated, (state, action) => {
                const { id: taskId, projectId, changes } = action.payload;
                const project = state.entities[projectId];
                if (project) {
                    const task = project.tasks.find((task) => task.id === taskId);
                    if (task) {
                        Object.assign(task, changes);
                    }
                }
            })
            .addCase(taskMoved, (state, action) => {
                const { task, index } = action.payload;
                const project = state.entities[task.projectId];
                if (project) {
                    const tasks = project.tasks;
                    const currentIndex = tasks.findIndex((t) => t.id === task.id);
                    if (currentIndex !== -1) {
                        const newTasks = arrayMove(tasks, currentIndex, index);
                        project.tasks = newTasks;
                    }
                }
            })
            .addCase(taskRemoved, (state, action) => {
                const { task } = action.payload;
                const project = state.entities[task.projectId];
                if (project) {
                    project.tasks = project.tasks.filter((t) => t.id !== task.id);
                }
            });
    },
});

export const {
    selectAll: selectAllBoards,
    selectById: selectBoardById,
    selectIds: selectBoardIds,
} = boardsAdapter.getSelectors((state) => state.boards);

export const selectBoardTasks = createSelector(selectBoardById, (board) => {
    return board?.tasks ?? [];
});

export const selectActiveBoard = createSelector(
    [selectActiveBoardId, selectAllBoards],
    (activeBoardId, boards) => {
        return activeBoardId ? boards.find((board) => board.id === activeBoardId) : undefined;
    },
);

export const selectColumnTaskIds = createSelector(
    [selectActiveBoard, (_, columnId) => columnId],
    (activeBoard, columnId) => {
        if (activeBoard) {
            return activeBoard.tasks
                .filter((task) => task.stage === columnId)
                .map((task) => task.id);
        }
    },
);

export const { boardAdded, boardUpdated, boardsRemoved, boardRemoved } = boardsSlice.actions;

export default boardsSlice.reducer;
