use sqlx::SqlitePool;

pub async fn migrate(pool: &SqlitePool) {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .expect("Error migrating database");
}
