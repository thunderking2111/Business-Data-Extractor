import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDataLoaded } from "./components/kanban/app/uiState";
import { boardAdded, boardsRemoved } from "./components/kanban/boards/boardsSlice";
import { columnAdded, columnsRemoved } from "./components/kanban/columns/columnsSlice";
import { taskAdded, tasksRemoved } from "./components/kanban/tasks/tasksSlice";

export const useData = ({ boards }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const boardIds = [];
        const columnIds = [];
        const taskIds = [];

        for (const board of boards) {
            const boardAction = boardAdded({ title: board.name, columnIds: [] });
            boardIds.push(boardAction.payload.id);
            dispatch(boardAction);
            for (const column of board.columns) {
                const columnAction = columnAdded({
                    title: column.name,
                    boardId: boardAction.payload.id,
                    taskIds: [],
                });
                columnIds.push(columnAction.payload.id);
                dispatch(columnAction);
                for (const task of column.tasks) {
                    const taskAction = taskAdded({
                        title: task.title,
                        description: task.description,
                        column: columnAction.payload.id,
                        board: boardAction.payload.id,
                        subtasks: task.subtasks.map((subtask) => ({
                            title: subtask.title,
                            completed: subtask.isCompleted,
                        })),
                    });
                    taskIds.push(taskAction.payload.task.id);
                    dispatch(taskAction);
                }
            }
        }
        dispatch(setDataLoaded(true));

        return () => {
            dispatch(boardsRemoved(boardIds));
            dispatch(columnsRemoved(columnIds));
            dispatch(tasksRemoved(taskIds));
        };
    }, []);
};
