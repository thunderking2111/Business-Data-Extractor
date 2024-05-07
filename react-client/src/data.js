import { useDispatch } from "react-redux";
import { setDataLoaded } from "./components/kanban/app/uiState";
import { boardAdded, boardsRemoved } from "./components/kanban/boards/boardsSlice2";
import { columnAdded, columnsRemoved } from "./components/kanban/columns/columnsSlice";
import { tasksRemoved } from "./components/kanban/tasks/tasksSlice";

export const useData = () => {
    const dispatch = useDispatch();

    const processData = (data) => {
        const projectIds = [];
        const columnIds = [];
        const taskIds = [];
        const { projects, columns } = data;

        for (const project of projects) {
            const boardAction = boardAdded(project);
            projectIds.push(boardAction.payload.id);
            dispatch(boardAction);
        }
        for (const column of columns) {
            const columnAction = columnAdded(column);
            columnIds.push(columnAction.payload.id);
            dispatch(columnAction);
        }
        dispatch(setDataLoaded(true));

        return () => {
            dispatch(boardsRemoved(projectIds));
            dispatch(columnsRemoved(columnIds));
            dispatch(tasksRemoved(taskIds));
        };
    };

    return processData;
};
