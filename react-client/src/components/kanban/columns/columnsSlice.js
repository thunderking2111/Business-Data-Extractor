import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";

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
});

export const {
    selectIds: selectColumnIds,
    selectById: selectColumnById,
    selectAll: selectAllColumns,
} = columnsAdapter.getSelectors((state) => state.columns);

export const { columnAdded, columnUpdated, columnsRemoved } = columnsSlice.actions;

export default columnsSlice.reducer;
