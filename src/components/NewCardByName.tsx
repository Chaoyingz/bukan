import { TextArea, Toast } from "@douyinfe/semi-ui";
import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import { createCardByName } from "../tauri";

type NewCardByNameProps = {
    visible: boolean;
    projectId: number;
    columnId: number;
    setVisible: (visible: boolean) => void;
    refreshProject: boolean;
    setRefreshProject: (isRefushProject: boolean) => void;
};

export const NewCardByName = ({
    visible,
    projectId,
    columnId,
    setVisible,
    refreshProject,
    setRefreshProject,
}: NewCardByNameProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState("");
    const [status, setStatus] = useState<"default" | "error">("default");
    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setVisible(false);
        }
    };
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setVisible(false);
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (value.length > 0) {
                    setVisible(false);
                    setValue("");
                    handleNewCardSubmit();
                } else {
                    Toast.error("Please enter a card name");
                    setStatus("error");
                }
            }
        },
        [value]
    );
    const handleNewCardSubmit = () => {
        createCardByName(value, projectId, columnId)
            .then((res) => {
                Toast.success("Card created");
                setRefreshProject(!refreshProject);
            })
            .catch((err) => {
                Toast.error("Failed to create card \n" + err);
            });
    };
    useEffect(() => {
        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [visible]);
    useEffect(() => {
        if (value.length > 0) {
            setStatus("default");
        }
    }, [visible, value]);
    return (
        <div ref={ref}>
            {visible && (
                <TextArea
                    autosize
                    className="rounded shadow-[rgb(15,15,15,0.1)_0px_0px_0px_1px,rgb(15,15,15,0.1)_0px_2px_4px] bg-white w-full hover:bg-white text-sm font-semibold"
                    placeholder="Type a name..."
                    rows={2}
                    autoFocus={true}
                    showClear={true}
                    value={value}
                    onChange={(value) => {
                        setValue(value);
                    }}
                    validateStatus={status}
                    onKeyDown={handleKeyDown}
                ></TextArea>
            )}
        </div>
    );
};
