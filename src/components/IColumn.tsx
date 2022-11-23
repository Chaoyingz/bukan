import { Droppable } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Card, Column } from "../types";
import { ICard } from "./ICard";
import { IconPlus } from "@douyinfe/semi-icons";
import { NewCardByName } from "./NewCardByName";
import { IButton } from "./IButton";

const grid = 8;

const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250,
});

type IColumnProps = {
    projectId: number;
    column: Column;
    bgColor: string;
    cards: Card[];
    refreshProject: boolean;
    setRefreshProject: (isRefushProject: boolean) => void;
    setCardId: (cardId: number) => void;
};

export const IColumn = ({
    projectId,
    column,
    bgColor,
    cards,
    refreshProject,
    setRefreshProject,
    setCardId,
}: IColumnProps) => {
    const [newCardBtnVisible, setNewCardBtnVisible] = useState(false);
    const [newCardInputVisible, setNewCardInputVisible] = useState(false);
    useEffect(() => {
        if (column.id == 1) {
            setNewCardBtnVisible(true);
        }
    }, []);
    return (
        <div className="group rounded-mdpy-4 w-[17rem]">
            <div className="mb-3 flex justify-between px-2">
                <div>
                    <span
                        className={
                            "py-1 px-2 text-sm rounded-md mr-3 " + bgColor
                        }
                    >
                        {column.name}
                    </span>
                    <span className="text-sm font-medium">
                        {cards?.length}{" "}
                    </span>
                </div>
                <IButton
                    onClick={() => {
                        setNewCardInputVisible(true);
                    }}
                >
                    <button
                        className="bg-transparent flex items-center p-0.5"
                        disabled={newCardInputVisible}
                    >
                        <IconPlus size="small" color="white" />
                    </button>
                </IButton>
            </div>
            {cards.length > 0 && (
                <Droppable droppableId={column.id.toString()}>
                    {(provided, snapshot): JSX.Element => (
                        <div
                            ref={provided.innerRef}
                            className={
                                "rounded border-transparent border border-dashed" +
                                (snapshot.isDraggingOver
                                    ? " border-blue-500 pb-0"
                                    : "") +
                                (cards?.length == 0 ? " p-1 " : " p-2")
                            }
                            {...provided.droppableProps}
                        >
                            {cards.map((card, index) => (
                                <ICard
                                    card={card}
                                    index={index}
                                    key={card.id}
                                    setCardId={setCardId}
                                ></ICard>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            )}
            <div className="px-2">
                <NewCardByName
                    visible={newCardInputVisible}
                    setVisible={setNewCardInputVisible}
                    projectId={projectId}
                    columnId={column.id}
                    refreshProject={refreshProject}
                    setRefreshProject={setRefreshProject}
                />
                {!newCardInputVisible && (
                    <IButton
                        className={cards.length == 0 ? "" : ""}
                        onClick={() => {
                            setNewCardInputVisible(true);
                        }}
                    >
                        <button
                            className={`w-full flex items-center text-left py-0.5 px-1 bg-transparent text-ngray-50 rounded group-hover:opacity-100 ${
                                newCardBtnVisible ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <IconPlus size="small" />
                            <span className="ml-2 text-sm font-semibold select-none">
                                New
                            </span>
                        </button>
                    </IButton>
                )}
            </div>
        </div>
    );
};
