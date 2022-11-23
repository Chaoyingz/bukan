use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::SqlitePool;

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Column {
    pub id: i32,
    pub name: String,
    pub project_id: i32,
    pub card_ids: String,
}

pub struct NewColumn {
    pub name: String,
    pub project_id: i32,
    pub card_ids: String,
}

impl Column {
    pub async fn create_default_column(
        pool: &SqlitePool,
        project_id: &i32,
    ) -> Result<(), sqlx::Error> {
        let columns = vec![
            NewColumn {
                name: "To Do".to_string(),
                project_id: *project_id,
                card_ids: "".to_string(),
            },
            NewColumn {
                name: "In Progress".to_string(),
                project_id: *project_id,
                card_ids: "".to_string(),
            },
            NewColumn {
                name: "Done".to_string(),
                project_id: *project_id,
                card_ids: "".to_string(),
            },
        ];
        for column in columns {
            sqlx::query("INSERT INTO column (name, project_id, card_ids) VALUES (?1, ?2, ?3)")
                .bind(column.name)
                .bind(column.project_id)
                .bind(column.card_ids)
                .execute(pool)
                .await?;
        }
        Ok(())
    }

    pub async fn all(pool: &SqlitePool, project_id: &i32) -> Result<Vec<Self>, sqlx::Error> {
        let columns = sqlx::query_as("SELECT * FROM column WHERE project_id = ?1")
            .bind(project_id)
            .fetch_all(pool)
            .await?;
        Ok(columns)
    }

    pub async fn get(pool: &SqlitePool, id: &i32) -> Result<Self, sqlx::Error> {
        let column = sqlx::query_as("SELECT * FROM column WHERE id = ?1")
            .bind(id)
            .fetch_one(pool)
            .await?;
        Ok(column)
    }

    pub async fn push_card_id(
        pool: &SqlitePool,
        column_id: &i32,
        card_id: &i32,
    ) -> Result<(), sqlx::Error> {
        let column = Self::get(pool, column_id).await?;
        let mut card_ids = column.card_ids;
        if card_ids.is_empty() {
            card_ids = card_id.to_string();
        } else {
            card_ids = format!("{},{}", card_ids, card_id);
        }
        sqlx::query("UPDATE column SET card_ids = ?1 WHERE id = ?2")
            .bind(card_ids)
            .bind(column_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn update_card_ids(
        pool: &SqlitePool,
        column_id: &i32,
        card_ids: &String,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE column SET card_ids = ?1 WHERE id = ?2")
            .bind(card_ids)
            .bind(column_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn delete_by_project_id(
        pool: &SqlitePool,
        project_id: &i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM column WHERE project_id = ?1")
            .bind(project_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
