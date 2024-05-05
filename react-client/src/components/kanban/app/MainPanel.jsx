import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { selectColumnIds, selectAllColumns } from "../columns/columnsSlice";
import { selectAllTasks, taskMoved } from "../tasks/tasksSlice";
import Column, { TaskElement } from "./Column";
import NewBoardModal from "./NewBoardModal";
import { selectActiveBoardId } from "./uiState";

const MainPanel = () => {
    const dispatch = useDispatch();
    const [editBoardModal, setEditBoardModal] = useState(false);
    const [draggedId, setDraggedId] = useState(null);
    const activeBoardId = useSelector(selectActiveBoardId);
    const columnIds = useSelector(selectColumnIds);
    const columns = useSelector(selectAllColumns);
    const tasks = useSelector(selectAllTasks);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const onDragStart = ({ active }) => {
        setDraggedId(active.id);
    };

    const onDragEnd = ({ active, over }) => {
        setDraggedId(null);
        if (over && active.id !== over.id) {
            const task = tasks.find((task) => task.id === active.id);
            const overTask = tasks.find((task) => task.id === over.id);
            const targetColumn = columns.find((column) => column.id === overTask?.column);
            const index = targetColumn?.taskIds.findIndex((id) => id === over?.id);
            dispatch(taskMoved({ task, newColumnId: overTask?.column, index }));
        }
    };

    return (
        <div className="bde-mainpanel flex h-full w-full gap-[24px] overflow-x-auto overflow-y-auto bg-light-gray-light-bg px-[24px] pt-[24px] dark:bg-very-dark-gray">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                {columnIds ? columnIds.map((id) => <Column key={id} columnId={id} />) : null}
                <DragOverlay>{draggedId ? <TaskElement taskId={draggedId} /> : null}</DragOverlay>
            </DndContext>

            <NewBoardModal
                setNewColumn
                boardId={activeBoardId}
                open={editBoardModal}
                onClose={() => setEditBoardModal(false)}
            />
        </div>
    );
};

export default MainPanel;
