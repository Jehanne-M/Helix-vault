import React from 'react';
import BackupPairSettings from '../components/BackupPairSettings';
import { useStore as settingsStore } from '../store/setting';

const Restore: React.FC = () => {
  const { settings, removePair, updatePairDestination, updateDestinationRoot } =
    settingsStore();
  return (
    <div>
      <h1>リストア設定</h1>
      {settings && (
        <BackupPairSettings
          settings={settings}
          removePair={removePair}
          updatePairDestination={updatePairDestination}
          updateDestinationRoot={updateDestinationRoot}
          updatePairSource={() => {}}
          pathLevel={0}
        />
      )}
    </div>
  );
};

export default Restore;
