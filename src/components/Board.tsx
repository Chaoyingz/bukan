import { useState, useEffect } from "react";
import { Card } from "./Card";
import { NewCard } from "./NewCard";
import { CardStatus, CardInDB } from "../types";
import { fetchCards, updateCardStatus } from "../tauri";

type BoardProps = {
    title: string;
    hideCreateBtn: Boolean;
    status: CardStatus;
    setCardId: (cardId: number) => void;
};

export const Board = ({
    title,
    hideCreateBtn,
    status,
    setCardId,
}: BoardProps) => {
    const [NewCardVisible, setNewCardVisible] = useState(false);
    const [cards, setCards] = useState<CardInDB[]>([]);
    const refushCards = async () => {
        const cards = await fetchCards(status);
        setCards(cards);
    };
    useEffect(() => {
        refushCards();
    });
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        const card_id = e.dataTransfer.getData("card_id");
        console.log(card_id, status);
        await updateCardStatus(Number(card_id), status);
        refushCards();
    };
    return (
        <div className="group flex-auto bg-gray-50 px-3 py-4 rounded-md w-[calc(100%_/_3_-_theme(spacing.4))] hover:bg-gray-100">
            <div className="text-slate-500 mb-4 pl-2">{title}</div>
            <div
                onDragOver={(e) => handleDrag(e)}
                onDrop={(e) => handleDrop(e)}
            >
                {cards.map((card_in_db) => (
                    <Card
                        key={card_in_db.id}
                        card={card_in_db}
                        setCardId={setCardId}
                    ></Card>
                ))}
                <button
                    className={`flex leading-5 items-center bg-gray-100 hover:bg-gray-200 w-full p-2 rounded-md group-hover:opacity-100 ${
                        hideCreateBtn ? "opacity-0" : "opacity-100"
                    }`}
                    onClick={() => setNewCardVisible(true)}
                >
                    <span className="mr-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                        创建卡片
                    </span>
                </button>
            </div>
            <NewCard
                visible={NewCardVisible}
                setVisible={setNewCardVisible}
                status={status}
            ></NewCard>
        </div>
    );
};
