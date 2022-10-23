import { AvatarColor } from "@douyinfe/semi-ui/lib/es/avatar";

export interface User {
    id: number;
    username: string;
    color: AvatarColor;
    created_at: string;
}


export enum CardStatus {
    TODO = "TODO",
    DOING = "DOING",
    DONE = "DONE",
}

interface Card {
    file_id: string;
    file_uri: string;
    receipt_date: string;
    due_date: string;
    assignee: string;
    status: CardStatus;
}

export interface CardInCreate extends Card {}

export interface CardInUptate extends Card {
    received_file_uri: string;
}

export interface CardInDB extends Card {
    id: number;
    received_file_uri: string;
    created_at: string;
}
