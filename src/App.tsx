import { useEffect } from 'react';
import './App.css';
import Settings from './backup/page';
import { useStore } from './store/setting';

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
      <Settings />
    </div>
  );
}

export default App;
