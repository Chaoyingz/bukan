use crate::{
    db::{event, migration},
    state::ArcState,
};

pub async fn startup_event(state: &ArcState) {
    let mut state = state.data.lock().await;
    migration::migrate(&state.db).await;
    if state.config.is_first_run {
        state.config.is_first_run = false;
        state.config.save(&state.settings.config_url);
        event::init_tables(&state.db).await;
    }
}
