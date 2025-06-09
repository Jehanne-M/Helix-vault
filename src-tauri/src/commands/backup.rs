use crate::commands::settings::SyncPaths;
use std::fs;
use std::vec;
pub struct Backup {
    sync_pair: Vec<SyncPaths>,
    destination_root_address: Option<String>,
    operation_at: String,
}
impl Backup {
    pub fn new(
        sync_pair: Vec<SyncPaths>,
        destination_root_address: Option<String>,
        operation_at: String,
    ) -> Self {
        Self {
            sync_pair,
            destination_root_address,
            operation_at,
        }
    }
    fn enum_files(path: &std::path::PathBuf, source_list: &mut Vec<String>) {
        if path.is_dir() {
            // ディレクトリの場合は再帰的に探索
            for entry in std::fs::read_dir(path).expect("Failed to read directory") {
                let entry = entry.expect("Failed to read entry");
                Self::enum_files(&entry.path(), source_list);
            }
        } else {
            // ファイルの場合はファイル名を表示
            source_list.push(path.to_string_lossy().to_string());
        }
    }
    pub fn local_net_backup(&self) -> anyhow::Result<()> {
        for pair in &self.sync_pair {
            let source = std::path::PathBuf::from(&pair.source);
            let source_depth_len = source.components().count().saturating_sub(1); // -1 to exclude the root component

            let destination = std::path::PathBuf::from(&pair.destination);
            let destination_depth_len = destination.components().count().saturating_sub(1); // -1 to exclude the root component

            let mut source_list: Vec<String> = vec![];

            // 対象ディレクトリのファイルを再帰的に取得
            Self::enum_files(&source, &mut source_list);

            for source_file in &source_list {
                let source_path = std::path::PathBuf::from(source_file);
                let destination_path = destination.join(
                    source_path
                        .components()
                        .skip(source_depth_len + 1)
                        .collect::<std::path::PathBuf>(),
                );
                if destination_path.components().count() < destination_depth_len {
                    return Err(anyhow::anyhow!(
                        "Destination path depth is less than source path depth"
                    ));
                }

                // Create the destination directory if it does not exist
                let destination_dir = &destination_path
                    .components()
                    .take(destination_path.components().count() - 1)
                    .collect::<std::path::PathBuf>();
                if !destination_dir.exists() {
                    match destination_dir.to_str() {
                        Some(dir_str) => {
                            Self::create_dir(dir_str).map_err(|e| anyhow::anyhow!(e))?
                        }
                        None => {
                            println!(
                                "Failed to convert destination directory to string: {}",
                                destination_dir.display()
                            );
                        }
                    }
                }
                if destination_path.exists() {
                    let source_metadata = fs::metadata(source_file)?;
                    let destination_metadata = fs::metadata(&destination_path).ok();
                    println!("{} metadata: {:?}", source_file, source_metadata);
                    println!(
                        "{:?} metadata: {:?}",
                        &destination_path, destination_metadata
                    );
                } else {
                    //  copy the source directory to the destination directory
                    match std::fs::copy(source_path, destination_path) {
                        Ok(_) => println!("Backup successful"),
                        Err(e) => println!("Failed to copy from {}", e),
                    }
                };
            }
        }
        Ok(())
    }

    fn create_dir(target_dir: &str) -> Result<(), String> {
        std::fs::create_dir_all(target_dir)
            .map_err(|e| format!("Failed to create backup directory: {}", e))?;
        Ok(())
    }
}
