#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
mod db;
mod events;
mod models;
mod state;
mod storage;

use state::ArcState;

#[tokio::main]
async fn main() {
    let ctx = tauri::generate_context!();
    let state = ArcState::new(&ctx.config()).await;
    events::startup_event(&state).await;
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            config::get_config,
            config::set_actived_project_id,
            config::set_archived_document_directory,
            storage::create_project,
            storage::get_project,
            storage::get_all_projects,
            storage::delete_project,
            storage::update_project_name,
            storage::get_all_columns,
            storage::create_card_by_name,
            storage::create_card,
            storage::filter_cards,
            storage::get_card,
            storage::update_card_ids,
            storage::update_card_column_id,
            storage::update_card,
            storage::delete_card,
            storage::create_user,
            storage::get_all_users,
            storage::create_label,
            storage::get_all_labels,
            storage::create_project_custom_property,
            storage::delete_label,
            storage::delete_user,
            storage::archived_document_by_month,
        ])
        .manage(state)
        .run(ctx)
        .expect("error while running tauri application");
}
