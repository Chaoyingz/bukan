use crate::models::column::Column;
use crate::models::project::{Project, DEFAULT_PROJECT_ID};
use sqlx::SqlitePool;

pub async fn init_tables(pool: &SqlitePool) {
    Project::create_default_project(pool)
        .await
        .expect("Error creating default project");
    Column::create_default_column(pool, &DEFAULT_PROJECT_ID)
        .await
        .expect("Error creating default column");
}
