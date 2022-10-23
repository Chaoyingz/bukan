use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Status {
    TODO,
    DOING,
    DONE,
}

impl Status {
    pub fn from_str(s: &String) -> Self {
        match s.as_str() {
            "TODO" => Status::TODO,
            "DOING" => Status::DOING,
            "DONE" => Status::DONE,
            _ => Status::TODO,
        }
    }
    pub fn to_string(&self) -> String {
        match self {
            Status::TODO => "TODO".to_string(),
            Status::DOING => "DOING".to_string(),
            Status::DONE => "DONE".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Card {
    pub id: Option<i32>,
    pub file_id: String,
    pub file_uri: String,
    pub receipt_date: String,
    pub due_date: String,
    pub assignee: String,
    pub status: Status,
    pub received_file_uri: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id: Option<i32>,
    pub username: String,
    pub color: Option<String>,
    pub created_at: Option<String>,
}
