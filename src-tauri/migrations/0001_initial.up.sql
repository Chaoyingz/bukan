CREATE TABLE project (
  id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name  TEXT NOT NULL,
  column_ids INTEGER[] NOT NULL
);

CREATE TABLE column (
  id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR NOT NULL,
  project_id INTEGER NOT NULL,
  card_ids VARCHAR NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project (id)
);

CREATE TABLE user (
  id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR NOT NULL UNIQUE,
  color VARCHAR NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE label (
  id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR NOT NULL UNIQUE,
  color VARCHAR NOT NULL
);

CREATE TABLE card (
  id    INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR NOT NULL,
  project_id INTEGER NOT NULL,
  column_id INTEGER NOT NULL,
  description TEXT,
  due_date DATETIME,
  dispatch_file VARCHAR,
  received_files VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  label_ids VARCHAR,
  assignee_ids VARCHAR,
  label_names VARCHAR,
  assignee_names VARCHAR,
  FOREIGN KEY (project_id) REFERENCES project (id),
  FOREIGN KEY (column_id) REFERENCES column (id)
);

CREATE TABLE card_label (
  card_id INTEGER NOT NULL,
  label_id INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES card (id),
  FOREIGN KEY (label_id) REFERENCES label (id)
);

CREATE TABLE card_user (
  card_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES card (id),
  FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE project_custom_property (
  project_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  property_type VARCHAR NOT NULL,
  is_multiple BOOLEAN NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project (id)
);

CREATE TABLE card_custom_property (
  card_id INTEGER NOT NULL,
  project_custom_property_id INTEGER NOT NULL,
  value VARCHAR NOT NULL,
  FOREIGN KEY (card_id) REFERENCES card (id),
  FOREIGN KEY (project_custom_property_id) REFERENCES project_custom_property (id)
);
