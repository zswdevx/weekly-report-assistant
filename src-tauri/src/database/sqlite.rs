use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Create weekly reports table",
            sql: "CREATE TABLE IF NOT EXISTS weekly_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "Create project config table",
            sql: "CREATE TABLE IF NOT EXISTS project_configs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sort INTEGER,
                    name TEXT NOT NULL UNIQUE,
                    path TEXT NOT NULL,
                    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    branches TEXT
                );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "Create settings table",
            sql: "CREATE TABLE IF NOT EXISTS settings (
                    authors TEXT,
                    api_key TEXT
                );
                INSERT OR IGNORE INTO settings DEFAULT VALUES;",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn init_sql_plugin(builder: tauri_plugin_sql::Builder) -> tauri_plugin_sql::Builder {
    builder.add_migrations("sqlite:database.db", get_migrations())
}
