import { useEffect, useState } from "react";
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
import ToasterNotification from "./components/ToasterNotification";

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
    const [showToaster, setShowToaster] = useState(false);
    const [toasterMessage, setToasterMessage] = useState("");
    const [toasterType, setToasterType] = useState("success");
    const processData = useData();
    const darkMode = useSelector(selectIsDarkMode);
    const boardIds = useSelector(selectBoardIds);
    const dataLoaded = useSelector(selectDataLoaded);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("Mounted");
        window.electronAPI?.sendProjectDataReq();
        window.electronAPI?.receiveProjectData((event, data) => {
            console.log("Called");
            processData(data);
        });
        window.electronAPI.receiveExportConfirmation((event, data) => {
            setShowToaster(true);
            setToasterMessage(data.message);
            setToasterType(data.status);
            console.log(data);
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
            {showToaster && (
                <ToasterNotification
                    message={toasterMessage}
                    duration={5000}
                    onClose={() => setShowToaster(false)}
                    type={toasterType}
                />
            )}
        </Router>
    );
};

export default App;
