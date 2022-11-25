import { useEffect, useState } from "react";
import { getAllLabels, getAllUsers, deleteLabel, deleteUser } from "../tauri";
import { Label, User } from "../types";
import { IButton } from "./IButton";

type SidebarProps = {
    refreshProject: boolean;
};

export const Sidebar = ({ refreshProject }: SidebarProps) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [assignees, setAssignees] = useState<User[]>([]);
    const fetchLabels = async () => {
        const newLabels = await getAllLabels();
        setLabels(newLabels);
    };
    const fetchAssignees = async () => {
        const newAssignees = await getAllUsers();
        setAssignees(newAssignees);
    };
    useEffect(() => {
        fetchLabels();
        fetchAssignees();
    }, [refreshProject]);
    const handleDeleteLabel = async (labelId: number) => {
        await deleteLabel(labelId);
        fetchLabels();
    };
    const handleDeleteAssignee = async (userId: number) => {
        await deleteUser(userId);
        fetchAssignees();
    };
    return (
        <div className="min-w-[15rem] w-60 min-h-screen bg-[#FBFBFA] shadow-[rgb(0,0,0,0.02)_-1px_0px_0px_0px_inset] text-ngray-50 font-semibold">
            <div className="px-1 pt-5 mb-4">
                <div className="flex px-5 justify-between items-center">
                    <div className="text-sm text-blue-600">Bukan</div>
                </div>
            </div>
            <div className="px-1 shadow-[rgb(55,53,47,0.09)_0px_-1px_0px]">
                <div className="py-5">
                    <div className="flex mb-3 px-5 justify-between items-center">
                        <div className="text-sm text-ngray-100">标签</div>
                        <button className="bg-transparent">
                            {/* <IconPlus size="small" /> */}
                        </button>
                    </div>
                    <div>
                        {labels.map((label) => (
                            <IButton className="mb-1 group" key={label.id}>
                                <div className="text-sm pl-4 pr-3 flex justify-between w-full items-center">
                                    <div>{label.name}</div>
                                    <button
                                        className="bg-transparent opacity-0 group-hover:opacity-100 hover:text-blue-500"
                                        onClick={() =>
                                            handleDeleteLabel(label.id)
                                        }
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </IButton>
                        ))}
                    </div>
                    <div className="flex mb-3 mt-5 px-5 justify-between items-center">
                        <div className="text-sm text-ngray-100">人员列表</div>
                        <button className="bg-transparent">
                            {/* <IconPlus size="small" /> */}
                        </button>
                    </div>
                    <div>
                        {assignees.map((assignee) => (
                            <IButton className="mb-1 group" key={assignee.id}>
                                <div className="text-sm pl-4 pr-3 flex justify-between w-full items-center">
                                    <div>{assignee.name}</div>
                                    <button
                                        className="bg-transparent opacity-0 group-hover:opacity-100 hover:text-blue-500"
                                        onClick={() =>
                                            handleDeleteAssignee(assignee.id)
                                        }
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </IButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
