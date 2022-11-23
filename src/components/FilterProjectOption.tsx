import { Project, ProjectCustomProperty } from "../types";
import { useEffect, useRef, useState } from "react";
import { IButton } from "./IButton";
import { Button, Form, Input, Modal, Row, Toast } from "@douyinfe/semi-ui";
import { updateProjectName } from "../tauri";

type ProjectOptionProps = {
    project: Project;
    activeOptionId: number;
    setActiveOptionId: (id: number) => void;
    setNewProjectName: (name: string) => void;
    onDeleteProject: () => void;
    onRenameProject: () => void;
    setNewProjectCustomProperty: (
        newProjectCustomProperty: ProjectCustomProperty
    ) => void;
};

export const FilterProjectOption = ({
    project,
    activeOptionId,
    setActiveOptionId,
    setNewProjectName,
    onDeleteProject,
    onRenameProject,
    setNewProjectCustomProperty,
}: ProjectOptionProps) => {
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [
        createProjectCustomPropertyModalVisible,
        setCreateProjectCustomPropertyModalVisible,
    ] = useState(false);
    const [
        viewProjectCustomPropertyModalVisible,
        setViewProjectCustomPropertyModalVisible,
    ] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setActiveOptionId(-1);
        }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setActiveOptionId(-1);
        }
    };
    useEffect(() => {
        if (activeOptionId === project.id) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [activeOptionId]);
    const syncPropertyValidate = (values: Record<string, any>) => {
        const errors: { [key: string]: string } = {};
        if (!values.name) {
            errors.name = "Please enter a name";
        }
        if (!values.property_type) {
            errors.property_type = "Please enter a property_type";
        }
        if (values.multiple === null) {
            errors.multiple = "Please enter a multiple";
        }
        return Object.keys(errors).length !== 0 ? errors : "";
    };
    const handlePropertySubmit = (values: any) => {
        setNewProjectCustomProperty({
            name: values.name,
            property_type: values.property_type,
            is_multiple: values.multiple === 1,
            project_id: project.id,
        });
        setCreateProjectCustomPropertyModalVisible(false);
    };
    return (
        <div
            ref={ref}
            className={
                "absolute top-[2.2rem] bg-white rounded w-56 py-1 font-semibold text-sm text-ngray-100 shadow-[rgb(15,15,15,0.05)_0px_0px_0px_1px,rgb(15,15,15,0.1)_0px_3px_6px,rgb(15,15,15,0.2)_0px_9px_24px]" +
                (activeOptionId === project.id ? " block" : " hidden")
            }
        >
            <IButton
                className="mx-1"
                onClick={() => setRenameModalVisible(true)}
            >
                <button className="bg-transparent flex items-center h-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4 mr-3 ml-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                    </svg>
                    Rename
                </button>
            </IButton>
            {/* <div className="bg-ngray-9 h-[1px] my-1"></div>
            <IButton
                className="mx-1"
                onClick={() => setCreateProjectCustomPropertyModalVisible(true)}
            >
                <button className="bg-transparent flex items-center h-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 mr-3 ml-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                    </svg>
                    Add Property
                </button>
            </IButton>
            <IButton
                className="mx-1"
                onClick={() => setViewProjectCustomPropertyModalVisible(true)}
            >
                <button className="bg-transparent flex items-center h-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 mr-3 ml-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    View Property
                </button>
            </IButton>
            <div className="bg-ngray-9 h-[1px] my-1"></div> */}
            <IButton className="mx-1" onClick={onDeleteProject}>
                <button className="bg-transparent flex items-center h-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4 mr-3 ml-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                    </svg>
                    Delete
                </button>
            </IButton>

            <Modal
                title="Rename Project"
                visible={renameModalVisible}
                onOk={() => {
                    onRenameProject(), setRenameModalVisible(false);
                }}
                onCancel={() => setRenameModalVisible(false)}
                closeOnEsc={true}
            >
                <Input
                    defaultValue={project.name}
                    onChange={(value) => {
                        setNewProjectName(value);
                    }}
                ></Input>
            </Modal>
            {/* <Modal
                title="Add Property"
                visible={createProjectCustomPropertyModalVisible}
                onOk={() => {}}
                onCancel={() =>
                    setCreateProjectCustomPropertyModalVisible(false)
                }
                closeOnEsc={true}
                footer={null}
            >
                <Form
                    onSubmit={handlePropertySubmit}
                    validateFields={syncPropertyValidate}
                >
                    <Row>
                        <Form.Input
                            field="name"
                            name="Name"
                            className="w-full"
                        />
                    </Row>
                    <Row>
                        <Form.Select
                            field="property_type"
                            name="Property Type"
                            className="w-full"
                        >
                            <Form.Select.Option value={"text"}>
                                Text
                            </Form.Select.Option>
                            <Form.Select.Option value={"file"}>
                                File
                            </Form.Select.Option>
                        </Form.Select>
                    </Row>
                    <Row>
                        <Form.Select
                            field="multiple"
                            name="Multiple"
                            className="w-full"
                        >
                            <Form.Select.Option value={0}>
                                No
                            </Form.Select.Option>
                            <Form.Select.Option value={1}>
                                Yes
                            </Form.Select.Option>
                        </Form.Select>
                    </Row>
                    <Row className="flex justify-end mt-2 mb-8">
                        <Button
                            className="mr-2"
                            onClick={() => {
                                setCreateProjectCustomPropertyModalVisible(
                                    false
                                );
                            }}
                        >
                            Cancel
                        </Button>
                        <Button htmlType="submit">Submit</Button>
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="View Property"
                visible={viewProjectCustomPropertyModalVisible}
                onOk={() => {
                    setViewProjectCustomPropertyModalVisible(false);
                }}
                onCancel={() => setViewProjectCustomPropertyModalVisible(false)}
                closeOnEsc={true}
            ></Modal> */}
        </div>
    );
};
