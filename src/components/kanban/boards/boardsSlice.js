import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { columnAdded } from "../columns/columnsSlice";

const boardsAdapter = createEntityAdapter();

const initialState = boardsAdapter.getInitialState();

const boardsSlice = createSlice({
    name: "boards",
    initialState,
    reducers: {
        boardAdded: {
            reducer: boardsAdapter.addOne,
            prepare: (board) => ({
                payload: { ...board, id: board.id || nanoid() },
            }),
        },
        boardUpdated: boardsAdapter.updateOne,
        boardsRemoved: boardsAdapter.removeMany,
        boardRemoved: boardsAdapter.removeOne,
    },
    extraReducers: (builder) => {
        builder.addCase(columnAdded, (state, action) => {
            state.entities[action.payload.boardId].columnIds.push(action.payload.id);
        });
    },
});

export const {
    selectAll: selectAllBoards,
    selectIds: selectBoardIds,
    selectById: selectBoardById,
} = boardsAdapter.getSelectors((state) => state.boards);

export const selectBoardColumns = createSelector(selectBoardById, (board) => board?.columnIds);

export const { boardAdded, boardUpdated, boardsRemoved, boardRemoved } = boardsSlice.actions;

export default boardsSlice.reducer;
