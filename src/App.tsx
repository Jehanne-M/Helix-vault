import { useEffect } from 'react';
import './App.css';
import Settings from './settings/page';
import { useStore } from './store/setting';

function App() {
  const { error, fetchSettings } = useStore();

  // const onBackup = async () => {
  //   await invoke('backup')
  //     .then((response: any) => {
  //       console.log('Backup response from Rust:', response);
  //     })
  //     .catch((error: any) => {
  //       console.error('Error during backup:', error);
  //     });
  // };

  useEffect(() => {
    fetchSettings();
    // const interval = setInterval(() => {
    //   onBackup();
    // }, 1000 * 60 * 60); // 1 hour
    // return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (error) {
      alert(`Error fetching settings:${error}`);
    }
  });
  return (
    <div>
      {/* <button onClick={onBackup}>backup start</button> */}
      <Settings />
    </div>
  );
}

export default App;
