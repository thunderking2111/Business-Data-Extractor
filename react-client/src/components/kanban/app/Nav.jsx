import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { boardRemoved, selectAllBoards } from "../boards/boardsSlice2";
import useScreenSize from "../utilities/useScreenSize";
import DeleteModal from "./DeleteModal";
import MobileMenu from "./MobileMenu";
import NewBoardModal from "./NewBoardModal";
import NewTaskModal from "./NewTaskModal";
import { selectActiveBoardId, setActiveBoardId } from "./uiState";
import chevronDown from "../assets/icon-chevron-down.svg";
import threeDots from "../assets/icon-vertical-ellipsis.svg";

const Nav = () => {
    const dispatch = useDispatch();

    const [newTaskModal, setNewTaskModal] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [editBoardPopup, setEditBoardPopup] = useState(false);
    const [editBoardModalOpen, setEditBoardModalOpen] = useState(false);
    const [deleteBoardModalOpen, setDeleteBoardModalOpen] = useState(false);
    const activeBoardId = useSelector(selectActiveBoardId);
    const boards = useSelector(selectAllBoards);
    const activeBoard = boards.find((board) => board.id === activeBoardId);

    const { width: screenWidth } = useScreenSize();
    const isSmallScreen = screenWidth < 640;

    const editMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editMenuRef.current && !editMenuRef.current.contains(event.target)) {
                setEditBoardPopup(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editMenuRef]);

    return (
        <>
            <div className="flex items-center dark:bg-dark-gray">
                <div className="flex w-full items-center justify-between pr-[16px] sm:pl-[24px] sm:pr-[23px] h-[50px] md:h-[60px]">
                    <div className="">
                        <button
                            className="flex items-center"
                            onClick={() => setMobileMenu(true)}
                            disabled={!isSmallScreen}
                        >
                            <div className="heading-xl dark:text-white">
                                {activeBoard ? activeBoard.name : ""}
                            </div>
                            {isSmallScreen && <img className="ml-[8px]" src={chevronDown} alt="" />}
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            className={`heading-md mr-[16px] h-[24px] w-[38px] rounded-full bg-main-purple text-white hover:bg-main-purple-hover sm:mr-[24px] sm:h-[38px] sm:w-[144px] ${
                                !activeBoard && "opacity-50"
                            }`}
                            onClick={() => setNewTaskModal(true)}
                            disabled={!activeBoard}
                        >
                            +{!isSmallScreen && " Add New Task"}
                        </button>
                        <NewTaskModal
                            taskId=""
                            open={newTaskModal}
                            closeModal={() => setNewTaskModal(false)}
                            onClose={() => setNewTaskModal(false)}
                        />
                        <button onClick={() => setEditBoardPopup(true)} disabled={!activeBoardId}>
                            <img className="h-min" src={threeDots} alt="three dots" />
                        </button>
                        {editBoardPopup && (
                            <div
                                ref={editMenuRef}
                                className="fixed right-[24px] top-[90px] mt-[10px] flex w-[192px] flex-col items-start gap-[16px] rounded-lg bg-white p-[16px] text-left text-medium-gray dark:bg-very-dark-gray"
                            >
                                <button
                                    onClick={() => {
                                        setEditBoardModalOpen(true);
                                        setEditBoardPopup(false);
                                    }}
                                    className="body-lg text-medium-gray"
                                >
                                    Edit Project
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteBoardModalOpen(true);
                                        setEditBoardPopup(false);
                                    }}
                                    className="body-lg text-red"
                                >
                                    Delete Project
                                </button>
                            </div>
                        )}
                        <NewBoardModal
                            boardId={activeBoardId}
                            open={editBoardModalOpen}
                            onClose={() => setEditBoardModalOpen(false)}
                        />
                        <DeleteModal
                            title="Delete Project"
                            description={`Are you sure you want to delete the '${activeBoard?.title}' project? This action will remove all columns and tasks and cannot be reversed.`}
                            onConfirm={() => {
                                dispatch(boardRemoved(activeBoardId));
                                dispatch(setActiveBoardId(undefined));
                            }}
                            open={deleteBoardModalOpen}
                            onClose={() => setDeleteBoardModalOpen(false)}
                        />
                    </div>
                </div>
            </div>
            <MobileMenu open={mobileMenu} setOpen={setMobileMenu} />
        </>
    );
};

export default Nav;
