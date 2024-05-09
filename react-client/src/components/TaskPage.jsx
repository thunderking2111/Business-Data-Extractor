import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { ActionButtons, Sidebar, DataTable, DataTableFooter } from ".";
import { selectTaskById, taskUpdated } from "./kanban/tasks/tasksSlice";

const TaskPage = () => {
    let { "task-id": activeTaskId } = useParams();
    console.log(useParams());
    activeTaskId = parseInt(activeTaskId, 10);
    const [taskData, setTaskData] = useState({ rows: [] });
    const task = useSelector((state) => selectTaskById(state, activeTaskId));
    const dispatch = useDispatch();

    // To be passed to Sidebar
    const keywordsRef = useRef(null);
    const locationsRef = useRef(null);
    const useProxyRef = useRef(null);
    const emailRef = useRef(null);
    const delayRef = useRef(null);
    const maxQueryRef = useRef(null);

    const onTaskUpdate = (event, data) => {
        console.log("Inside regular update");
        console.log(task?.id);
        console.log(activeTaskId);
        console.log(data);
        if (activeTaskId !== data.taskId) {
            return;
        }
        if (data.stage) {
            dispatch(taskUpdated(task, { stage: data.stage }));
        }
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

    const handleTaskData = (event, task) => {
        console.log("Inside task handle");
        console.log(task);
        if (task.id === activeTaskId) {
            dispatch(taskUpdated(task, task));
            const lastRow = task.scrapDatas?.[task.scrapDatas.length - 1];
            if (lastRow) {
                const currentKeyword = `${lastRow.keyword} in ${lastRow.location}`;
                setTaskData((prevTaskData) => {
                    const newTaskData = { ...prevTaskData }; // Create a shallow copy of the previous state
                    if (task.scrapDatas) {
                        newTaskData.rows = task.scrapDatas.map((scrapData) => scrapData.data);
                    }
                    if (task.headers) {
                        newTaskData.headers = task.headers;
                    }
                    newTaskData.currentKeyword = currentKeyword;
                    return newTaskData; // Return the updated state
                });
            }
        }
    };

    const resetTaskData = () => {
        setTaskData({ rows: [] });
    };

    useEffect(() => {
        window.electronAPI?.receiveTaskData(handleTaskData);

        const fetchData = async () => {
            if (task?.stage !== "todo") {
                try {
                    console.log("Setting up");
                    window.electronAPI?.sendTaskDataReq({ taskId: activeTaskId });
                } catch (error) {
                    console.error("Error fetching task data:", error);
                }
            }
        };

        window.electronAPI?.listenForTaskUpdates(onTaskUpdate);

        fetchData(); // Call the fetchData function when the component mounts

        return () => {
            window.electronAPI?.stopListeningForTaskUpdates(onTaskUpdate);
            window.electronAPI?.removeTaskDataListeners(handleTaskData);
        };
    }, [activeTaskId]);

    const getDataFromRefs = (alertIfNotFound = true) => {
        const res = {};
        res.locations = locationsRef.current.value
            .split(/\r?\n/)
            .filter((term) => term.trim() !== "");
        res.keywords = keywordsRef.current.value
            .split(/\r?\n/)
            .filter((term) => term.trim() !== "");
        res.useProxy = useProxyRef.current.checked;
        res.emailMandatory = emailRef.current.checked;
        res.delay = delayRef.current.value;
        res.delay = res.delay === "random" ? res.delay : parseInt(res.delay);
        res.maxResPerQuery = maxQueryRef.current.value;
        res.maxResPerQuery =
            res.maxResPerQuery === "max" ? res.maxResPerQuery : parseInt(res.maxResPerQuery);
        console.log(res);
        if (alertIfNotFound && !res.locations.length) {
            alert("Please add atleast 1 value in Locations");
            return;
        }
        if (alertIfNotFound && !res.keywords.length) {
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
                task={task}
                get
            />
            <div className="w-full flex flex-col p-2 h-screen overflow-auto">
                <ActionButtons
                    task={task}
                    getDataFromRefs={getDataFromRefs}
                    resetTaskData={resetTaskData}
                />
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
