use serde_derive::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};

use super::column::Column;

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct Card {
    pub id: i32,
    pub name: String,
    pub project_id: i32,
    pub column_id: i32,
    pub description: Option<String>,
    pub dispatch_file: Option<String>,
    pub received_files: Option<String>,
    pub label_ids: Option<String>,
    pub assignee_ids: Option<String>,
    pub label_names: Option<String>,
    pub assignee_names: Option<String>,
    pub dispatch_date: Option<String>,
    pub due_date: Option<String>,
    pub created_at: String,
}

impl Card {
    pub async fn create_by_name(
        pool: &SqlitePool,
        name: &str,
        project_id: &i32,
        column_id: &i32,
    ) -> Result<(), sqlx::Error> {
        let insert_result =
            sqlx::query("INSERT INTO card (name, project_id, column_id) VALUES (?1, ?2, ?3)")
                .bind(name)
                .bind(project_id)
                .bind(column_id)
                .execute(pool)
                .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        Column::push_card_id(pool, column_id, &inserted_id).await?;
        Ok(())
    }

    pub async fn create(
        pool: &SqlitePool,
        name: &str,
        description: &Option<String>,
        project_id: &i32,
        column_id: &i32,
        dispatch_file: &Option<String>,
        received_files: &Option<String>,
        label_ids: &Option<String>,
        assignee_ids: &Option<String>,
        label_names: &Option<String>,
        assignee_names: &Option<String>,
        dispatch_date: &Option<String>,
        due_date: &Option<String>,
    ) -> Result<(), sqlx::Error> {
        let insert_result = sqlx::query("INSERT INTO card (name, description, project_id, column_id, dispatch_file, received_files, label_ids, assignee_ids, label_names, assignee_names, dispatch_date, due_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)")
            .bind(name)
            .bind(description)
            .bind(project_id)
            .bind(column_id)
            .bind(dispatch_file)
            .bind(received_files)
            .bind(label_ids)
            .bind(assignee_ids)
            .bind(label_names)
            .bind(assignee_names)
            .bind(dispatch_date)
            .bind(due_date)
            .execute(pool)
            .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        Column::push_card_id(pool, column_id, &inserted_id).await?;
        Ok(())
    }

    pub async fn filter(
        pool: &SqlitePool,
        project_id: &i32,
        keyword: &Option<String>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let mut query = "SELECT * FROM card WHERE project_id = $1".to_string();
        let cards: Vec<Card>;
        if let Some(keyword) = keyword {
            query += format!(
                " AND (name LIKE '%{}%' OR description LIKE '%{}%' OR dispatch_file LIKE '%{}%' OR received_files LIKE '%{}%' OR label_names LIKE '%{}%' OR assignee_names LIKE '%{}%' OR due_date LIKE '%{}%')",
                keyword, keyword, keyword, keyword, keyword, keyword, keyword
            )
            .as_str();
            cards = sqlx::query_as(&query)
                .bind(project_id)
                .fetch_all(pool)
                .await?;
        } else {
            cards = sqlx::query_as(&query)
                .bind(project_id)
                .fetch_all(pool)
                .await?;
        }
        Ok(cards)
    }

    pub async fn delete_by_project_id(
        pool: &SqlitePool,
        project_id: &i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM card WHERE project_id = ?1")
            .bind(project_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn get(pool: &SqlitePool, card_id: &i32) -> Result<Self, sqlx::Error> {
        let card = sqlx::query_as("SELECT * FROM card WHERE id = ?1")
            .bind(card_id)
            .fetch_one(pool)
            .await?;
        Ok(card)
    }

    pub async fn update(
        pool: &SqlitePool,
        card_id: &i32,
        name: &str,
        description: &Option<String>,
        column_id: &i32,
        dispatch_file: &Option<String>,
        received_files: &Option<String>,
        label_ids: &Option<String>,
        assignee_ids: &Option<String>,
        label_names: &Option<String>,
        assignee_names: &Option<String>,
        dispatch_date: &Option<String>,
        due_date: &Option<String>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE card SET name = ?1, description = ?2, column_id = ?3, dispatch_file = ?4, received_files = ?5, label_ids = ?6, assignee_ids = ?7, label_names = ?8, assignee_names = ?9, dispatch_date = ?10, due_date = ?11 WHERE id = ?12")
            .bind(name)
            .bind(description)
            .bind(column_id)
            .bind(dispatch_file)
            .bind(received_files)
            .bind(label_ids)
            .bind(assignee_ids)
            .bind(label_names)
            .bind(assignee_names)
            .bind(dispatch_date)
            .bind(due_date)
            .bind(card_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn update_column_id(
        pool: &SqlitePool,
        card_id: &i32,
        column_id: &i32,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE card SET column_id = ?1 WHERE id = ?2")
            .bind(column_id)
            .bind(card_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn delete(pool: &SqlitePool, card_id: &i32) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM card WHERE id = ?1")
            .bind(card_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn all(pool: &SqlitePool) -> Result<Vec<Self>, sqlx::Error> {
        let cards = sqlx::query_as("SELECT * FROM card").fetch_all(pool).await?;
        Ok(cards)
    }
}
