use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};

#[derive(FromRow, Serialize, Deserialize, Debug)]
pub struct ProjectCustomProperty {
    pub id: i32,
    pub project_id: i32,
    pub name: String,
    pub property_type: String,
    pub is_multiple: bool,
}

impl ProjectCustomProperty {
    pub async fn create(
        pool: &SqlitePool,
        project_id: &i32,
        name: &str,
        property_type: &str,
        is_multiple: &bool,
    ) -> Result<ProjectCustomProperty, sqlx::Error> {
        let insert_result = sqlx::query(
            "INSERT INTO project_custom_property (project_id, name, property_type, is_multiple) VALUES (?1, ?2, ?3, ?4)",
        )
        .bind(project_id)
        .bind(name)
        .bind(property_type)
        .bind(is_multiple)
        .execute(pool)
        .await?;
        let inserted_id = insert_result.last_insert_rowid() as i32;
        let project_custom_property = ProjectCustomProperty {
            id: inserted_id,
            project_id: *project_id,
            name: name.to_string(),
            property_type: property_type.to_string(),
            is_multiple: *is_multiple,
        };
        Ok(project_custom_property)
    }
    // pub async fn all(pool: &SqlitePool, project_id: i32) -> Result<Vec<Self>, sqlx::Error> {
    //     let project_custom_properties =
    //         sqlx::query_as("SELECT * FROM project_custom_property WHERE project_id = ?1")
    //             .bind(project_id)
    //             .fetch_all(pool)
    //             .await?;
    //     Ok(project_custom_properties)
    // }
}
