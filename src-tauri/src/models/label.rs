use serde_derive::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Label {
    pub id: i32,
    pub name: String,
    pub color: String,
}

impl Label {
    pub async fn create(pool: &SqlitePool, name: &str, color: &str) -> Result<Label, sqlx::Error> {
        let insert_result = sqlx::query("INSERT INTO label (name, color) VALUES (?1, ?2)")
            .bind(name)
            .bind(color)
            .execute(pool)
            .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        let label = Label {
            id: inserted_id,
            name: name.to_string(),
            color: color.to_string(),
        };
        Ok(label)
    }
    pub async fn get_by_ids(pool: &SqlitePool, ids: &Vec<i32>) -> Result<Vec<Self>, sqlx::Error> {
        let mut labels = Vec::new();
        for id in ids {
            let label = sqlx::query_as("SELECT * FROM label WHERE id = ?1")
                .bind(id)
                .fetch_one(pool)
                .await?;
            labels.push(label);
        }
        Ok(labels)
    }
    pub async fn all(pool: &SqlitePool) -> Result<Vec<Self>, sqlx::Error> {
        let labels = sqlx::query_as("SELECT * FROM label")
            .fetch_all(pool)
            .await?;
        Ok(labels)
    }

    pub async fn delete(pool: &SqlitePool, id: &i32) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM label WHERE id = ?1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
