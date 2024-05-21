import { useState, useEffect, useRef } from "react";
// import "./ToasterNotification.css";

const ToasterNotification = ({ message, duration = 5000, onClose, type = "success" }) => {
    const [isVisible, setIsVisible] = useState(true);
    const timerRef = useRef(null);
    const hoverRef = useRef(false);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            if (!hoverRef.current) {
                setIsVisible(false);
                onClose();
            }
        }, duration);

        return () => clearTimeout(timerRef.current);
    }, [duration, onClose]);

    const handleMouseEnter = () => {
        hoverRef.current = true;
        clearTimeout(timerRef.current);
    };

    const handleMouseLeave = () => {
        hoverRef.current = false;
        timerRef.current = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, duration);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed top-5 right-5 bg-gray-800 text-white p-4 rounded shadow-lg flex items-center ${type === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className="flex-grow">{message}</span>
            <button
                className="ml-6 text-white hover:text-gray-400 text-4xl leading-none"
                onClick={() => {
                    setIsVisible(false);
                    onClose();
                }}
            >
                ×
            </button>
        </div>
    );
};

export default ToasterNotification;
