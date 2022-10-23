use crate::connection;
use serde_derive::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::Config;
use tauri::State as TauriState;

#[derive(Debug)]
pub struct Settings {
    pub app_dir: PathBuf,
    pub database_url: PathBuf,
    pub config_url: PathBuf,
}

impl Settings {
    fn new(config: &Config) -> Self {
        let app_dir = match env::var("DEVELOPMENT").is_ok() {
            true => env::current_dir().unwrap().join("app_data"),
            false => tauri::api::path::app_dir(config).unwrap(),
        };
        if !app_dir.exists() {
            std::fs::create_dir_all(&app_dir).expect("Error creating app directory");
        }
        let database_url = app_dir.join("bukan.sqlite");
        Self {
            app_dir: app_dir.clone(),
            database_url: database_url,
            config_url: app_dir.join("config.toml"),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct UserConfig {
    pub is_first_run: bool,
    pub upload_dir: PathBuf,
}

impl UserConfig {
    fn default_config() -> Self {
        Self {
            is_first_run: true,
            upload_dir: dirs::desktop_dir().unwrap(),
        }
    }
    pub fn load(config_url: &PathBuf) -> Self {
        if config_url.exists() {
            let config_str = std::fs::read_to_string(config_url).unwrap();
            toml::from_str(&config_str).unwrap()
        } else {
            let config = Self::default_config();
            let config_str = toml::to_string(&config).unwrap();
            std::fs::write(config_url, config_str).unwrap();
            config
        }
    }
    pub fn save(&self, config_url: &PathBuf) {
        let config_str = toml::to_string(&self).unwrap();
        println!("Saving config: {}", config_str);
        std::fs::write(config_url, config_str).unwrap();
    }
}

pub struct StateData {
    pub connection: rusqlite::Connection,
    pub user_config: UserConfig,
    pub settings: Settings,
}

pub struct ArcState {
    pub data: Arc<Mutex<StateData>>,
}

impl ArcState {
    pub fn new(config: &Config) -> ArcState {
        let settings = Settings::new(config);
        let connection = connection::establish_connection(&settings.database_url);
        let data = Arc::new(Mutex::new(StateData {
            connection: connection,
            user_config: UserConfig::load(&settings.config_url),
            settings: settings,
        }));
        ArcState { data }
    }
}

pub type AppState<'a> = TauriState<'a, ArcState>;
