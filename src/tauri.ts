import { invoke } from "@tauri-apps/api";
import { User, CardInCreate, CardInDB, CardStatus, CardInUptate } from "./types";
import { createDir, BaseDirectory, copyFile } from '@tauri-apps/api/fs';

const bukanDir = `bukan/${new Date().getFullYear()}`;

export const createUser = async (username: string): Promise<User> => {
    const newUser: User = await invoke("create_user", {
        user: {
            username: username,
        },
    });
    await createDir(bukanDir, { dir: BaseDirectory.Desktop, recursive: true });
    return newUser;
};

export const fetchUsers = async (): Promise<User[]> => {
    const users: User[] = await invoke("get_users");
    return users;
};

export const deleteUser = async (id: number): Promise<void> => {
    await invoke("delete_user", { id: id });
};

export const createCard = async (
    card: CardInCreate
): Promise<void> => {
    await invoke("create_card", { card:  card });
    await createDir(`${bukanDir}/${card.file_id}/收文`, { dir: BaseDirectory.Desktop, recursive: true });
    await copyFile(card.file_uri, `${bukanDir}/${card.file_id}/收文/${card.file_uri}`, { dir: BaseDirectory.Desktop });
}

export const fetchCard = async (id: number): Promise<CardInDB> => {
    const card: CardInDB = await invoke("get_card", { id: id });
    return card;
}

export const fetchCards = async (status: CardStatus): Promise<CardInDB[]> => {
    const cards: CardInDB[] = await invoke("get_cards", { status: status });
    return cards;
}

export const deleteCard = async (id: number): Promise<void> => {
    await invoke("delete_card", { id: id });
}

export const updateCardStatus = async (id: number, status: CardStatus): Promise<void> => {
    await invoke("update_card_status", { id: id, status: status });
}

export const updateCard = async (cardId: number, card: CardInUptate): Promise<void> => {
    await invoke("update_card", { id: cardId, card: card });
    if (card.received_file_uri) {
        await createDir(`${bukanDir}/${card.file_id}/落实文`, { dir: BaseDirectory.Desktop, recursive: true });
        await copyFile(card.received_file_uri, `${bukanDir}/${card.file_id}/落实文/${card.received_file_uri}`, { dir: BaseDirectory.Desktop });
    }
}