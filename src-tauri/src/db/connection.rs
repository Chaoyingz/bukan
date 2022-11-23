use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;

pub async fn establish_connection(database_url: &str) -> SqlitePool {
    let connection_options = SqliteConnectOptions::new()
        .create_if_missing(true)
        .filename(database_url);
    println!("Connecting to database: {}", database_url);
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connection_options)
        .await
        .expect("Error connecting to database");
    pool
}
