import { Draggable, DraggingStyle, NotDraggingStyle } from "@hello-pangea/dnd";
import { Card } from "../types";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { Avatar, AvatarGroup, Tag } from "@douyinfe/semi-ui";
import { TagColor } from "@douyinfe/semi-ui/lib/es/tag";
import { AvatarColor } from "@douyinfe/semi-ui/lib/es/avatar";

const TagColors: TagColor[] = [
    "amber",
    "blue",
    "cyan",
    "green",
    "grey",
    "indigo",
    "light-blue",
    "light-green",
    "lime",
    "orange",
    "pink",
    "purple",
    "red",
    "teal",
    "violet",
    "yellow",
];

const AvatarColors: AvatarColor[] = [
    "amber",
    "blue",
    "cyan",
    "green",
    "grey",
    "indigo",
    "light-blue",
    "light-green",
    "lime",
    "orange",
    "pink",
    "purple",
    "red",
    "teal",
    "violet",
    "yellow",
];

const grid = 8;

const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): React.CSSProperties => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
});

type ICardProps = {
    card: Card;
    index: number;
    setCardId: (cardId: number) => void;
};

export const ICard = ({ card, index, setCardId }: ICardProps) => {
    const [DueDate, SetDueDate] = useState("");
    const getDueDate = () => {
        const now = dayjs();
        const due = dayjs(card.due_date);
        const diff = due.diff(now, "day");
        if (diff > 0) {
            SetDueDate(`${diff} Days left`);
        } else if (diff === 0) {
            SetDueDate("Today");
        } else {
            SetDueDate("Expired");
        }
    };
    useEffect(() => {
        getDueDate();
    }, [index]);
    return (
        <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
            {(provided, snapshot): JSX.Element => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="text-left p-2 bg-white mb-2 
                    shadow-[rgb(15,15,15,0.1)_0px_0px_0px_1px,rgb(15,15,15,0.1)_0px_2px_4px] 
                    rounded text-[rgb(55,53,47)] 
                    hover:bg-ngray-3 last:mb-0"
                    // style={getItemStyle(
                    //     snapshot.isDragging,
                    //     provided.draggableProps.style
                    // )}
                    onClick={() => setCardId(card.id)}
                >
                    <div className={card.label_names ? "mb-2" : ""}>
                        {card.label_names &&
                            card.label_names
                                .split(",")
                                .map((label, index: number) => (
                                    <Tag
                                        key={label}
                                        className="mr-1"
                                        color={TagColors[index]}
                                        size="small"
                                    >
                                        {label}
                                    </Tag>
                                ))}
                    </div>
                    <h5 className="text font-semibold break-words select-none mb-1">
                        {card.name}
                    </h5>
                    <div className="text-sm">{card.description}</div>
                    <div className="flex justify-between items-center mt-2">
                        <div>
                            <AvatarGroup size="extra-small" maxCount={3}>
                                {card.assignee_names &&
                                    card.assignee_names
                                        .split(",")
                                        .map((label, index: number) => (
                                            <Avatar
                                                key={label}
                                                className="mr-1"
                                                color={AvatarColors[index]}
                                                size="small"
                                            >
                                                {label}
                                            </Avatar>
                                        ))}
                            </AvatarGroup>
                        </div>
                        <div className="text-sm">{DueDate}</div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
