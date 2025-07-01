use crate::commands::settings::SyncPaths;
use log::error;
use std::fs;

pub struct Restore {
    sync_pair: Vec<SyncPaths>,
}

impl Restore {
    pub fn new(sync_pair: Vec<SyncPaths>) -> Self {
        Self { sync_pair }
    }

    fn enum_files(path: &std::path::PathBuf, destination_list: &mut Vec<String>) {
        if path.is_dir() {
            // ディレクトリの場合は再帰的に探索
            println!("enum_files start path: {}", path.display());
            match std::fs::read_dir(path) {
                Ok(entries) => {
                    for entry in entries {
                        let entry = entry.expect("Failed to read entry");
                        Self::enum_files(&entry.path(), destination_list);
                    }
                }
                Err(e) => {
                    error!("Failed to read directory {}: {}", path.display(), e);
                }
            }
        } else {
            // ファイルの場合はファイル名を表示
            destination_list.push(path.to_string_lossy().to_string());
        }
    }

    pub fn local_net_restore(&self) -> anyhow::Result<()> {
        for pair in &self.sync_pair {
            let source = std::path::PathBuf::from(&pair.source);
            let destination = std::path::PathBuf::from(&pair.destination);

            if !destination.exists() {
                error!("Source path does not exist: {}", source.display());
                continue;
            }

            // destinationのディレクトリのファイルを再帰的に取得し destination_listに格納
            let mut destination_list: Vec<String> = vec![];
            Self::enum_files(&destination, &mut destination_list);
            let destination_depth_len = destination.components().count().saturating_sub(1); // -1 to exclude the root component
            let source_depth_len = source.components().count().saturating_sub(1); // -1 to exclude the root component

            for destination_file in &destination_list {
                let destination_path = std::path::PathBuf::from(destination_file);
                let source_path = source.join(
                    destination_path
                        .components()
                        .skip(destination_depth_len + 1)
                        .collect::<std::path::PathBuf>(),
                );

                if !source_path.exists() {
                    Self::create_dir(&source_path.to_string_lossy())
                        .map_err(|e| anyhow::anyhow!(e))?;
                    continue;
                }
            }
        }
        Ok(())
    }
    fn create_dir(target_dir: &str) -> Result<(), String> {
        std::fs::create_dir_all(target_dir)
            .map_err(|e| format!("Failed to create restore directory: {:?}", e))?;
        Ok(())
    }
}
