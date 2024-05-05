import { configureStore } from "@reduxjs/toolkit";

import boardsReducer from "../boards/boardsSlice2";
import columnsReducer from "../columns/columnsSlice";
import tasksReducer from "../tasks/tasksSlice";
import uiReducer from "./uiState";

const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        columns: columnsReducer,
        boards: boardsReducer,
        UI: uiReducer,
    },
});

export default store;
