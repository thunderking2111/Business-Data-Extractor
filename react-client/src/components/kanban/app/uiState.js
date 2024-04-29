import { createSlice } from "@reduxjs/toolkit";

const UISlice = createSlice({
    name: "ui",
    initialState: {
        isDarkMode: false,
        isNavOpen: false,
        newTaskModalIsOpen: false,
        newBoardModalIsOpen: false,
        sidebarIsOpen: true,
        activeBoardId: undefined,
        dataLoaded: false,
    },
    reducers: {
        setDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
        },
        toggleNav: (state) => {
            state.isNavOpen = !state.isNavOpen;
        },
        setActiveBoardId: (state, action) => {
            state.activeBoardId = action.payload;
        },
        toggleNewTaskModalIsOpen: (state) => {
            state.newTaskModalIsOpen = !state.newTaskModalIsOpen;
        },
        setSidebar: (state, action) => {
            state.sidebarIsOpen = action.payload;
        },
        toggleNewBoardModal: (state) => {
            state.newBoardModalIsOpen = !state.newBoardModalIsOpen;
        },
        setViewTaskModal: (state, action) => {
            state.viewTaskModal = action.payload;
        },
        setEditingTask: (state, action) => {
            state.editingTask = action.payload;
        },
        setDataLoaded: (state, action) => {
            state.dataLoaded = action.payload;
        },
    },
});

export const selectIsDarkMode = (state) => state.UI.isDarkMode;

export const selectIsNavOpen = (state) => state.UI.isNavOpen;

export const selectActiveBoardId = (state) => state.UI.activeBoardId;

export const selectNewTaskModalIsOpen = (state) => state.UI.newTaskModalIsOpen;

export const selectSidebarIsOpen = (state) => state.UI.sidebarIsOpen;

export const selectNewBoardModalIsOpen = (state) => state.UI.newBoardModalIsOpen;

export const selectViewTaskModal = (state) => state.UI.viewTaskModal;

export const selectEditingTask = (state) => state.UI.editingTask;

export const selectDataLoaded = (state) => state.UI.dataLoaded;

export const {
    setDarkMode,
    toggleNav,
    setActiveBoardId,
    toggleNewTaskModalIsOpen,
    toggleNewBoardModal,
    setViewTaskModal,
    setEditingTask,
    setSidebar,
    setDataLoaded,
} = UISlice.actions;

export default UISlice.reducer;
