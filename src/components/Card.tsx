import { Avatar } from "@douyinfe/semi-ui";
import { CardInDB } from "../types";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

type CardProps = {
    card: CardInDB;
    setCardId: (cardId: number) => void;
};

export const Card = ({ card, setCardId }: CardProps) => {
    const [DueDate, SetDueDate] = useState("");
    const [onDrag, setOnDrag] = useState(false);

    const refushDueDate = () => {
        const now = dayjs();
        const due = dayjs(card.due_date);
        const diff = due.diff(now, "day");
        if (diff > 0) {
            SetDueDate(`还有${diff}天到期`);
        } else if (diff === 0) {
            SetDueDate("今天到期");
        } else {
            SetDueDate("已过期");
        }
    };
    useEffect(() => {
        refushDueDate();
        const timer = setInterval(() => {
            refushDueDate();
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);
    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        id: number
    ) => {
        e.dataTransfer.setData("card_id", id.toString());
        setOnDrag(true);
        console.log("start", onDrag);
    };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setOnDrag(false);
        console.log("end", onDrag);
    };
    return (
        <div>
            <div
                className={`bg-white w-full rounded-sm p-4 mb-2 shadow-sm cursor-pointer
            ${onDrag ? "shadow-md" : ""}
            `}
                draggable
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragEnd={(e) => handleDragEnd(e)}
                onClick={() => setCardId(card.id)}
            >
                <div className="grow">
                    <div className="mb-2 font-semibold">
                        <button className="bg-transparent hover:underline">
                            {card.file_id}
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                        <span>{card.file_uri}</span>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-center">
                            <div className="text-gray-600 text-sm">
                                {DueDate}
                            </div>
                        </div>
                        <Avatar size="extra-small" alt="User" color="red">
                            {card.assignee}
                        </Avatar>
                    </div>
                </div>
            </div>
        </div>
    );
};
