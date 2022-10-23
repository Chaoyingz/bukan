use rusqlite::Connection;
use rusqlite::OpenFlags;
use std::path::PathBuf;

pub fn establish_connection(database_url: &PathBuf) -> Connection {
    let db_open_flags = OpenFlags::SQLITE_OPEN_CREATE | OpenFlags::SQLITE_OPEN_READ_WRITE;
    Connection::open_with_flags(database_url, db_open_flags).expect("Error connecting to database")
}
