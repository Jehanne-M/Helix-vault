import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const LeftMenu: React.FC = () => {
  const location = useLocation();
  return (
    <div className='w-28 h-full  bg-green-300/70 flex flex-col'>
      <NavLink
        to='/backup'
        className={`p-4 text-black text-xs hover:bg-green-400/70 ${
          location.pathname === '/backup' ? 'bg-green-400/70' : ''
        }`}
      >
        バックアップ
      </NavLink>
      <NavLink
        to='/restore'
        className={`p-4 text-black text-xs hover:bg-green-400/70 ${
          location.pathname === '/restore' ? 'bg-green-400/70' : ''
        }`}
      >
        リストア
      </NavLink>
    </div>
  );
};

export default LeftMenu;
