import React, { useEffect, useState, forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { selectColumnById } from "../columns/columnsSlice";
import { selectColumnTaskIds } from "../boards/boardsSlice2";
import { selectTaskById, taskRemoved } from "../tasks/tasksSlice";
import DotsIcon from "../assets/icon-vertical-ellipsis.svg";
import NewTaskModal from "./NewTaskModal";
import DeleteTaskModal from "./DeleteModal";

export const TaskElement = forwardRef((mainProps, ref) => {
    const { taskId, ...props } = mainProps;
    const [editMenuOpen, setEditMenuOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
    const editMenuRef = useRef(null);
    const task = useSelector((state) => selectTaskById(state, taskId));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // debugger;

    // Close the little edit popup menu when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editMenuRef.current && !editMenuRef.current.contains(event.target)) {
                setEditMenuOpen(false); // Close the component
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editMenuRef]);

    if (!task) {
        return null;
    }
    return (
        <div ref={ref} {...props}>
            <button
                onClick={() => {
                    navigate(`/task/${task.id}`);
                }}
                className="group flex w-full flex-col rounded-lg bg-white py-[23px] pl-[16px] pr-[8px] shadow dark:bg-dark-gray"
            >
                <div className="w-full flex justify-between">
                    <div className="heading-md mb-[8px] mr-2 text-left text-black group-hover:text-main-purple dark:text-white">
                        {task?.name}
                    </div>
                    <span className="relative">
                        <div
                            className="flex justify-center items-center rounded hover:border hover:border-2 hover:border-gray-400 min-w-[25px]"
                            style={{ visibility: props["data-task-id"] ? `visible` : `hidden` }}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                ev.preventDefault();
                                setEditMenuOpen(!editMenuOpen);
                            }}
                        >
                            <span>
                                <img src={DotsIcon} alt="" />
                            </span>

                            {editMenuOpen && (
                                <div
                                    ref={editMenuRef}
                                    className="absolute right-1/2 top-full mt-[10px] flex w-[192px] translate-x-1/2 flex-col items-start gap-[16px] rounded-lg bg-white p-[16px] text-left text-medium-gray dark:bg-very-dark-gray z-10 border"
                                    onClick={(ev) => ev.stopPropagation()}
                                >
                                    <span
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            ev.preventDefault();
                                            setEditTaskModalOpen(true);
                                            setEditMenuOpen(false);
                                        }}
                                        className="w-full text-start body-lg text-medium-gray"
                                    >
                                        Edit Task
                                    </span>
                                    <span
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            ev.preventDefault();
                                            setEditMenuOpen(false);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="w-full text-start body-lg text-red"
                                    >
                                        Delete Task
                                    </span>
                                </div>
                            )}
                        </div>
                    </span>
                </div>
                <div className="body-md text-medium-gray text-start">{task.description}</div>
            </button>
            <div onKeyDown={(ev) => ev.stopPropagation()}>
                <NewTaskModal
                    taskId={task.id}
                    open={editTaskModalOpen}
                    closeModal={() => setEditTaskModalOpen(false)}
                    onClose={() => setEditTaskModalOpen(false)}
                />
                <DeleteTaskModal
                    open={deleteModalOpen}
                    onConfirm={() => {
                        dispatch(taskRemoved({ task }));
                        window.electronAPI.removeTaskRecord(task.id);
                    }}
                    onClose={() => setDeleteModalOpen(false)}
                    title="Delete Task"
                    description="Are you sure you want to delete {task.title}? This action cannot be undone."
                />
            </div>
        </div>
    );
});

const SortableTask = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: props.taskId,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <TaskElement
            ref={setNodeRef}
            style={style}
            data-task-id={props.taskId}
            {...listeners}
            {...attributes}
            {...props}
        />
    );
};

const Column = ({ columnId }) => {
    console.log("Column");
    const column = useSelector((state) => selectColumnById(state, columnId));
    const taskIds = useSelector((state) => selectColumnTaskIds(state, columnId));
    if (!taskIds) {
        return;
    }
    return (
        <SortableContext items={taskIds} strategy={rectSortingStrategy}>
            <div className="flex w-[280px] shrink-0 flex-col gap-[20px]">
                <div className="heading-sm uppercase">
                    {column?.name} ({taskIds?.length})
                </div>
                {taskIds && taskIds.map((id) => <SortableTask taskId={id} key={id} />)}
            </div>
        </SortableContext>
    );
};

export default Column;
