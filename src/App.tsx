import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

type SyncPath = {
  source: string;
  destination: string;
};
type Settings = {
  sync_pair: SyncPath[];
  destination_address?: string;
  process_time: string;
};

function App() {
  const [name, setName] = useState('Tauri');
  const onLoad = async (): Promise<Settings | undefined> => {
    await invoke<Settings>('load_config')
      .then((config) => {
        console.log('Config loaded from Rust:', config);
        return config as Settings;
      })
      .catch((error: any) => {
        console.error('Error loading config from Rust:', error);
        return undefined;
      });

    return undefined;
  };
  const onBackup = async () => {
    await invoke<Settings>('backup')
      .then((response: any) => {
        console.log('Backup response from Rust:', response);
      })
      .catch((error: any) => {
        console.error('Error during backup:', error);
      });
  };

  useEffect(() => {
    onLoad();
  }, []);
  return (
    <div>
      <input
        type='text'
        value-={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <button
        onClick={() => {
          invoke('greet', { name })
            .then((response) => {
              console.log('Response from Rust:', response);
            })
            .catch((error: any) => {
              console.error('Error calling Rust function:', error);
            });
        }}
      >
        test
      </button>

      <button onClick={onBackup}>backup start</button>
    </div>
  );
}

export default App;
