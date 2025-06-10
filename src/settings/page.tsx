import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import {
  useStore as settingStore,
  Settings as SettingsType,
  SyncPath
} from '../store/setting';

const Settings: React.FC = () => {
  const [timeBackupEnabled, setTimeBackupEnabled] = useState<boolean>(true);
  const [backupTime, setBackupTime] = useState<string>('15:00:00');
  const [backupRoot, setBackupRoot] = useState<string>('100.100.200.200');
  const { settings, addSettings } = settingStore();

  const handleAddBackupPair = () => {
    const newPair: SyncPath = {
      source: '',
      destination: ''
    };
    setBackupPairs([...settings, newPair]);
  };

  const handleSourceChange = (id: string, value: string) => {
    setBackupPairs((pairs) =>
      pairs.map((pair) => (pair.id === id ? { ...pair, source: value } : pair))
    );
  };

  const handleDestinationChange = (id: string, value: string) => {
    setBackupPairs((pairs) =>
      pairs.map((pair) =>
        pair.id === id ? { ...pair, destination: value } : pair
      )
    );
  };

  const handleSave = () => {
    console.log('設定を保存:', {
      timeBackupEnabled,
      backupTime,
      backupRoot,
      settings
    });
    alert('設定を保存しました');
  };

  const handleCancel = () => {
    console.log('キャンセル');
  };

  const handleManualBackup = () => {
    console.log('手動バックアップ開始');
    alert('バックアップを開始しました');
  };

  const handleBrowseFolder = (type: 'source' | 'destination', id?: string) => {
    console.log(`フォルダー選択: ${type}`, id);
    alert('フォルダー選択ダイアログを開きます');
  };

  const DialogButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className='w-6 h-5 bg-white rounded-md shadow-md border border-black backdrop-blur-sm flex items-center justify-center hover:bg-gray-50'
    >
      <span className='text-black text-xs'>≡</span>
    </button>
  );

  return (
    <div className='w-[660px] h-[663px] relative bg-white overflow-hidden border'>
      {/* Left Menu */}
      <div className='w-28 h-full absolute left-0 top-0 bg-green-300/70' />

      {/* Main Content */}
      <div className='ml-28 p-4'>
        {/* Backup Time Settings */}
        <div className='flex items-center mb-8 mt-8'>
          <div className='flex items-center mr-4'>
            <input
              type='checkbox'
              checked={timeBackupEnabled}
              onChange={(e) => setTimeBackupEnabled(e.target.checked)}
              className='w-3.5 h-3.5 rounded border border-black mr-2'
            />
            <span className='text-black text-xs'>バックアップ開始時間</span>
          </div>
          <div className='ml-8'>
            <input
              type='time'
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
              step='1'
              className='w-20 h-6 bg-lime-100 text-black text-xs px-2 border-none outline-none'
            />
          </div>
        </div>

        {/* Backup Root Settings */}
        <div className='flex items-center mb-8'>
          <span className='text-black text-xs mr-4 w-28'>
            バックアップルート
          </span>
          <input
            type='text'
            value={settings?.destination_root_address || backupRoot}
            onChange={(e) => setBackupRoot(e.target.value)}
            className='w-48 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none'
          />
          <Edit className='w-6 h-6 ml-2 text-gray-600' />
          <button
            onClick={handleSave}
            className='w-10 h-7 ml-8 bg-sky-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-sky-300'
          >
            <span className='text-black text-xs'>保存</span>
          </button>
        </div>

        {/* Backup Pairs Headers */}
        <div className='flex justify-between mb-4 mt-8'>
          <span className='text-black text-xs ml-16'>バックアップ元</span>
          <span className='text-black text-xs mr-24'>バックアップ先</span>
        </div>

        {/* Backup Pairs */}
        <div className='space-y-4'>
          {settings?.sync_pair.map((pair, index) => (
            <div key={index} className='flex items-center gap-4'>
              {/* Source */}
              <div className='flex items-center'>
                <div className='w-56 h-7 bg-zinc-100 rounded-sm flex items-center px-2'>
                  <input
                    type='text'
                    value={pair.source}
                    onChange={(e) => handleSourceChange(index, e.target.value)}
                    className='w-full bg-transparent text-black text-xs outline-none'
                    placeholder='バックアップ元を選択'
                  />
                </div>
                <DialogButton
                  onClick={() => handleBrowseFolder('source', pair.id)}
                />
              </div>

              {/* Destination */}
              <div className='flex items-center'>
                <div className='w-56 h-7 bg-zinc-100 rounded-sm flex items-center px-2'>
                  <input
                    type='text'
                    value={pair.destination}
                    onChange={(e) =>
                      handleDestinationChange(pair.id, e.target.value)
                    }
                    className='w-full bg-transparent text-black text-xs outline-none'
                    placeholder='バックアップ先を選択'
                  />
                </div>
                <DialogButton
                  onClick={() => handleBrowseFolder('destination', pair.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className='mt-8'>
          <button
            onClick={handleAddBackupPair}
            className='w-10 h-7 bg-lime-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-lime-300'
          >
            <span className='text-black text-xs'>追加</span>
          </button>
        </div>

        {/* Bottom Buttons */}
        <div className='absolute bottom-8 right-8 flex gap-4'>
          <button
            onClick={handleManualBackup}
            className='w-36 h-7 bg-green-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-green-300'
          >
            <span className='text-black text-xs'>バックアップ手動開始</span>
          </button>
          <button
            onClick={handleCancel}
            className='w-20 h-7 bg-zinc-300 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-zinc-400'
          >
            <span className='text-black text-xs'>キャンセル</span>
          </button>
          <button
            onClick={handleSave}
            className='w-10 h-7 bg-sky-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-sky-300'
          >
            <span className='text-black text-xs'>保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
