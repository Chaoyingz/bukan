import { Button, Form, Row, Toast } from "@douyinfe/semi-ui";
import { IButton } from "./IButton";
import { Column, CardInCreate, Project, Config } from "../types";
import { useEffect, useRef, useState } from "react";
import { copyFile, createDir } from "@tauri-apps/api/fs";
import {
    getAllColumns,
    createUser,
    getAllUsers,
    getAllLabels,
    createLabel,
    updateCard,
    getCard,
    getProject,
    deleteCard as deleteCardApi,
} from "../tauri";
import { IconUploadError } from "@douyinfe/semi-icons";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { open } from "@tauri-apps/api/dialog";
import Label from "@douyinfe/semi-ui/lib/es/form/label";

type EditCardProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    projectId: number;
    refreshProject: boolean;
    setRefreshProject: (refresh: boolean) => void;
    cardId: number;
    setCardId: (id: number) => void;
    config: Config;
};

type File = {
    name: string;
    path: string;
};

const AvatarColors = [
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

type Option = {
    value: number;
    label: string;
};

export const EditCard = ({
    visible,
    setVisible,
    projectId,
    refreshProject,
    setRefreshProject,
    cardId,
    setCardId,
    config,
}: EditCardProps) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [users, setUsers] = useState<Option[]>();
    const [labels, setLabels] = useState<Option[]>();
    const [name, setName] = useState("");
    const [dispatchFile, setDispatchFile] = useState<File>();
    const [receivedFiles, setReceivedFiles] = useState<File[]>([]);
    const [nameValid, setNameValid] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);
    const [project, setProject] = useState<Project>();
    const [isLoad, setIsLoad] = useState(false);
    const fetchProject = async () => {
        const project = await getProject(projectId);
        setProject(project);
    };
    const fetchColumns = async () => {
        const columns = await getAllColumns(projectId);
        setColumns(columns);
    };
    const fetchUsers = async () => {
        const users = await getAllUsers();
        const userOptions = users.map((user) => ({
            value: user.id,
            label: user.name,
        }));
        setUsers(userOptions);
    };
    const fetchLabels = async () => {
        const labels = await getAllLabels();
        const labelOptions = labels.map((label) => ({
            value: label.id,
            label: label.name,
        }));
        setLabels(labelOptions);
    };
    useEffect(() => {
        fetchColumns();
        fetchUsers();
        fetchLabels();
        fetchProject();
        setDispatchFile(undefined);
        setReceivedFiles([]);
    }, [visible && cardId]);
    useEffect(() => {
        fetchCard();
    }, [visible && cardId]);
    const formApiRef = useRef<FormApi>();
    const saveFormApi = (formApi: FormApi) => {
        formApiRef.current = formApi;
    };

    const fetchAssigneeIds = async (values: Record<string, any>) => {
        if (values.assignees) {
            let registedUserIds: number[] = [];
            if (users) {
                registedUserIds = users.map((user) => user.value);
            }
            let checkedUserIds = registedUserIds.filter((userId) =>
                values.labels.includes(userId)
            );
            const UnregistedUsers = values.assignees.filter(
                (assignee: string) =>
                    !registedUserIds.includes(Number(assignee))
            );
            const unregistedUserIds = await Promise.all(
                UnregistedUsers.map(async (user: string) => {
                    const randomIndex = Math.floor(
                        Math.random() * AvatarColors.length
                    );
                    const new_user = await createUser(
                        user,
                        AvatarColors[randomIndex]
                    );
                    return new_user.id;
                })
            );
            return [...checkedUserIds, ...unregistedUserIds];
        } else {
            return [];
        }
    };
    const fetchLabelIds = async (values: Record<string, any>) => {
        if (values.labels) {
            let registedLabelIds: number[] = [];
            if (labels) {
                registedLabelIds = labels.map((label) => label.value);
            }
            let checkedLabelIds = registedLabelIds.filter((labelId) =>
                values.labels.includes(labelId)
            );
            const UnregistedLabels = values.labels.filter(
                (label: string) => !registedLabelIds.includes(Number(label))
            );
            const unregistedLabelIds = await Promise.all(
                UnregistedLabels.map(async (label: string) => {
                    const randomIndex = Math.floor(
                        Math.random() * AvatarColors.length
                    );
                    const new_label = await createLabel(
                        label,
                        AvatarColors[randomIndex]
                    );
                    return new_label.id;
                })
            );
            return [...checkedLabelIds, ...unregistedLabelIds];
        } else {
            return [];
        }
    };

    const handleSubmit = async (values: Record<string, any>) => {
        if (isSubmit) {
            return;
        }
        if (name === "") {
            setNameValid(false);
            return;
        } else {
            setNameValid(true);
        }
        setIsSubmit(true);
        let assignee_ids = await fetchAssigneeIds(values);
        let label_ids = await fetchLabelIds(values);
        let card: CardInCreate = {
            name: name,
            projectId: projectId,
            columnId: values.status,
            description: values.description,
            dispatchFile: dispatchFile?.name || "",
            receivedFiles: receivedFiles.map((file) => file.name).join(","),
            dueDate: values.due_date,
        };
        if (label_ids.length > 0) {
            card.labelIds = label_ids.join(",");
        }
        if (assignee_ids.length > 0) {
            card.assigneeIds = assignee_ids.join(",");
        }
        await updateCard(cardId, card)
            .then(async () => {
                Toast.success("Update card successfully");
                setVisible(false);
                setRefreshProject(!refreshProject);
                formApiRef.current?.setValues({});
                setName("");
                setDispatchFile(undefined);
                setReceivedFiles([]);
                await CopyFileToProject();
                setCardId(-1);
            })
            .catch((err) => {
                Toast.error(`Update card failed, ${err}`);
            });
        setIsSubmit(false);
    };
    const syncValidate = (values: Record<string, any>) => {
        const errors: { [key: string]: string } = {};
        if (!values.status) {
            errors.status = "Status is required";
        }
        return Object.keys(errors).length !== 0 ? errors : "";
    };
    const CopyFileToProject = async () => {
        let baseDir = `${config.archived_document_directory}/${project?.name}/${name}`;
        if (dispatchFile) {
            await createDir(`${baseDir}/Dispatch File`, { recursive: true });
            await copyFile(
                dispatchFile.path,
                `${baseDir}/Dispatch File/${dispatchFile.name}`
            );
        }
        for (let file of receivedFiles) {
            await createDir(`${baseDir}/Received Files`, { recursive: true });
            await copyFile(file.path, `${baseDir}/Received Files/${file.name}`);
        }
    };
    const fetchCard = async () => {
        setIsLoad(false);
        setDispatchFile(undefined);
        setReceivedFiles([]);
        if (cardId && cardId !== -1) {
            const card = await getCard(cardId);
            setName(card.name);
            formApiRef.current?.setValues({
                status: card.column_id,
                description: card.description,
                due_date: card.due_date,
            });
            if (card.label_ids) {
                formApiRef.current?.setValue(
                    "labels",
                    card.label_ids.split(",").map((id) => Number(id))
                );
            }
            if (card.assignee_ids) {
                formApiRef.current?.setValue(
                    "assignees",
                    card.assignee_ids.split(",").map((id) => Number(id))
                );
            }
            if (card.dispatch_file) {
                setDispatchFile({
                    name: card.dispatch_file,
                    path: `${config.archived_document_directory}/${project?.name}/${card.name}/Dispatch File/${card.dispatch_file}`,
                });
            }
            if (card.received_files) {
                setReceivedFiles(
                    card.received_files.split(",").map((file) => ({
                        name: file,
                        path: `${config.archived_document_directory}/${project?.name}/${card.name}/Received Files/${file}`,
                    }))
                );
            }
        }
        setIsLoad(true);
    };
    const handleDispatchFileUpload = async () => {
        const selected = await open({});
        if (selected && typeof selected === "string") {
            setDispatchFile({
                name: selected.replace(/^.*[\\\/]/, ""),
                path: selected,
            });
        }
    };
    const handleReceivedFileUpload = async () => {
        const selected = await open({
            multiple: true,
        });
        if (selected) {
            if (typeof selected === "string") {
                setReceivedFiles([
                    ...receivedFiles,
                    {
                        name: selected.replace(/^.*[\\\/]/, ""),
                        path: selected,
                    },
                ]);
            } else {
                const newFiles = selected.map((path: string) => ({
                    name: path.replace(/^.*[\\\/]/, ""),
                    path: path,
                }));
                setReceivedFiles([...receivedFiles, ...newFiles]);
            }
        }
    };
    const handleDeleteReceivedFile = (index: number) => {
        const newFiles = [...receivedFiles];
        newFiles.splice(index, 1);
        setReceivedFiles(newFiles);
    };
    const handleClose = () => {
        setVisible(false);
        if (cardId && setCardId) {
            setCardId(-1);
        }
    };
    const deleteCard = async () => {
        await deleteCardApi(cardId)
            .then(() => {
                Toast.success("Delete card successfully");
                setRefreshProject(!refreshProject);
                handleClose();
            })
            .catch((err) => {
                Toast.error(`Delete card failed, ${err}`);
            });
    };
    return (
        <div
            className={
                "transition-[width] overflow-hidden z-50 min-h-[calc(17px+100vh)] absolute right-0 bg-white top-0 shadow-[rgb(15,15,15,0.02)_0px_0px_0px_1px,rgb(15,15,15,0.03)_0px_3px_6px,rgb(15,15,15,0.06)_0px_9px_24px]" +
                (visible ? " w-[30rem]" : " w-0")
            }
        >
            <Form
                className="text-ngray-70"
                labelWidth={130}
                labelPosition="left"
                onSubmit={handleSubmit}
                validateFields={syncValidate}
                getFormApi={(formApi) => saveFormApi(formApi)}
            >
                <div className="flex items-center h-10 justify-between px-2">
                    <div>
                        <IButton onClick={() => handleClose()}>
                            <button
                                className="bg-transparent flex items-center text-ngray-50"
                                type="button"
                            >
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
                                        d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                                    />
                                </svg>
                            </button>
                        </IButton>
                    </div>
                    <div className="flex gap-3">
                        <IButton className="p-0">
                            <button
                                type="submit"
                                className="bg-transparent flex items-center text-blue-700"
                            >
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
                                        d="M4.5 12.75l6 6 9-13.5"
                                    />
                                </svg>
                            </button>
                        </IButton>
                        <IButton>
                            <button
                                className="bg-transparent flex items-center text-ngray-700"
                                type="button"
                                onClick={() => deleteCard()}
                            >
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
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            </button>
                        </IButton>
                    </div>
                </div>
                <div className="bg-ngray-9 mb-4 h-[1px]"></div>
                <div className="px-12 text-ngray-70">
                    <Row>
                        <div className="before:content-['*'] before:text-red-500 before:relative before:-top-3 before:-left-1">
                            <input
                                placeholder="Untitled"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white mb-6 hover:bg-white h-10 font-bold placeholder:text-ngray-15 text-3xl p-0.5 outline-none mt-6 text-black w-[calc(100%-1rem)]"
                            />
                        </div>
                        <div
                            className={
                                "text-red-500 text-sm flex items-center" +
                                (!nameValid ? " block" : " hidden")
                            }
                        >
                            <IconUploadError className="mr-2" />
                            Card name is required
                        </div>
                    </Row>
                    <Row>
                        <Form.Select
                            field="status"
                            placeholder="Please select a status"
                            className="w-60"
                            label={{ text: "Status", required: true }}
                        >
                            {columns.map((column) => (
                                <Form.Select.Option
                                    value={column.id}
                                    key={column.id}
                                >
                                    {column.name}
                                </Form.Select.Option>
                            ))}
                        </Form.Select>
                    </Row>
                    <Row>
                        {users && (
                            <Form.Select
                                field="assignees"
                                placeholder="Please select a assignee"
                                filter
                                allowCreate
                                optionList={users}
                                multiple
                                defaultActiveFirstOption
                                className="w-60"
                                label="Assignees"
                            ></Form.Select>
                        )}
                    </Row>
                    <Row>
                        {labels && (
                            <Form.Select
                                field="labels"
                                placeholder="Please select a labels"
                                filter
                                allowCreate
                                optionList={labels}
                                multiple
                                defaultActiveFirstOption
                                className="w-60"
                                label="Labels"
                            ></Form.Select>
                        )}
                    </Row>
                    <Row>
                        <Form.DatePicker
                            field="due_date"
                            className="w-60"
                            label="Due Date"
                        ></Form.DatePicker>
                    </Row>
                    <Row className="py-3 flex">
                        <Label className="w-[130px] leading-8 mb-0">
                            Dispatch File
                        </Label>
                        <div>
                            {dispatchFile && (
                                <div className="rounded bg-[rgb(244,245,245)] w-60 h-8 leading-8 px-3 text-sm relative overflow-hidden">
                                    {dispatchFile?.name}
                                    <IButton
                                        className="absolute right-0.5 top-0.5"
                                        onClick={() =>
                                            handleDispatchFileUpload()
                                        }
                                    >
                                        <button
                                            className="bg-transparent"
                                            type="button"
                                        >
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
                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                                />
                                            </svg>
                                        </button>
                                    </IButton>
                                </div>
                            )}

                            {!dispatchFile && (
                                <Button
                                    onClick={() => handleDispatchFileUpload()}
                                >
                                    Choose File
                                </Button>
                            )}
                        </div>
                    </Row>
                    <Row className="py-3 flex">
                        <Label className="w-[130px] leading-8 mb-0">
                            Received Files
                        </Label>
                        <div>
                            {receivedFiles.length !== 0 &&
                                receivedFiles.map((file, index) => (
                                    <div
                                        className="rounded bg-[rgb(244,245,245)] w-60 h-8 leading-8 px-3 text-sm relative mb-2 overflow-hidden"
                                        key={index}
                                    >
                                        {file.name}
                                        <IButton
                                            className="absolute right-1 top-1"
                                            onClick={() =>
                                                handleDeleteReceivedFile(index)
                                            }
                                        >
                                            <button
                                                className="bg-transparent"
                                                type="button"
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
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </IButton>
                                    </div>
                                ))}

                            {receivedFiles.length !== 0 && (
                                <IButton
                                    onClick={() => handleReceivedFileUpload()}
                                >
                                    <button
                                        className="bg-transparent text-sm px-2 h-6"
                                        type="button"
                                    >
                                        Upload More ...
                                    </button>
                                </IButton>
                            )}

                            {receivedFiles.length === 0 && (
                                <Button
                                    onClick={() => handleReceivedFileUpload()}
                                >
                                    Choose Files
                                </Button>
                            )}
                        </div>
                    </Row>
                </div>
                <div className="bg-ngray-9 mt-6 h-[1px]"></div>
                <div className="px-12 mt-6">
                    <Form.TextArea
                        field="description"
                        label="Description"
                        placeholder="Add a more detailed description..."
                        rows={5}
                        maxCount={1000}
                        labelPosition="inset"
                    />
                </div>
                <div className="bg-ngray-9 mt-6 h-[1px]"></div>
            </Form>
        </div>
    );
};
