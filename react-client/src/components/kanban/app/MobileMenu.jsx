import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, Switch, Tab, Transition } from "@headlessui/react";
import { selectAllBoards, selectBoardIds } from "../boards/boardsSlice2";
import NewBoardModal from "./NewBoardModal";
import { selectActiveBoardId, selectIsDarkMode, setActiveBoardId, setDarkMode } from "./uiState";
import { ReactComponent as BoardIcon } from "../assets/icon-board.svg";
import moonIcon from "../assets/icon-dark-theme.svg";
import sunIcon from "../assets/icon-light-theme.svg";

const MobileMenu = ({ open, setOpen }) => {
    const dispatch = useDispatch();
    const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
    const darkMode = useSelector(selectIsDarkMode);
    const boards = useSelector(selectAllBoards);
    const boardIds = useSelector(selectBoardIds);
    const activeBoardId = useSelector(selectActiveBoardId);

    const setSelectedBoardIndex = (index) => {
        dispatch(setActiveBoardId(boardIds[index]));
    };

    return (
        <>
            <Transition show={open} as={Fragment}>
                <Dialog onClose={() => setOpen(false)}>
                    <div className={`${darkMode && "dark"}`}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div
                                className="fixed inset-0 h-screen w-screen bg-black/50"
                                aria-hidden="true"
                            />
                        </Transition.Child>
                        <div className="fixed inset-0 top-[80px] flex h-min w-screen justify-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-[264px] rounded-lg bg-white py-[16px] pr-[16px] dark:bg-dark-gray">
                                    <h2 className="heading-sm mb-[19px] ml-[24px]">
                                        All Projects ({boards.length})
                                    </h2>
                                    <Tab.Group
                                        vertical
                                        selectedIndex={
                                            activeBoardId
                                                ? boardIds.findIndex((val) => val === activeBoardId)
                                                : undefined
                                        }
                                        onChange={setSelectedBoardIndex}
                                    >
                                        <Tab.List>
                                            {boards.map((board) => (
                                                <Tab
                                                    className="flex h-[48px] w-full items-center rounded-r-full pl-[24px] text-medium-gray
                        ui-selected:bg-main-purple ui-selected:text-white
                        ui-not-selected:hover:bg-light-gray-light-bg ui-not-selected:hover:stroke-main-purple
                        ui-not-selected:hover:text-main-purple"
                                                    key={board.id}
                                                >
                                                    <BoardIcon className="mr-[12px] ui-selected:stroke-white" />
                                                    <div>{board.title}</div>
                                                </Tab>
                                            ))}
                                        </Tab.List>
                                    </Tab.Group>
                                    <button
                                        className="heading-md flex h-[48px] items-center pl-[24px] text-main-purple"
                                        onClick={() => {
                                            setOpen(false);
                                            setNewBoardModalOpen(true);
                                        }}
                                    >
                                        <BoardIcon className="mr-[16px] stroke-main-purple" />
                                        <div>+ Create New Project</div>
                                    </button>

                                    <div className="mx-[16px] mb-[8px] box-border flex h-[48px] w-[235px] items-center justify-center rounded bg-light-gray-light-bg dark:bg-very-dark-gray lg:w-[250px]">
                                        <img src={sunIcon} alt="light mode icon" />
                                        <Switch
                                            checked={darkMode}
                                            onChange={(val) => dispatch(setDarkMode(val))}
                                            className={`
          border-transparent relative mx-[18px] box-content inline-flex h-[20px] w-[40px] shrink-0 cursor-pointer rounded-full bg-main-purple transition-colors duration-200 ease-in-out focus:outline-none`}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span
                                                aria-hidden="true"
                                                className={`${
                                                    darkMode
                                                        ? "translate-x-[19px]"
                                                        : "translate-x-0"
                                                }
            pointer-events-none ml-[2px] mt-[2px] box-content inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                            />
                                        </Switch>
                                        <img src={moonIcon} alt="dark mode icon" />
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <NewBoardModal open={newBoardModalOpen} onClose={() => setNewBoardModalOpen(false)} />
        </>
    );
};

export default MobileMenu;
