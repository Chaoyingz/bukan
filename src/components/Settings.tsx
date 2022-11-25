import { IconMore } from "@douyinfe/semi-icons";
import { Modal } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import { Config } from "../types";
import { IButton } from "./IButton";
import { open } from "@tauri-apps/api/dialog";
import { setArchivedDocumentDirectory as setArchivedDocumentDirectoryTauri } from "../tauri";

type SettingsProps = {
    config: Config;
    setConfig: (config: Config) => void;
};

export const Settings = ({ config, setConfig }: SettingsProps) => {
    const [visible, setVisible] = useState(false);
    const [archivedDocumentDirectory, setArchivedDocumentDirectory] = useState(
        config.archived_document_directory
    );
    useEffect(() => {
        setArchivedDocumentDirectory(config.archived_document_directory);
    }, [config]);
    const handleChooseDirectory = async () => {
        const selected = await open({
            defaultPath: archivedDocumentDirectory,
            directory: true,
        });
        if (selected && typeof selected === "string") {
            setArchivedDocumentDirectory(selected);
            setConfig({
                ...config,
                archived_document_directory: selected,
            });
        }
    };
    const handleSave = async () => {
        await setArchivedDocumentDirectoryTauri({
            ...config,
            archived_document_directory: archivedDocumentDirectory,
        });
        setVisible(false);
    };
    return (
        <div className="px-4 flex items-center h-10 flex-row-reverse fixed right-0">
            <IButton onClick={() => setVisible(true)}>
                <IconMore size="large" />
            </IButton>
            <Modal
                visible={visible}
                title="Settings"
                closeOnEsc={true}
                onCancel={() => setVisible(false)}
                size="medium"
                onOk={() => handleSave()}
            >
                <div>
                    <div className="font-semibold">
                        Archived Document Directory
                    </div>
                    <div className="w-full h-9 mt-3 leading-9 px-2 rounded border border-blue-400 relative">
                        {archivedDocumentDirectory}
                        <IButton
                            className="absolute right-1 top-1 h-7 px-2"
                            onClick={() => handleChooseDirectory()}
                        >
                            <button className="h-7 bg-transparent leading-7 text-blue-500">
                                Change
                            </button>
                        </IButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
