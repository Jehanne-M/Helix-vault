mod commands;

use commands::*;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    // Manager, WindowBuilder, WindowUrl,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // This is where you can perform any setup tasks before the app starts
            // For example, you can initialize a database connection or set up logging

            // This is where you can create the tray icon
            let quit_i = MenuItem::with_id(app, "quit", "終了", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("Quit menu item clicked");
                        app.exit(0);
                    }
                    _ => {
                        println!("Unknown menu item clicked: {:?}", event.id);
                    }
                })
                .show_menu_on_left_click(true)
                .tooltip("Reproduction")
                .build(app)?;

            Ok(())
        })
        .on_page_load(|_app, _| {
            // This is where you can perform tasks when the page loads
            // For example, you can send a message to the frontend or update the UI
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            load_config,
            backup,
            save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
