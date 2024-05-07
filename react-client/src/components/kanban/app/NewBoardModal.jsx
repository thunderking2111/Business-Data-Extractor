import { Dialog } from "@headlessui/react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { boardUpdated, selectBoardById } from "../boards/boardsSlice2";
import Modal from "./Modal";
import { toggleNewBoardModal } from "./uiState";

const NewBoardModal = ({ boardId, open, onClose }) => {
    const dispatch = useDispatch();
    const board = useSelector((state) => (boardId ? selectBoardById(state, boardId) : undefined));

    const defaultValues = useMemo(
        () => ({
            name: "",
        }),
        [],
    );

    const { register, handleSubmit, reset } = useForm({
        defaultValues,
    });

    useEffect(() => {
        if (board) {
            reset({
                name: board.name,
            });
        } else {
            reset(defaultValues);
        }
    }, [board, reset, defaultValues]);

    const onSubmit = handleSubmit((data) => {
        // If the board already exists, update it. Otherwise, create a new board
        if (board) {
            const updateData = {
                id: board.id,
                changes: { name: data.name },
            };
            dispatch(boardUpdated(updateData));
            window.electronAPI.updateProjectRecord(updateData);
            onClose();
        } else {
            window.electronAPI.createProjectRecord({ name: data.name });
            reset();
            dispatch(toggleNewBoardModal());
            onClose();
        }
    });

    return (
        <Modal open={open} onClose={onClose}>
            <Dialog.Title className="heading-lg mb-[24px] dark:text-white">
                {board ? "Edit Project" : "Add New Project"}
            </Dialog.Title>

            <div className="body-md mb-[8px] text-medium-gray">Name</div>
            <form onSubmit={onSubmit}>
                <input
                    className="body-lg mb-[24px] w-full rounded-sm border border-medium-gray/25 py-[8px] pl-[16px] outline-none focus:border-main-purple dark:bg-dark-gray dark:text-white"
                    placeholder="e.g. Web Design"
                    {...register("name", { required: true })}
                />
                <button
                    type="submit"
                    className="font-plus-jakarta-sans h-[40px] w-full rounded-full bg-main-purple text-center text-[13px] font-bold leading-[23px] text-white hover:bg-main-purple-hover"
                >
                    {board ? "Save Changes" : "Create New Project"}
                </button>
            </form>
        </Modal>
    );
};

export default NewBoardModal;
