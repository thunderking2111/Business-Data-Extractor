import { useNavigate } from "react-router-dom";
import { taskUpdated } from "./kanban/tasks/tasksSlice";
import { useDispatch } from "react-redux";

const ActionButtons = ({ getDataFromRefs, task, resetTaskData }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleOnClickStart = () => {
        const data = getDataFromRefs();
        if (!data) {
            return;
        }
        dispatch(taskUpdated(task, { ...data, stage: "ongoing" }));
        window.electronAPI?.scrapSend({
            task,
            ...data,
            stage: "ongoing",
        });
    };

    const handleOnClickHome = () => {
        if (task) {
            const data = getDataFromRefs(false);
            dispatch(taskUpdated(task, data));
            window.electronAPI?.updateTaskRecord({ task, changes: data });
        }
        navigate("/");
    };

    const onClickReset = () => {
        if (task) {
            const changes = {
                stage: "todo",
                keywords: [],
                locations: [],
                useProxy: false,
                emailMandatory: false,
                maxQueryLimit: "max",
                delay: "random",
            };
            dispatch(taskUpdated(task, changes));
            window.electronAPI?.resetTask({ taskId: task.id, changes });
            resetTaskData();
        }
    };

    return (
        <div className="w-full flex mb-2">
            <div className="btnLeftSection flex gap-3">
                <button
                    disabled={task ? task.stage !== "todo" : true}
                    className="py-1 px-4 border-b-4 rounded inline-flex items-center disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:border-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400 bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500"
                    onClick={handleOnClickStart}
                >
                    <span>Start</span>
                </button>
                <button
                    disabled={task ? task.stage !== "paused" : true}
                    className="py-1 px-4 border-b-4 rounded inline-flex items-center disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:border-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400 bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500"
                >
                    <span>Resume</span>
                </button>
                <button
                    disabled={task ? task.stage !== "done" : true}
                    className="py-1 px-4 border-b-4 rounded inline-flex items-center disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:border-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400 bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500"
                >
                    <span>Export</span>
                </button>
                <button
                    disabled={task ? task.stage === "todo" : true}
                    className="py-1 px-4 border-b-4 rounded inline-flex items-center disabled:opacity-50 disabled:bg-gray-400 disabled:text-gray-700 disabled:border-gray-400 disabled:hover:bg-gray-400 disabled:hover:border-gray-400 bg-green-500 hover:bg-green-400 text-white border-green-700 hover:border-green-500"
                    onClick={onClickReset}
                >
                    <span>Reset</span>
                </button>
            </div>
            <div className="extraSpacing grow"></div>
            <div className="rightBtnSection flex gap-3">
                <button
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                    onClick={handleOnClickHome}
                >
                    <span>Home</span>
                </button>
            </div>
        </div>
    );
};

export default ActionButtons;
