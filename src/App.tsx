import { Kanban } from "./components/Kanban";
import { Sidebar } from "./components/Sidebar";
import { IconMore } from "@douyinfe/semi-icons";
import { Filter } from "./components/Filter";
import { useEffect, useState } from "react";
import { Config } from "./types";
import { getConfig } from "./tauri";
import { NewCard } from "./components/NewCard";
import { Settings } from "./components/Settings";
import { EditCard } from "./components/EditCard";

export const App = () => {
    const [config, setConfig] = useState<Config>({
        is_first_run: false,
        actived_project_id: -1,
        archived_document_directory: "",
    });
    const [keyword, setKeyword] = useState("");
    const [newCardVisible, setNewCardVisible] = useState(false);
    const [refreshProject, setRefreshProject] = useState(false);
    const [CardId, setCardId] = useState<number>(-1);
    const fetchConfig = async () => {
        const config = await getConfig();
        setConfig(config);
    };
    useEffect(() => {
        fetchConfig();
    }, []);
    useEffect(() => {
        if (CardId && CardId !== -1) {
            setNewCardVisible(true);
        }
    }, [CardId]);
    return (
        <div>
            <Settings config={config} />
            <div className="flex">
                <Sidebar refreshProject={refreshProject} />
                <div>
                    <div className="mt-3">
                        <div
                            className={
                                "pl-12 mr-6 overflow-scroll min-h-screen" +
                                (newCardVisible ? " w-[calc(100%-27rem)]" : "")
                            }
                        >
                            <Filter
                                setNewCardVisible={setNewCardVisible}
                                config={config}
                                setConfig={setConfig}
                                keyword={keyword}
                                setKeyword={setKeyword}
                            />
                            <Kanban
                                activeProjectId={config.actived_project_id}
                                refreshProject={refreshProject}
                                setRefreshProject={setRefreshProject}
                                setCardId={setCardId}
                                keyword={keyword}
                            />
                        </div>
                    </div>
                    {config.actived_project_id !== -1 &&
                        CardId &&
                        CardId !== -1 && (
                            <EditCard
                                visible={newCardVisible}
                                setVisible={setNewCardVisible}
                                projectId={config.actived_project_id}
                                refreshProject={refreshProject}
                                setRefreshProject={setRefreshProject}
                                cardId={CardId}
                                setCardId={setCardId}
                                config={config}
                            ></EditCard>
                        )}
                    {config.actived_project_id !== -1 && CardId === -1 && (
                        <NewCard
                            visible={newCardVisible}
                            setVisible={setNewCardVisible}
                            projectId={config.actived_project_id}
                            refreshProject={refreshProject}
                            setRefreshProject={setRefreshProject}
                            setCardId={setCardId}
                            config={config}
                        ></NewCard>
                    )}
                </div>
            </div>
        </div>
    );
};
