import { useEffect } from 'react';
import './App.css';
import { useStore } from './store/setting';
import Backup from './backup/page';

function App() {
  const { error, fetchSettings } = useStore();

  useEffect(() => {
    fetchSettings();
  }, []);
  useEffect(() => {
    if (error) {
      alert(`Error fetching settings:${error}`);
    }
  });
  return (
    <div>
      <Backup />
    </div>
  );
}

export default App;
