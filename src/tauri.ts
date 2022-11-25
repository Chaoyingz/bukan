import { invoke } from "@tauri-apps/api";
import { Card, CardInColumn, Column, Project, Config, User, Label, CardInCreate, ProjectCustomProperty } from "./types";

export const getConfig = async (): Promise<Config> => {
    return await invoke("get_config");
};

export const setActivedProjectId = async (config: Config): Promise<void> => {
    return await invoke("set_actived_project_id", { "activedProjectId": config.actived_project_id });
}

export const setArchivedDocumentDirectory = async (config: Config): Promise<void> => {
    return await invoke("set_archived_document_directory", { "archivedDocumentDirectory": config.archived_document_directory });
}

export const createProject = async (name: string): Promise<Project> => {
    return await invoke("create_project", { name });
};

export const getProject = async (projectId: number): Promise<Project> => {
    return await invoke("get_project", {projectId});
}

export const getAllProjects = async (): Promise<Project[]> => {
    return await invoke("get_all_projects");
}

export const deleteProject = async (projectId: number): Promise<void> => {
    return await invoke("delete_project", {projectId});
}

export const updateProjectName = async (projectId: number, name: string): Promise<void> => {
    return await invoke("update_project_name", {projectId, name});
}


export const getAllColumns = async (projectId: number): Promise<Column[]> => {
    return await invoke("get_all_columns", {projectId});
}

export const createCardByName = async (name: String, projectId: Number, columnId: Number): Promise<void> => {
    return await invoke("create_card_by_name", { name, projectId, columnId });
}

export const filterCards = async (projectId: Number, keyword?: String): Promise<CardInColumn[]> => {
    return await invoke("filter_cards", { projectId, keyword });
}

export const updateCardIds = async (columnId: Number, cardIds: String): Promise<void> => {
    return await invoke("update_card_ids", { columnId, cardIds });
}

export const updateCardColumnId = async (cardId: Number, columnId: Number): Promise<void> => {
    return await invoke("update_card_column_id", { cardId, columnId });
}

export const createCard = async (
    {name,
    projectId,
    columnId,
    description,
    dispatchFile,
    receivedFiles,
    labelIds,
    assigneeIds,
    dispatchDate,
    dueDate,}: CardInCreate
): Promise<void> => {
    return await invoke("create_card", { name, projectId, columnId, description, dispatchFile, receivedFiles, labelIds, assigneeIds, dispatchDate, dueDate });
}

export const updateCard = async (
    cardId: Number,
    {name,
        projectId,
        columnId,
        description,
        dispatchFile,
        receivedFiles,
        labelIds,
        assigneeIds,
        dispatchDate,
        dueDate,}: CardInCreate
): Promise<void> => {
    return await invoke("update_card", { cardId, name, projectId, columnId, description, dispatchFile, receivedFiles, labelIds, assigneeIds, dispatchDate, dueDate });
}

export const getCard = async (cardId: Number): Promise<Card> => {
    return await invoke("get_card", {cardId});
}

export const deleteCard = async (cardId: Number): Promise<void> => {
    return await invoke("delete_card", {cardId});
}
    
export const createUser = async (name: String, color: String): Promise<User> => {
    return await invoke("create_user", { name, color });
}

export const getAllUsers = async (): Promise<User[]> => {
    return await invoke("get_all_users");
}

export const deleteUser = async (userId: Number): Promise<void> => {
    return await invoke("delete_user", {userId});
}

export const createLabel = async (name: String, color: String): Promise<Label> => {
    return await invoke("create_label", { name, color });
}

export const getAllLabels = async (): Promise<Label[]> => {
    return await invoke("get_all_labels");
}

export const deleteLabel = async (labelId: Number): Promise<void> => {
    return await invoke("delete_label", {labelId});
}

export const createProjectCustomProperty = async ({project_id, name, property_type, is_multiple}: ProjectCustomProperty): Promise<void> => {
    return await invoke("create_project_custom_property", { projectId: project_id, name: name, propertyType: property_type, isMultiple: is_multiple });
}

export const archivedDocumentByMonth = async (): Promise<void> => {
    return await invoke("archived_document_by_month");
}