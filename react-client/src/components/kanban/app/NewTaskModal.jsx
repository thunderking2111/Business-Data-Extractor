import { Dialog, Listbox } from "@headlessui/react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { selectAllColumns } from "../columns/columnsSlice";
import { selectTaskById, taskUpdated } from "../tasks/tasksSlice";
import Modal from "./Modal";
import ChevronDown from "../assets/icon-chevron-down.svg";
import { selectActiveBoard } from "../boards/boardsSlice2";

const RESOURCES = [
    { value: "google-maps", title: "Google Maps" },
    { value: "bing-maps", title: "Bing Maps" },
];

const NewTaskModal = ({ taskId, open, closeModal, onClose }) => {
    const task = useSelector((state) => (taskId ? selectTaskById(state, taskId) : undefined));
    const activeBoard = useSelector(selectActiveBoard);
    const activeColumns = useSelector(selectAllColumns);
    const dispatch = useDispatch();

    const defaultValues = useMemo(
        () => ({
            name: "",
            description: "",
            status: activeColumns[0] ? activeColumns[0].name : "",
            resource: task
                ? RESOURCES.find((t) => t.value === task.resource)?.title
                : "Google Maps",
        }),
        [activeColumns, task],
    );

    const { register, handleSubmit, control, reset } = useForm({
        defaultValues,
    });

    useEffect(() => {
        if (task) {
            reset({
                name: task.name,
                description: task.description,
                status: activeColumns.find((col) => col.id === task.stage)?.name,
                resource: RESOURCES.find((t) => t.value === task.resource)?.title,
            });
        } else {
            reset(defaultValues);
        }
    }, [task, activeColumns, reset, defaultValues]);

    const onSubmit = handleSubmit((data) => {
        if (task) {
            const updateData = {
                name: data.name,
                description: data.description,
                stage: activeColumns.find((column) => column.name === data.status).id,
                resource: RESOURCES.find((r) => r.title === data.resource).value,
            };
            dispatch(taskUpdated(task, updateData));
            window.electronAPI.updateTaskRecord({ task, changes: updateData });
        } else {
            window.electronAPI.createTaskRecord({
                name: data.name,
                description: data.description,
                stage: activeColumns.find((column) => column.name === data.status).id,
                projectId: activeBoard.id,
                resource: RESOURCES.find((resource) => resource.title === data.resource).value,
            });
        }
        closeModal();
        reset();
    });
    return (
        <Modal open={open} onClose={onClose}>
            <Dialog.Title className="heading-lg mb-[24px] dark:text-white">
                {task ? "Edit Task" : "Add New Task"}
            </Dialog.Title>
            <form onSubmit={onSubmit}>
                <div className="body-md mb-[8px] text-medium-gray">Title</div>
                <input
                    className="body-lg mb-[24px] w-full rounded border border-medium-gray/25 py-[8px] pl-[16px] outline-none focus:border-main-purple dark:border-medium-gray/50 dark:bg-dark-gray dark:text-white dark:focus:border-main-purple"
                    placeholder="e.g. Take Coffee Break"
                    {...register("name")}
                />
                <div className="body-md mb-[8px] text-medium-gray">Description</div>
                <textarea
                    className="body-lg mb-[24px] h-[112px] w-full rounded border border-medium-gray/25 py-[8px] pl-[16px] outline-none focus:border-main-purple dark:border-medium-gray/50 dark:bg-dark-gray dark:text-white dark:focus:border-main-purple"
                    placeholder="e.g. It's always good to take a break. This 15 minute break will
recharge the batteries a little."
                    {...register("description")}
                />
                <div className="body-md mb-[8px] text-medium-gray">Status</div>
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <Listbox value={field.value} onChange={field.onChange}>
                            <div className="relative">
                                <Listbox.Button className="font-body-lg flex h-[40px] w-full items-center justify-between rounded border border-medium-gray/25 px-[16px] py-[8px] text-left text-[13px] leading-[23px] dark:text-white">
                                    <div>{field.value}</div>
                                    <img src={ChevronDown} alt="" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute top-full mt-[10px] w-full rounded border border-solid border-2 border-gray-400 bg-white text-medium-gray dark:bg-dark-gray z-[100]">
                                    {activeColumns.map((column) => (
                                        <Listbox.Option
                                            key={column.id}
                                            className="body-lg py-[8px] pl-[16px] hover:bg-main-purple/10"
                                            value={column.name}
                                        >
                                            {column.name}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    )}
                />
                {(!task || task.stage === "todo") && (
                    <>
                        <div className="body-md mb-[8px] text-medium-gray">Resource</div>
                        <Controller
                            name="resource"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <Listbox value={field.value} onChange={field.onChange}>
                                        <div className="relative">
                                            <Listbox.Button className="font-body-lg flex h-[40px] w-full items-center justify-between rounded border border-medium-gray/25 px-[16px] py-[8px] text-left text-[13px] leading-[23px] dark:text-white">
                                                <div>{field.value}</div>
                                                <img src={ChevronDown} alt="" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute top-full mt-[10px] w-full rounded border border-solid border-2 border-gray-400 bg-white text-medium-gray dark:bg-dark-gray z-[100]">
                                                {RESOURCES.map((resource) => (
                                                    <Listbox.Option
                                                        key={resource.value}
                                                        className="body-lg py-[8px] pl-[16px] hover:bg-main-purple/10"
                                                        value={resource.title}
                                                    >
                                                        {resource.title}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </>
                            )}
                        />
                    </>
                )}
                <button
                    type="submit"
                    className="mt-[24px] h-[40px] w-full rounded-full bg-main-purple text-center text-[13px] font-bold leading-[23px] text-white hover:bg-main-purple-hover"
                >
                    {`${task ? "Save" : "Create"}`} Task
                </button>
            </form>
        </Modal>
    );
};

export default NewTaskModal;
