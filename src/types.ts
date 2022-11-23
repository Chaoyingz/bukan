import { AvatarColor } from "@douyinfe/semi-ui/lib/es/avatar";

export type columnId = string;
export type cardId = string;

export interface Config {
    is_first_run: boolean;
    actived_project_id: number;
    archived_document_directory: string;
}

export interface Project {
    id: number;
    name: string;
    column_ids: string;
    created_at: string;
}

export interface Column {
    id: number;
    name: string;
    card_ids: string;
}


export interface User {
    id: number;
    name: string;
    color: AvatarColor;
    created_at: string;
}

export interface Comment {
    id: number;
    user: User;
    content: string;
    created_at: string;
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface CardInCreate {
    name: string;
    projectId: number;
    columnId: number;
    description: string;
    dispatchFile: string;
    receivedFiles: string;
    labelIds?: string;
    assigneeIds?: string;
    dueDate: string;
}

export interface Card {
    id: number;
    name: string;
    project_id: number;
    column_id: number;
    description: string;
    due_date: string;
    created_at: string;
    label_ids: string;
    assignee_ids: string;
    dispatch_file: string;
    received_files: string;
    label_names: string;
    assignee_names: string;
}

export interface CardInColumn {
    id: number;
    name: string;
    project: string | null;
    description: string | null;
    column: number;
    creator: string;
    due_date: string | null;
    created_at: string;
}

export interface ProjectCustomProperty {
    project_id: number;
    name: string;
    property_type: string;
    is_multiple: boolean;
}