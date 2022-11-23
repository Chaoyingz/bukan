use std::path::PathBuf;

use crate::{
    models::project::{DEFAULT_PROJECT_ID, DEFAULT_PROJECT_NAME},
    state::{AppState, Settings},
};
use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Config {
    pub is_first_run: bool,
    pub actived_project_id: i32,
    pub archived_document_directory: PathBuf,
}

impl Config {
    fn default_config(app_dir: &PathBuf) -> Self {
        let mut archived_document_directory = app_dir.clone();
        archived_document_directory.push("Bukan Archived Documents");
        if !archived_document_directory.exists() {
            std::fs::create_dir_all(&archived_document_directory)
                .expect("Error creating archived document directory");
        }
        let mut actived_project_id = archived_document_directory.clone();
        actived_project_id.push(DEFAULT_PROJECT_NAME);
        if !actived_project_id.exists() {
            std::fs::create_dir_all(&actived_project_id)
                .expect("Error creating default project directory");
        }
        Self {
            is_first_run: true,
            actived_project_id: DEFAULT_PROJECT_ID,
            archived_document_directory: archived_document_directory,
        }
    }
    pub fn load(settings: &Settings) -> Self {
        let config_url = &settings.config_url;
        if config_url.exists() {
            let config_str = std::fs::read_to_string(config_url).unwrap();
            toml::from_str(&config_str).unwrap()
        } else {
            let config = Self::default_config(&settings.app_dir);
            let config_str = toml::to_string(&config).unwrap();
            std::fs::write(config_url, config_str).unwrap();
            config
        }
    }
    pub fn save(&self, config_url: &PathBuf) {
        let config_str = toml::to_string(&self).unwrap();
        std::fs::write(config_url, config_str).unwrap();
    }
}

#[tauri::command]
pub async fn get_config(state: AppState<'_>) -> Result<Config, ()> {
    let state = state.data.lock().await;
    let config = Config::load(&state.settings);
    Ok(config)
}

#[tauri::command]
pub async fn set_actived_project_id(
    state: AppState<'_>,
    actived_project_id: i32,
) -> Result<(), String> {
    let mut state = state.data.lock().await;
    state.config.actived_project_id = actived_project_id;
    state.config.save(&state.settings.config_url);
    Ok(())
}

#[tauri::command]
pub async fn set_archived_document_directory(
    state: AppState<'_>,
    archived_document_directory: PathBuf,
) -> Result<(), String> {
    let mut state = state.data.lock().await;
    if !archived_document_directory.exists() {
        std::fs::create_dir_all(&archived_document_directory)
            .expect("Error creating archived document directory");
    }
    state.config.archived_document_directory = archived_document_directory;
    state.config.save(&state.settings.config_url);
    Ok(())
}
