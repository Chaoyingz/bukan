import { DraggableLocation } from "@hello-pangea/dnd";
import { projectState } from "./components/Kanban";
import { Column } from "./types";


export const reorderProject = (
    project: projectState,
    destination: DraggableLocation,
    source: DraggableLocation,
    draggableId: string
): {"newProject": projectState, "newColumns": Column[] }=> {

    const startColumn = project.columns[source.droppableId];
    const finishColumn = project.columns[destination.droppableId];

    if (startColumn === finishColumn) {
        const newCardIds = startColumn.card_ids.split(",").filter(Boolean)
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);
        const newColumn = {
            ...startColumn,
            card_ids: newCardIds.join(","),
        };
        const newProject = {
            cards: project.cards,
            columns: {
                ...project.columns,
                [newColumn.id]: newColumn,
            },
        }
        return {
            "newProject": newProject,
            "newColumns": [newColumn]
        };
    } else {
        const startCardIds = Array.from(
            startColumn.card_ids.split(",").filter(Boolean)
        );
        startCardIds.splice(source.index, 1);
        const newStart = {
            ...startColumn,
            card_ids: startCardIds.join(","),
        };
        const finishCardIds = Array.from(
            finishColumn.card_ids.split(",").filter(Boolean)
        );
        finishCardIds.splice(destination.index, 0, draggableId);
        const newFinish = {
            ...finishColumn,
            card_ids: finishCardIds.join(","),
        };
        const newProject = {
            cards: project.cards,
            columns: {
                ...project.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        }
        return {
            "newProject": newProject,
            "newColumns": [newStart, newFinish]
        };
    }
};