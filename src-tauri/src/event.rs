use crate::state::ArcState;

pub fn startup_event(state: &ArcState) {
    let mut state = state.data.lock().unwrap();
    if state.user_config.is_first_run {
        state.user_config.is_first_run = false;
        state.user_config.save(&state.settings.config_url);

        state
            .connection
            .execute(
                "CREATE TABLE card (
                id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                file_id VARCHAR NOT NULL,
                file_uri VARCHAR NOT NULL,
                receipt_date VARCHAR NOT NULL,
                due_date VARCHAR NOT NULL,
                assignee VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                received_file_uri TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
                (), // empty list of parameters.
            )
            .expect("Error creating table card");

        state
            .connection
            .execute(
                "CREATE TABLE user (
                id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                username VARCHAR NOT NULL,
                color VARCHAR NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
                (), // empty list of parameters.
            )
            .expect("Error creating table user");
    }
}
