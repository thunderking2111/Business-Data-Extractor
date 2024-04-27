import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import data from "./data/board_data.json";
import MainPanel from "./components/kanban/app/MainPanel";
import Nav from "./components/kanban/app/Nav";
import Sidebar from "./components/kanban/app/Sidebar";
import {
    selectDataLoaded,
    selectIsDarkMode,
    setActiveBoardId,
} from "./components/kanban/app/uiState";
import { selectBoardIds } from "./components/kanban/boards/boardsSlice";
import { useData } from "./data";

// import { ActionButtons, DataTable, DataTableFooter, Sidebar } from "./components";

const App = () => {
    useData(data);
    const darkMode = useSelector(selectIsDarkMode);
    const boardIds = useSelector(selectBoardIds);
    const dataLoaded = useSelector(selectDataLoaded);
    const dispatch = useDispatch();

    useEffect(() => {
        if (boardIds.length > 0) {
            dispatch(setActiveBoardId(boardIds[0]));
        }
    }, [dataLoaded]);

    return (
        <div className={`font-plus-jakarta-sans flex h-screen flex-col ${darkMode && "dark"}`}>
            <Nav />
            <div className="flex w-full grow">
                <Sidebar />
                <MainPanel />
            </div>
        </div>
        // <div className="flex w-screen h-screen gap-2">
        //     <Sidebar />
        //     <div className="w-full flex flex-col p-2 h-screen overflow-auto">
        //         <ActionButtons />
        //         <DataTable />
        //         <DataTableFooter />
        //     </div>
        // </div>
    );
};

export default App;
