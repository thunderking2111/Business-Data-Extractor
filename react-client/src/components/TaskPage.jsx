import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { ActionButtons, Sidebar, DataTable, DataTableFooter } from ".";
import { selectTaskById } from "./kanban/tasks/tasksSlice";

const TaskPage = () => {
    let { "task-id": activeTaskId } = useParams();
    activeTaskId = parseInt(activeTaskId, 10);
    const [taskData, setTaskData] = useState({ rows: [] });
    const task = useSelector((state) => selectTaskById(state, activeTaskId));
    // const dispatch = useDispatch();
    debugger;
    // To be passed to Sidebar
    const keywordsRef = useRef(null);
    const locationsRef = useRef(null);
    const useProxyRef = useRef(null);
    const emailRef = useRef(null);
    const delayRef = useRef(null);
    const maxQueryRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            if (activeTaskId) {
                try {
                    // Fetch data from your Electron server
                    window.electronAPI?.sendTaskDataReq({ taskId: activeTaskId });
                } catch (error) {
                    console.error("Error fetching task data:", error);
                }
            }
        };

        const onTaskUpdate = (event, data) => {
            debugger;
            console.log(data);
            // Object.assign(task, data);
            setTaskData((prevTaskData) => {
                const newTaskData = { ...prevTaskData }; // Create a shallow copy of the previous state
                if (data.row) {
                    newTaskData.rows.push(data.row); // Update the rows array
                } else if (data.headers) {
                    newTaskData.headers = data.headers; // Update the headers object
                } else {
                    Object.assign(newTaskData, data); // Merge other data into the taskData object
                }
                return newTaskData; // Return the updated state
            });
            console.log(taskData);
        };

        window.electronAPI?.listenForTaskUpdates(onTaskUpdate);

        fetchData(); // Call the fetchData function when the component mounts

        return () => {
            window.electronAPI?.stopListeningForTaskUpdates(onTaskUpdate);
        };
    }, [activeTaskId]);

    const getDataFromRefs = () => {
        const res = {};
        debugger;
        res.locations = locationsRef.current.value
            .split(/\r?\n/)
            .filter((term) => term.trim() !== "");
        res.keywords = keywordsRef.current.value
            .split(/\r?\n/)
            .filter((term) => term.trim() !== "");
        res.useProxy = useProxyRef.current.checked;
        res.emailMandatory = emailRef.current.checked;
        res.delay = delayRef.current.value;
        res.mayQueryLimit = maxQueryRef.current.value;
        console.log(res);
        if (!res.locations.length) {
            alert("Please add atleast 1 value in Locations");
            return;
        }
        if (!res.keywords.length) {
            alert("Please add atleast 1 value in Keywords");
            return;
        }
        return res;
    };

    return (
        <div className="flex w-screen h-screen gap-2">
            <Sidebar
                keywordsRef={keywordsRef}
                locationsRef={locationsRef}
                useProxyRef={useProxyRef}
                emailRef={emailRef}
                delayRef={delayRef}
                maxQueryRef={maxQueryRef}
                taskData={taskData}
                task={task}
                get
            />
            <div className="w-full flex flex-col p-2 h-screen overflow-auto">
                <ActionButtons task={task} getDataFromRefs={getDataFromRefs} />
                {/* Render your task data here */}
                {taskData && (
                    <>
                        <DataTable taskData={taskData} task={task} />
                        <DataTableFooter taskData={taskData} task={task} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskPage;
