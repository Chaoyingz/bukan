#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod connection;
mod event;
mod models;
mod state;
mod storage;

use state::ArcState;

fn main() {
    let ctx = tauri::generate_context!();
    let state = ArcState::new(&ctx.config());
    event::startup_event(&state);
    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            storage::create_user,
            storage::get_users,
            storage::delete_user,
            storage::create_card,
            storage::get_cards,
            storage::get_card,
            storage::delete_card,
            storage::update_card_status,
            storage::update_card,
        ])
        .run(ctx)
        .expect("error while running tauri application");
}
