import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useStore } from './store/setting';
import Backup from './backup/page';
import Restore from './restore/page';
import LeftMenu from './components/LeftMenu';

function App() {
  const { error, fetchSettings } = useStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (error) {
      alert(`Error fetching settings:${error}`);
    }
  }, [error]);

  return (
    <Router>
      <div className='flex h-screen'>
        <LeftMenu />
        <div className='flex-1 p-4'>
          <Routes>
            <Route path='/backup' element={<Backup />} />
            <Route path='/restore' element={<Restore />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
