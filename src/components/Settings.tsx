import { IconMore } from "@douyinfe/semi-icons";
import { Modal, Toast } from "@douyinfe/semi-ui";
import { useEffect, useState } from "react";
import { Config } from "../types";
import { IButton } from "./IButton";
import { open } from "@tauri-apps/api/dialog";
import {
    archivedDocumentByMonth,
    setArchivedDocumentDirectory as setArchivedDocumentDirectoryTauri,
} from "../tauri";

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
    const handlearchivedDocumentByMonth = async () => {
        await archivedDocumentByMonth()
            .then((res) => {
                Toast.success("归档成功");
            })
            .catch((err) => {
                Toast.error("归档失败");
            });
    };
    return (
        <div className="px-4 flex items-center h-10 flex-row-reverse fixed right-0">
            <IButton onClick={() => setVisible(true)}>
                <IconMore size="large" />
            </IButton>
            <Modal
                visible={visible}
                title="设置"
                closeOnEsc={true}
                onCancel={() => setVisible(false)}
                size="medium"
                onOk={() => handleSave()}
            >
                <div>
                    <div className="font-semibold">归档文件目录</div>
                    <div className="w-full h-9 mt-3 leading-9 px-2 rounded border border-blue-400 relative">
                        {archivedDocumentDirectory}
                        <IButton
                            className="absolute right-1 top-1 h-7 px-2"
                            onClick={() => handleChooseDirectory()}
                        >
                            <button className="h-7 bg-transparent leading-7 text-blue-500">
                                修改
                            </button>
                        </IButton>
                    </div>
                </div>
                <div className="mt-4">
                    <IButton onClick={() => handlearchivedDocumentByMonth()}>
                        <button className="bg-transparent">
                            一键按月频将文件归档
                        </button>
                    </IButton>
                </div>
            </Modal>
        </div>
    );
};
