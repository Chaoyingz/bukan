use crate::{
    models::{
        card::Card, column::Column, label::Label, project::Project,
        project_custom_property::ProjectCustomProperty, user::User,
    },
    state::AppState,
};

#[tauri::command]
pub async fn create_project(state: AppState<'_>, name: String) -> Result<Project, String> {
    let state = state.data.lock().await;
    match Project::create_by_name(&state.db, &name).await {
        Ok(project) => match Column::create_default_column(&state.db, &project.id).await {
            Ok(_) => {
                let mut project_dir = state.config.archived_document_directory.clone();
                project_dir.push(&project.name);
                std::fs::create_dir_all(&project_dir).expect("Error creating project directory");
                Ok(project)
            }
            Err(e) => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn get_project(state: AppState<'_>, project_id: i32) -> Result<Project, String> {
    let state = state.data.lock().await;
    match Project::get(&state.db, &project_id).await {
        Ok(project) => Ok(project),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn get_all_projects(state: AppState<'_>) -> Result<Vec<Project>, String> {
    let state = state.data.lock().await;
    match Project::all(&state.db).await {
        Ok(projects) => Ok(projects),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn delete_project(state: AppState<'_>, project_id: i32) -> Result<(), String> {
    let state = state.data.lock().await;
    let project = Project::get(&state.db, &project_id).await.unwrap();
    match Column::delete_by_project_id(&state.db, &project_id).await {
        Ok(_) => match Card::delete_by_project_id(&state.db, &project_id).await {
            Ok(_) => match Project::delete(&state.db, &project_id).await {
                Ok(_) => {
                    let mut project_dir = state.config.archived_document_directory.clone();
                    project_dir.push(&project.name);
                    if project_dir.exists() {
                        std::fs::remove_dir_all(&project_dir)
                            .expect("Error deleting project directory");
                    }
                    Ok(())
                }
                Err(err) => Err(err.to_string()),
            },
            Err(err) => Err(err.to_string()),
        },
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn update_project_name(
    state: AppState<'_>,
    project_id: i32,
    name: String,
) -> Result<(), String> {
    let state = state.data.lock().await;
    let project = Project::get(&state.db, &project_id).await.unwrap();
    match Project::update_name(&state.db, &project_id, &name).await {
        Ok(_) => {
            let mut project_dir = state.config.archived_document_directory.clone();
            project_dir.push(&project.name);
            if !project_dir.exists() {
                std::fs::create_dir_all(&project_dir).expect("Error creating project directory");
            }
            let mut new_project_dir = state.config.archived_document_directory.clone();
            new_project_dir.push(&name);
            println!("Renaming {:?} to {:?}", &project_dir, &new_project_dir);
            std::fs::rename(&project_dir, &new_project_dir)
                .expect("Error renaming project directory");
            Ok(())
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn get_all_columns(state: AppState<'_>, project_id: i32) -> Result<Vec<Column>, String> {
    let state = state.data.lock().await;
    match Column::all(&state.db, &project_id).await {
        Ok(columns) => Ok(columns),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn create_card_by_name(
    state: AppState<'_>,
    name: String,
    project_id: i32,
    column_id: i32,
) -> Result<(), String> {
    let state = state.data.lock().await;
    match Card::create_by_name(&state.db, &name, &project_id, &column_id).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn create_card(
    state: AppState<'_>,
    name: String,
    description: Option<String>,
    project_id: i32,
    column_id: i32,
    dispatch_file: Option<String>,
    received_files: Option<String>,
    assignee_ids: Option<String>,
    label_ids: Option<String>,
    due_date: Option<String>,
) -> Result<(), String> {
    let state = state.data.lock().await;
    let label_names: Option<String> = match label_ids {
        Some(ref label_ids) => {
            let label_ids: Vec<i32> = label_ids
                .split(",")
                .map(|s| s.parse::<i32>().unwrap())
                .collect();
            let labels = Label::get_by_ids(&state.db, &label_ids).await.unwrap();
            let label_names: Vec<String> = labels.iter().map(|label| label.name.clone()).collect();
            Some(label_names.join(","))
        }
        None => None,
    };
    let assignee_names = match assignee_ids {
        Some(ref assignee_ids) => {
            let assignee_ids: Vec<i32> = assignee_ids
                .split(",")
                .map(|s| s.parse::<i32>().unwrap())
                .collect();
            let users = User::get_by_ids(&state.db, &assignee_ids).await.unwrap();
            let user_names: Vec<String> = users.iter().map(|user| user.name.clone()).collect();
            Some(user_names.join(","))
        }
        None => None,
    };
    match Card::create(
        &state.db,
        &name,
        &description,
        &project_id,
        &column_id,
        &dispatch_file,
        &received_files,
        &label_ids,
        &assignee_ids,
        &label_names,
        &assignee_names,
        &due_date,
    )
    .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn update_card(
    state: AppState<'_>,
    card_id: i32,
    name: String,
    description: Option<String>,
    column_id: i32,
    dispatch_file: Option<String>,
    received_files: Option<String>,
    label_ids: Option<String>,
    assignee_ids: Option<String>,
    due_date: Option<String>,
) -> Result<(), String> {
    let state = state.data.lock().await;
    let old_card = Card::get(&state.db, &card_id).await.unwrap();
    let label_names: Option<String> = match label_ids {
        Some(ref label_ids) => {
            let label_ids: Vec<i32> = label_ids
                .split(",")
                .map(|s| s.parse::<i32>().unwrap())
                .collect();
            let labels = Label::get_by_ids(&state.db, &label_ids).await.unwrap();
            let label_names: Vec<String> = labels.iter().map(|label| label.name.clone()).collect();
            Some(label_names.join(","))
        }
        None => None,
    };
    let assignee_names = match assignee_ids {
        Some(ref assignee_ids) => {
            let assignee_ids: Vec<i32> = assignee_ids
                .split(",")
                .map(|s| s.parse::<i32>().unwrap())
                .collect();
            let users = User::get_by_ids(&state.db, &assignee_ids).await.unwrap();
            let user_names: Vec<String> = users.iter().map(|user| user.name.clone()).collect();
            Some(user_names.join(","))
        }
        None => None,
    };
    match Card::update(
        &state.db,
        &card_id,
        &name,
        &description,
        &column_id,
        &dispatch_file,
        &received_files,
        &label_ids,
        &assignee_ids,
        &label_names,
        &assignee_names,
        &due_date,
    )
    .await
    {
        Ok(_) => {
            if old_card.column_id != column_id {
                if let Err(err) = Card::update_column_id(&state.db, &card_id, &column_id).await {
                    return Err(err.to_string());
                }
                let old_column = Column::get(&state.db, &old_card.column_id).await.unwrap();
                let new_column = Column::get(&state.db, &column_id).await.unwrap();
                let mut old_column_card_ids = old_column.card_ids.split(",").collect::<Vec<&str>>();
                let mut new_column_card_ids = new_column.card_ids.split(",").collect::<Vec<&str>>();
                let old_card_id = old_card.id.to_string();
                old_column_card_ids.retain(|&x| x != &old_card_id);
                new_column_card_ids.push(&old_card_id);
                let old_column_card_ids = old_column_card_ids.join(",");
                let new_column_card_ids = new_column_card_ids.join(",");
                if let Err(err) =
                    Column::update_card_ids(&state.db, &old_column.id, &old_column_card_ids).await
                {
                    return Err(err.to_string());
                }
                if let Err(err) =
                    Column::update_card_ids(&state.db, &new_column.id, &new_column_card_ids).await
                {
                    return Err(err.to_string());
                }
            };
            Ok(())
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn filter_cards(
    state: AppState<'_>,
    project_id: i32,
    keyword: Option<String>,
) -> Result<Vec<Card>, String> {
    let state = state.data.lock().await;
    match Card::filter(&state.db, &project_id, &keyword).await {
        Ok(cards) => Ok(cards),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn update_card_ids(
    state: AppState<'_>,
    column_id: i32,
    card_ids: String,
) -> Result<(), String> {
    let state = state.data.lock().await;
    match Column::update_card_ids(&state.db, &column_id, &card_ids).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn get_card(state: AppState<'_>, card_id: i32) -> Result<Card, String> {
    let state = state.data.lock().await;
    match Card::get(&state.db, &card_id).await {
        Ok(card) => Ok(card),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn update_card_column_id(
    state: AppState<'_>,
    card_id: i32,
    column_id: i32,
) -> Result<(), String> {
    let state = state.data.lock().await;
    match Card::update_column_id(&state.db, &card_id, &column_id).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn delete_card(state: AppState<'_>, card_id: i32) -> Result<(), String> {
    let state = state.data.lock().await;
    let card = Card::get(&state.db, &card_id).await.unwrap();
    match Card::delete(&state.db, &card_id).await {
        Ok(_) => {
            let column = Column::get(&state.db, &card.column_id).await.unwrap();
            let mut column_card_ids = column.card_ids.split(",").collect::<Vec<&str>>();
            let card_id_str = card.id.to_string();
            column_card_ids.retain(|&x| x != &card_id_str);
            let column_card_ids = column_card_ids.join(",");
            if let Err(err) = Column::update_card_ids(&state.db, &column.id, &column_card_ids).await
            {
                return Err(err.to_string());
            }
            Ok(())
        }
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn create_user(state: AppState<'_>, name: String, color: String) -> Result<User, String> {
    let state = state.data.lock().await;
    match User::create(&state.db, &name, &color).await {
        Ok(user) => Ok(user),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn get_all_users(state: AppState<'_>) -> Result<Vec<User>, String> {
    let state = state.data.lock().await;
    match User::all(&state.db).await {
        Ok(users) => Ok(users),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn create_label(
    state: AppState<'_>,
    name: String,
    color: String,
) -> Result<Label, String> {
    let state = state.data.lock().await;
    match Label::create(&state.db, &name, &color).await {
        Ok(label) => Ok(label),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn get_all_labels(state: AppState<'_>) -> Result<Vec<Label>, String> {
    let state = state.data.lock().await;
    match Label::all(&state.db).await {
        Ok(labels) => Ok(labels),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn create_project_custom_property(
    state: AppState<'_>,
    project_id: i32,
    name: String,
    property_type: String,
    is_multiple: bool,
) -> Result<ProjectCustomProperty, String> {
    let state = state.data.lock().await;
    match ProjectCustomProperty::create(&state.db, &project_id, &name, &property_type, &is_multiple)
        .await
    {
        Ok(project_custom_property) => Ok(project_custom_property),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn delete_label(state: AppState<'_>, label_id: i32) -> Result<(), String> {
    let state = state.data.lock().await;
    match Label::delete(&state.db, &label_id).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn delete_user(state: AppState<'_>, user_id: i32) -> Result<(), String> {
    let state = state.data.lock().await;
    match User::delete(&state.db, &user_id).await {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
