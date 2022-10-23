use crate::models::{Card, Status, User};
use crate::state::AppState;
use rand::seq::SliceRandom;

#[tauri::command]
pub fn create_user(user: User, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    let available_colors = vec![
        "amber", "blue", "cyan", "green", "indigo", "orange", "pink", "purple", "red", "teal",
        "yellow",
    ];
    let color = available_colors
        .choose(&mut rand::thread_rng())
        .unwrap()
        .to_string();
    state
        .connection
        .execute(
            "INSERT INTO user (username, color) VALUES (?1, ?2)",
            &[&user.username, &color],
        )
        .expect("Error inserting user");
    "success.".to_string()
}

#[tauri::command]
pub fn get_users(state: AppState<'_>) -> Vec<User> {
    let state = state.data.lock().unwrap();
    let mut stmt = state
        .connection
        .prepare("SELECT id, username, color, created_at FROM user")
        .expect("Error preparing statement");
    let user_iter = stmt
        .query_map([], |row| {
            Ok(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                color: Some(row.get(2)?),
                created_at: Some(row.get(3)?),
            })
        })
        .expect("Error querying users");
    let mut users: Vec<User> = Vec::new();
    for user in user_iter {
        users.push(user.unwrap());
    }
    users
}

#[tauri::command]
pub fn delete_user(id: i32, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    state
        .connection
        .execute("DELETE FROM user WHERE id = ?1", &[&id])
        .expect("Error deleting user");
    "success.".to_string()
}

#[tauri::command]
pub fn create_card(card: Card, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    let file_uri = state.user_config.upload_dir.join(&card.file_uri);
    state
        .connection
        .execute(
            "INSERT INTO card (file_id, file_uri, receipt_date, due_date, assignee, status, received_file_uri) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            &[
                &card.file_id,
                &card.file_uri,
                &card.receipt_date,
                &card.due_date,
                &card.assignee,
                &card.status.to_string(),
                "",
            ],
        )
        .expect("Error inserting card");
    "success.".to_string()
}

#[tauri::command]
pub fn get_cards(status: Status, state: AppState<'_>) -> Vec<Card> {
    let state = state.data.lock().unwrap();
    let mut stmt = state
        .connection
        .prepare("SELECT id, file_id, file_uri, receipt_date, due_date, assignee, status, received_file_uri, created_at FROM card WHERE status = ?1 ORDER BY created_at DESC")
        .expect("Error preparing statement");
    let card_iter = stmt
        .query_map([status.to_string()], |row| {
            Ok(Card {
                id: Some(row.get(0)?),
                file_id: row.get(1)?,
                file_uri: row.get(2)?,
                receipt_date: row.get(3)?,
                due_date: row.get(4)?,
                assignee: row.get(5)?,
                status: Status::from_str(&row.get(6)?),
                received_file_uri: row.get(7)?,
                created_at: Some(row.get(8)?),
            })
        })
        .expect("Error querying cards");
    let mut cards: Vec<Card> = Vec::new();
    for card in card_iter {
        cards.push(card.unwrap());
    }
    cards
}

#[tauri::command]
pub fn get_card(id: i32, state: AppState<'_>) -> Card {
    let state = state.data.lock().unwrap();
    let mut stmt = state
        .connection
        .prepare("SELECT id, file_id, file_uri, receipt_date, due_date, assignee, status, received_file_uri, created_at FROM card WHERE id = ?1")
        .expect("Error preparing statement");
    let card_iter = stmt
        .query_map([id], |row| {
            Ok(Card {
                id: Some(row.get(0)?),
                file_id: row.get(1)?,
                file_uri: row.get(2)?,
                receipt_date: row.get(3)?,
                due_date: row.get(4)?,
                assignee: row.get(5)?,
                status: Status::from_str(&row.get(6)?),
                received_file_uri: row.get(7)?,
                created_at: Some(row.get(8)?),
            })
        })
        .expect("Error querying cards");
    let mut cards: Vec<Card> = Vec::new();
    for card in card_iter {
        cards.push(card.unwrap());
    }
    cards[0].clone()
}

#[tauri::command]
pub fn delete_card(id: i32, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    state
        .connection
        .execute("DELETE FROM card WHERE id = ?1", &[&id])
        .expect("Error deleting card");
    "success.".to_string()
}

#[tauri::command]
pub fn update_card_status(id: i32, status: Status, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    state
        .connection
        .execute(
            "UPDATE card SET status = ?1 WHERE id = ?2",
            &[&status.to_string(), &id.to_string()],
        )
        .expect("Error updating card status");
    "success.".to_string()
}

#[tauri::command]
pub fn update_card(id: i32, card: Card, state: AppState<'_>) -> String {
    let state = state.data.lock().unwrap();
    state
        .connection
        .execute(
            "UPDATE card SET file_id = ?1, file_uri = ?2, receipt_date = ?3, due_date = ?4, assignee = ?5, status = ?6, received_file_uri = ?7 WHERE id = ?8",
            &[
                &card.file_id,
                &card.file_uri,
                &card.receipt_date,
                &card.due_date,
                &card.assignee,
                &card.status.to_string(),
                &card.received_file_uri.unwrap_or("".to_string()),
                &id.to_string(),
            ],
        )
        .expect("Error updating card");
    "success.".to_string()
}
