import { Board } from "./components/Board";
import { UserMenu } from "./components/UserMenu";
import { CardStatus } from "./types";
import { useState, useEffect } from "react";
import { ViewCard } from "./components/ViewCard";

export const App = () => {
    const [sideVisible, setSideVisible] = useState(false);
    const [cardId, setCardId] = useState<null | number>(null);
    useEffect(() => {
        if (cardId !== null) {
            setSideVisible(true);
        }
    });
    return (
        <div className="px-8 py-5">
            <div className="flex justify-between items-center mb-7">
                <h1 className="text-xl font-bold">各项工作进展台账</h1>
                <div className="flex items-center">
                    <UserMenu></UserMenu>
                    <div className="ml-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-7 h-7"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-row gap-4">
                <Board
                    title={CardStatus.TODO}
                    status={CardStatus.TODO}
                    hideCreateBtn={false}
                    setCardId={setCardId}
                ></Board>
                <Board
                    title={CardStatus.DOING}
                    status={CardStatus.DOING}
                    hideCreateBtn={true}
                    setCardId={setCardId}
                ></Board>
                <Board
                    title={CardStatus.DONE}
                    status={CardStatus.DONE}
                    hideCreateBtn={true}
                    setCardId={setCardId}
                ></Board>
            </div>
            {cardId && (
                <ViewCard
                    cardId={cardId}
                    visible={sideVisible}
                    setVisible={setSideVisible}
                    setCardId={setCardId}
                ></ViewCard>
            )}
        </div>
    );
};
