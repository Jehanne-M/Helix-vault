pub mod backup;
pub mod google_auth;
pub mod restore;
pub mod settings;
pub mod tray;

use settings::Settings;
use std::env;
// use google_auth::handle_connection;
// use tokio::net::{TcpListener, TcpStream};
// use std::net::TcpListener;
// use std::process::Command;
// use tauri::State;
// use url::Url;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn load_config() -> Result<Settings, String> {
    let mut temp_dir = std::env::temp_dir();
    let app_name = env!("CARGO_PKG_NAME");
    temp_dir = temp_dir.join(std::path::PathBuf::from(app_name));
    if !temp_dir.exists() {
        std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");
    }
    let config_path = temp_dir.join("config.json");

    Settings::load(&config_path).map_err(|e| format!("Failed to load settings: {}", e))
}

#[tauri::command]
pub fn save_config(settings: Settings) -> Result<(), String> {
    let mut temp_dir = std::env::temp_dir();
    let app_name = env!("CARGO_PKG_NAME");
    temp_dir = temp_dir.join(std::path::PathBuf::from(app_name));
    if !temp_dir.exists() {
        std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");
    }
    let config_path = temp_dir.join("config.json");
    settings
        .save(&config_path)
        .map_err(|e| format!("Failed to save settings: {}", e))
}
#[tauri::command]
pub fn backup() -> Result<(), String> {
    let mut temp_dir = std::env::temp_dir();
    let app_name = env!("CARGO_PKG_NAME");
    temp_dir = temp_dir.join(std::path::PathBuf::from(app_name));
    if !temp_dir.exists() {
        std::fs::create_dir_all(&temp_dir).expect("Failed to create temp directory");
    }
    let config_path = temp_dir.join("config.json");
    let settings = Settings::load(&config_path).unwrap();
    println!("Starting backup with settings: {:?}", settings);
    let backup = backup::Backup::new(settings.sync_pair);
    backup
        .local_net_backup()
        .map_err(|e| format!("Backup failed: {}", e))
}
// #[tauri::command]
// pub async fn google_auth() -> String {
//     let listener = TcpListener::bind("127.0.0.1:1433").unwrap();

//     for stream in listener.incoming() {
//         let stream = stream.unwrap();

//         println!("Connection estableshed: {:?}", stream.peer_addr().unwrap());

//         match handle_connection(stream).await {
//             Ok(code) => {
//                 println!("Received code: {}", code);
//                 return code;
//             }
//             Err(_) => {
//                 println!("Failed to handle connection or extract code.");
//             }
//         }
//     }

//     // TODO: codeからtokenを引き換える

//     String::from("command finished.")
// }
