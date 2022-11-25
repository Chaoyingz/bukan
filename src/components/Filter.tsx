import {
    getAllProjects,
    createProject,
    deleteProject,
    updateProjectName,
} from "../tauri";
import { useEffect, useRef, useState } from "react";
import { Toast, Modal, Input } from "@douyinfe/semi-ui";
import { Config, Project } from "../types";
import { IButton } from "./IButton";
import { IconPlus } from "@douyinfe/semi-icons";
import { FilterProject } from "./FilterProject";

type FilterProps = {
    setNewCardVisible: (visible: boolean) => void;
    config: Config;
    setConfig: (config: Config) => void;
    keyword: string;
    setKeyword: (keyword: string) => void;
};

export const Filter = ({
    setNewCardVisible,
    config,
    setConfig,
    keyword,
    setKeyword,
}: FilterProps) => {
    const [keywordVisible, setKeywordVisible] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="min-w-[52.5rem] flex justify-between items-center mt-6 mb-2 h-10 shadow-[rgb(233,233,231)_0px_-1px_0px_inset]">
            <FilterProject
                config={config}
                setConfig={setConfig}
            ></FilterProject>
            <div className="flex text-ngray-100 text-sm">
                {/* <IButton>
                    <button className="bg-transparent">Filter</button>
                </IButton> */}
                <IButton
                    className="mr-1"
                    onClick={() => setKeywordVisible(true)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </IButton>
                <input
                    type="text"
                    value={keyword}
                    className={
                        "bg-transparent text-ngray-100 text-sm p-0.5 outline-none w-0 mr-4 transition-[width]" +
                        (keywordVisible ? " w-28" : "")
                    }
                    placeholder="type to search..."
                    onChange={(e) => setKeyword(e.target.value)}
                    ref={ref}
                />
                <button
                    className="bg-blue-500 py-1 px-2 rounded text-white hover:bg-blue-600"
                    onClick={() => setNewCardVisible(true)}
                >
                    新建卡片
                </button>
            </div>
        </div>
    );
};
