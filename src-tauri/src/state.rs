use crate::config::Config;
use crate::db::connection;
use sqlx::SqlitePool;
use std::env;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::Config as TauriConfig;
use tauri::State as TauriState;
use tokio::sync::Mutex;

#[derive(Debug)]
pub struct Settings {
    pub app_dir: PathBuf,
    pub database_url: String,
    pub config_url: PathBuf,
}

impl Settings {
    fn new(config: &TauriConfig) -> Self {
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
            database_url: database_url.to_str().unwrap().to_string(),
            config_url: app_dir.join("config.toml"),
        }
    }
}

pub struct StateData {
    pub db: SqlitePool,
    pub config: Config,
    pub settings: Settings,
}

pub struct ArcState {
    pub data: Arc<Mutex<StateData>>,
}

impl ArcState {
    pub async fn new(config: &TauriConfig) -> ArcState {
        let settings = Settings::new(config);
        let db = connection::establish_connection(&settings.database_url).await;
        Self {
            data: Arc::new(Mutex::new(StateData {
                db,
                config: Config::load(&settings),
                settings,
            })),
        }
    }
}

pub type AppState<'a> = TauriState<'a, ArcState>;
