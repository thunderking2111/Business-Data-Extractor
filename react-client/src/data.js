import { useDispatch } from "react-redux";
import { setDataLoaded } from "./components/kanban/app/uiState";
import { boardAdded, boardsRemoved } from "./components/kanban/boards/boardsSlice2";
import { columnAdded, columnsRemoved } from "./components/kanban/columns/columnsSlice";
import { taskAdded, tasksRemoved } from "./components/kanban/tasks/tasksSlice";

export const useData = () => {
    const dispatch = useDispatch();

    const processData = (data) => {
        const boardIds = [];
        const columnIds = [];
        const taskIds = [];
        const { projects, tasks, columns } = data;

        for (const project of projects) {
            const boardAction = boardAdded(project);
            boardIds.push(boardAction.payload.id);
            dispatch(boardAction);
        }
        for (const column of columns) {
            const columnAction = columnAdded(column);
            columnIds.push(columnAction.payload.id);
            dispatch(columnAction);
        }
        for (const task of tasks) {
            const taskAction = taskAdded(task);
            taskIds.push(taskAction.payload.id);
            dispatch(taskAction);
        }
        dispatch(setDataLoaded(true));

        return () => {
            dispatch(boardsRemoved(boardIds));
            dispatch(columnsRemoved(columnIds));
            dispatch(tasksRemoved(taskIds));
        };
    };

    return processData;
};
