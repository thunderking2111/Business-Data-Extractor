import { Dialog, Listbox } from "@headlessui/react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { selectAllColumns } from "../columns/columnsSlice";
import { selectTaskById, taskAdded, taskUpdated } from "../tasks/tasksSlice";
import Modal from "./Modal";
import { selectActiveBoardId } from "./uiState";
import ChevronDown from "../assets/icon-chevron-down.svg";

const NewTaskModal = ({ taskId, open, closeModal, onClose }) => {
    const task = useSelector((state) => (taskId ? selectTaskById(state, taskId) : undefined));
    const activeBoard = useSelector(selectActiveBoardId);
    const activeColumns = useSelector(selectAllColumns);
    const dispatch = useDispatch();

    const defaultValues = useMemo(
        () => ({
            name: "",
            description: "",
            status: activeColumns[0] ? activeColumns[0].name : "",
            resource: task ? "" : "Google Maps",
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
            });
        } else {
            reset(defaultValues);
        }
    }, [task, activeColumns, reset, defaultValues]);

    const onSubmit = handleSubmit((data) => {
        if (task) {
            dispatch(
                taskUpdated(task, {
                    name: data.name,
                    description: data.description,
                    stage: activeColumns.find((column) => column.name === data.status).id,
                }),
            );
        } else {
            dispatch(
                taskAdded({
                    name: data.name,
                    description: data.description,
                    stage: activeColumns.find((column) => column.name === data.status).id,
                    boardId: activeBoard,
                }),
            );
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
                                <Listbox.Options className="absolute top-full mt-[10px] w-full rounded rounded-b bg-white text-medium-gray dark:bg-dark-gray">
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
                {!task && (
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
                                            <Listbox.Options className="absolute top-full mt-[10px] w-full rounded rounded-b bg-white text-medium-gray dark:bg-dark-gray">
                                                {[
                                                    { value: "google-maps", title: "Google Maps" },
                                                    { value: "bing", title: "Bing Maps" },
                                                ].map((column) => (
                                                    <Listbox.Option
                                                        key={column.id}
                                                        className="body-lg py-[8px] pl-[16px] hover:bg-main-purple/10"
                                                        value={column.value}
                                                    >
                                                        {column.name}
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
