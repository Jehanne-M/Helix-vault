use chrono::Local;
use std::{
    fs, io,
    path::PathBuf,
    process::{Command, Output},
    vec,
};

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct SyncPaths {
    pub source: String,
    pub destination: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Settings {
    pub sync_pair: Vec<SyncPaths>,
    pub user_name: String,
    pub destination_root_address: String,
    pub process_time: String,
}
impl Settings {
    pub fn load(config_path: &PathBuf) -> Result<Self, io::Error> {
        if !config_path.exists() {
            let default_settings =
                Settings::default_settings().expect("Failed to create default settings");
            let serialized = serde_json::to_string(&default_settings).unwrap();
            fs::write(config_path, serialized)?;
            return Ok(default_settings);
        }
        // deserialize the JSON string to a struct
        let setting_data = fs::read_to_string(config_path).expect("Unable to read settings file");
        let config: Settings = serde_json::from_str(&setting_data)?;
        Ok(config)
    }
    pub fn save(&self, config_path: &PathBuf) -> Result<(), io::Error> {
        // serialize the struct to a JSON string
        let contents = serde_json::to_string(self).unwrap();
        fs::write(config_path, contents)?;
        Ok(())
    }

    fn default_settings() -> anyhow::Result<Self> {
        // get user name from the system
        let output: Output = Command::new("whoami")
            .output()
            .expect("Failed to execute command");
        let user_name: String = if !output.stdout.is_empty() && cfg!(target_os = "windows") {
            String::from_utf8(output.stdout.clone())?
                .split("\\")
                .collect::<Vec<&str>>()[1]
                .trim()
                .to_string()
        } else if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            String::from_utf8(output.stdout).unwrap().trim().to_string()
        } else {
            "Unknown".to_string()
        };

        // Set default sync paths based on the OS
        let mut sync_default_paths: Vec<SyncPaths> = vec![];
        if cfg!(target_os = "windows") {
            sync_default_paths = vec![SyncPaths {
                source: format!("C:\\Users\\{}\\OneDrive\\デスクトップ\\source", user_name),
                destination: format!("C:\\Users\\{}\\OneDrive\\デスクトップ\\backup", user_name),
            }];
        } else if cfg!(target_os = "linux") || cfg!(target_os = "macos") {
            sync_default_paths = vec![SyncPaths {
                source: format!("/home/{}", user_name),
                destination: format!("/mnt/home/{}", user_name),
            }];
        } else {
            return Err(anyhow::anyhow!("Unsupported OS"));
        }
        let default_settings = Settings {
            sync_pair: sync_default_paths,
            user_name: user_name.to_string(),
            destination_root_address: if cfg!(target_os = "windows") {
                format!("C:\\Users\\{}\\OneDrive\\ドキュメント", user_name)
            } else {
                format!("/home/{}", user_name)
            },
            process_time: Local::now().format("%H:%M:%S").to_string(),
        };
        Ok(default_settings)
    }
}

// impl Default for Settings {
//     fn default() -> Self {
//         let source_dir = std::env::current_dir()
//             .expect("Failed to get current directory")
//             .to_str()
//             .expect("Failed to convert path to string")
//             .to_string();
//         let destination_dir = std::env::current_dir()
//             .expect("Failed to get current directory")
//             .to_str()
//             .expect("Failed to convert path to string")
//             .to_string();
//         let user_name = std::env::var("USER").unwrap_or_else(|_| "Unknown".to_string());
//         Settings {
//             source_dir,
//             destination_dir,
//             user_name,
//         }
//     }
// }
