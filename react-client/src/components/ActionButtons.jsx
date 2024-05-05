import { Link } from "react-router-dom";

const ActionButtons = ({ getDataFromRefs, task }) => {
    const handleOnClickStart = () => {
        const data = getDataFromRefs();
        if (!data) {
            return;
        }
        window.electronAPI.scrapSend({
            ...data,
            resource: task.resource,
        });
    };

    return (
        <div className="w-full flex mb-2">
            <div className="btnLeftSection flex gap-3">
                <button
                    disabled={task ? task.stage !== "todo" : true}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                    onClick={handleOnClickStart}
                >
                    <span>Start</span>
                </button>
                <button
                    disabled={task ? task.stage !== "paused" : true}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                >
                    <span>Resume</span>
                </button>
                {["Export", "Reset"].map((title) => (
                    <button
                        disabled={task ? task.stage !== "done" : true}
                        key={title}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                    >
                        <span>{title}</span>
                    </button>
                ))}
            </div>
            <div className="extraSpacing grow"></div>
            <div className="rightBtnSection flex gap-3">
                <Link
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                    to="/"
                    onContextMenu={(ev) => ev.preventDefault()}
                >
                    <span>Home</span>
                </Link>
            </div>
        </div>
    );
};

export default ActionButtons;
