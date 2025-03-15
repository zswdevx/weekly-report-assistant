mod database;
use tauri::{AppHandle, Manager};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[allow(unused_variables)]
fn setup_devtools(app: &tauri::App) {
    #[cfg(debug_assertions)]
    {
        let window = app.get_webview_window("main").unwrap();
        window.open_devtools();
    }
}

fn show_window(app: &AppHandle) {
    let windows = app.webview_windows();

    let window = windows.values().next().expect("Sorry, no window found");

    if window.is_minimized().unwrap_or(false) {
        window.unminimize().expect("Can't Unminimize Window");
    }

    window.set_focus().expect("Can't Bring Window to Focus");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            setup_devtools(app);
            Ok(())
        })
        .plugin(database::init_sql_plugin(tauri_plugin_sql::Builder::default()).build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
