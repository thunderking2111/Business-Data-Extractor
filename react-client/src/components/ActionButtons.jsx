import { Link } from "react-router-dom";

const ActionButtons = () => {
    return (
        <div className="w-full flex mb-2">
            <div className="btnLeftSection flex gap-3">
                {["Start", "Resume", "Export", "Reset"].map((title) => (
                    <button
                        key={title}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                    >
                        <span>{title}</span>
                    </button>
                ))}
            </div>
            <div className="extraSpacing grow"></div>
            <div className="rightBtnSection flex gap-3">
                {["Login", "Home"].map((title) => (
                    <Link
                        key={title}
                        className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-4 border-b-4 border-green-700 hover:border-green-500 rounded inline-flex items-center"
                        to={`/${title.toLowerCase()}`}
                        onContextMenu={(ev) => ev.preventDefault()}
                    >
                        <span>{title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ActionButtons;
