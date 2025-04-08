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
        Migration {
            version: 4,
            description: "Add report_prompt field to settings table",
            sql: "ALTER TABLE settings ADD COLUMN report_prompt TEXT;
                 UPDATE settings SET report_prompt = '你是一位技术周报编辑专家，擅长将开发者的Git提交记录转化为结构化、专业的工作周报。' WHERE report_prompt IS NULL;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "Add user_prompt field to settings table",
            sql: "ALTER TABLE settings ADD COLUMN user_prompt TEXT;
                 UPDATE settings SET user_prompt = '请基于以下Git提交记录，生成一份专业的技术周报：
1. 按项目分类整理内容
2. 合并相似的提交内容
3. 使用技术术语准确描述工作内容
4. 突出重要的功能开发和问题修复
5. 保持简洁专业的语言风格' WHERE user_prompt IS NULL;",
            kind: MigrationKind::Up,
        },
    ]
}

pub fn init_sql_plugin(builder: tauri_plugin_sql::Builder) -> tauri_plugin_sql::Builder {
    builder.add_migrations("sqlite:database.db", get_migrations())
}
