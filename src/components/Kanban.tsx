import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { IColumn } from "./IColumn";
import { Column, columnId, Card, cardId } from "../types";
import {
    filterCards,
    getAllColumns,
    updateCardIds,
    updateCardColumnId,
} from "../tauri";
import { useEffect } from "react";
import { reorderProject } from "../reorder";

const bgColors = [
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-red-200",
    "bg-blue-200",
];

export type projectState = {
    columns: { [id: columnId]: Column };
    cards: { [id: cardId]: Card };
};

type KanbanProps = {
    activeProjectId: number;
    refreshProject: boolean;
    setRefreshProject: (refresh: boolean) => void;
    setCardId: (cardId: number) => void;
    keyword: string;
};

export const Kanban = ({
    activeProjectId,
    refreshProject,
    setRefreshProject,
    setCardId,
    keyword,
}: KanbanProps): JSX.Element => {
    const [project, setProject] = useState<projectState>();
    const fetchProject = async () => {
        const columns = await getAllColumns(activeProjectId);
        const cards = await filterCards(activeProjectId, keyword);
        const columns_map = Object.assign(
            {},
            ...columns.map((column) => ({ [String(column.id)]: column }))
        );
        const cards_map = Object.assign(
            {},
            ...cards.map((card) => ({ [String(card.id)]: card }))
        );
        setProject({ columns: columns_map, cards: cards_map });
    };
    useEffect(() => {
        fetchProject();
    }, [refreshProject]);
    useEffect(() => {
        fetchProject();
    }, [activeProjectId]);
    useEffect(() => {
        fetchProject();
    }, [keyword]);

    const handleDragEnd = async (result: DropResult): Promise<void> => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (project === undefined) {
            return;
        }
        const { newProject, newColumns } = reorderProject(
            project,
            destination,
            source,
            draggableId
        );
        setProject(newProject);
        for (const column of newColumns) {
            await updateCardIds(column.id, column.card_ids);
            await updateCardColumnId(
                Number(draggableId),
                Number(destination.droppableId as columnId)
            );
        }
    };

    return (
        <div>
            <div className="bg-white flex py-6 w-full grow justify-between min-w-[52.5rem]">
                <DragDropContext onDragEnd={handleDragEnd}>
                    {project?.columns &&
                        Object.values(project.columns).map((column, index) => {
                            const cardIds = column.card_ids
                                .split(",")
                                .filter(Boolean);
                            const cards = cardIds
                                .map((cardId) => project?.cards[cardId])
                                .filter(Boolean) as Card[];
                            return (
                                <IColumn
                                    key={column.id}
                                    projectId={activeProjectId}
                                    column={column}
                                    cards={cards}
                                    bgColor={bgColors[index]}
                                    refreshProject={refreshProject}
                                    setRefreshProject={setRefreshProject}
                                    setCardId={setCardId}
                                />
                            );
                        })}
                </DragDropContext>
                <div className="grow"></div>
            </div>
        </div>
    );
};
