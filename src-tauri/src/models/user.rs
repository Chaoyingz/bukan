use serde_derive::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

impl User {
    pub async fn create(pool: &SqlitePool, name: &str, color: &str) -> Result<User, sqlx::Error> {
        let insert_result = sqlx::query("INSERT INTO user (name, color) VALUES (?1, ?2)")
            .bind(name)
            .bind(color)
            .execute(pool)
            .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        let user = User {
            id: inserted_id,
            name: name.to_string(),
            color: color.to_string(),
            created_at: "".to_string(),
        };
        Ok(user)
    }
    pub async fn get_by_ids(pool: &SqlitePool, ids: &Vec<i32>) -> Result<Vec<Self>, sqlx::Error> {
        let mut users = Vec::new();
        for id in ids {
            let user = sqlx::query_as("SELECT * FROM user WHERE id = ?1")
                .bind(id)
                .fetch_one(pool)
                .await?;
            users.push(user);
        }
        Ok(users)
    }
    pub async fn all(pool: &SqlitePool) -> Result<Vec<Self>, sqlx::Error> {
        let users = sqlx::query_as("SELECT * FROM user").fetch_all(pool).await?;
        Ok(users)
    }
    pub async fn delete(pool: &SqlitePool, id: &i32) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM user WHERE id = ?1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
