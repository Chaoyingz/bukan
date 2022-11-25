use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::SqlitePool;

pub const DEFAULT_PROJECT_ID: i32 = 1;
pub const DEFAULT_PROJECT_NAME: &str = "默认项目";

#[derive(FromRow, Deserialize, Serialize, Debug)]
pub struct Project {
    pub id: i32,
    pub name: String,
    pub column_ids: String,
}

impl Project {
    pub async fn create_default_project(pool: &SqlitePool) -> Result<(), sqlx::Error> {
        sqlx::query("INSERT INTO project (id, name, column_ids) VALUES (?1, ?2, ?3)")
            .bind(DEFAULT_PROJECT_ID)
            .bind(DEFAULT_PROJECT_NAME)
            .bind("")
            .execute(pool)
            .await?;
        Ok(())
    }
    pub async fn create_by_name(pool: &SqlitePool, name: &str) -> Result<Project, sqlx::Error> {
        let insert_result = sqlx::query("INSERT INTO project (name, column_ids) VALUES (?1, ?2)")
            .bind(name)
            .bind("")
            .execute(pool)
            .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        let project = Project {
            id: inserted_id,
            name: name.to_string(),
            column_ids: "".to_string(),
        };
        Ok(project)
    }
    pub async fn all(pool: &SqlitePool) -> Result<Vec<Self>, sqlx::Error> {
        let projects = sqlx::query_as("SELECT * FROM project")
            .fetch_all(pool)
            .await?;
        Ok(projects)
    }
    pub async fn get(pool: &SqlitePool, id: &i32) -> Result<Self, sqlx::Error> {
        let project = sqlx::query_as("SELECT * FROM project WHERE id = ?1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(project)
    }
    pub async fn delete(pool: &SqlitePool, id: &i32) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM project WHERE id = ?1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
    pub async fn update_name(pool: &SqlitePool, id: &i32, name: &str) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE project SET name = ?1 WHERE id = ?2")
            .bind(name)
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
