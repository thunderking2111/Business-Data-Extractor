import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPanel from "./components/kanban/app/MainPanel";
import Nav from "./components/kanban/app/Nav";
import KanbanSidebar from "./components/kanban/app/Sidebar";
import {
    selectDataLoaded,
    selectIsDarkMode,
    setActiveBoardId,
} from "./components/kanban/app/uiState";
import { selectBoardIds } from "./components/kanban/boards/boardsSlice2";
import { useData } from "./data";

import TaskPage from "./components/TaskPage";

const Home = ({ darkMode }) => {
    return (
        <div className={`font-plus-jakarta-sans flex h-screen flex-col ${darkMode && "dark"}`}>
            <Nav />
            <div className="flex w-full grow">
                <KanbanSidebar />
                <MainPanel />
            </div>
        </div>
    );
};

const App = () => {
    const processData = useData();
    const darkMode = useSelector(selectIsDarkMode);
    const boardIds = useSelector(selectBoardIds);
    const dataLoaded = useSelector(selectDataLoaded);
    const dispatch = useDispatch();

    useEffect(() => {
        window.electronAPI?.sendProjectDataReq();
        window.electronAPI?.receiveProjectData((event, data) => {
            console.log("Called");
            processData(data);
        });
        return () => {
            window.electronAPI?.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        console.log("inside dataloaded useeffect");
        console.log(boardIds);
        if (boardIds.length > 0) {
            dispatch(setActiveBoardId(boardIds[0]));
        }
    }, [dataLoaded]);

    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Home darkMode={darkMode} />} />
                <Route exact path="/home" element={<Home darkMode={darkMode} />} />
                <Route path="/task/:task-id" element={<TaskPage />} />
            </Routes>
        </Router>
    );
};

export default App;
