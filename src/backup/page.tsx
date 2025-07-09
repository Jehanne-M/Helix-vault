import React, { useEffect, useState } from 'react';
import { Edit, LucideCircleHelp } from 'lucide-react';
import { useStore as settingsStore } from '../store/setting';
import { useStore as backupStore } from '../store/backup';
import ToolTip from '../components/ToolTip';
import BackupPairSettings from '../components/BackupPairSettings';

const Backup: React.FC = () => {
  const [timeBackupEnabled, setTimeBackupEnabled] = useState<boolean>(true);
  const [backupRootTemp, setBackupRootTemp] = useState<string>('');
  const [pathLevel, setPathLevel] = useState<number>(2);
  const {
    error,
    openRootDialog,
    settings,
    initialSettings,
    initialize,
    updateSettings,
    updateProcessTime,
    updateDestinationRoot,
    setOpenRootDialog,
    addPair,
    removePair,
    updatePairSource,
    updatePairDestination
  } = settingsStore();
  const {
    error: backupError,
    loading: backupLoading,
    postBackup
  } = backupStore();

  // NOTE: バックアップルートの編集処理
  const handleRootSave = () => {
    console.log('バックアップルートを保存:', backupRootTemp);
    updateDestinationRoot(backupRootTemp);
    setOpenRootDialog(false);
    alert('バックアップルートを保存しました');
  };
  const handleRootCancel = () => {
    console.log('バックアップルートの編集をキャンセル');
    setOpenRootDialog(false);
    setBackupRootTemp('');
  };
  const handleBackupRootEdit = () => {
    console.log('バックアップルートの編集を開始');
    setOpenRootDialog(true);
    setBackupRootTemp(settings?.destination_root_address || '');
  };
  const pathLevelTooltipContent = (
    <div>
      <p className='text-xs '>
        `パスレベルは、バックアップ元のパスから何階層目をバックアップ先に反映するかを指定します。
      </p>
      <p className='text-xs mt-1'>
        例: バックアップ元が `C:\Users\user_name\Documents\Project` の場合
      </p>
      <p className='text-xs mt-1'>パスレベルが2ならば、 バックアップ先は</p>
      <p className='text-xs mt-1'>
        `[バックアップ先ルート]\Backup\Documents\Project` になります。
      </p>
    </div>
  );

  const handleSave = () => {
    if (!settings) {
      alert('設定がロードされていません');
      return;
    }
    updateSettings(settings);
  };

  const handleCancel = () => {
    initialize(initialSettings);
    alert('設定をキャンセルしました');
  };

  // NOTE: 設定時間になったらバックアップを実行する
  useEffect(() => {
    let intervalId: number | null = null;

    if (timeBackupEnabled && settings?.process_time) {
      intervalId = setInterval(() => {
        const now = new Date();
        const [hours, minutes, seconds] = settings.process_time
          .split(':')
          .map(Number);
        if (
          now.getHours() === hours &&
          now.getMinutes() === minutes &&
          now.getSeconds() === seconds
        ) {
          postBackup();
        }
      }, 1000); // 1秒ごとにチェック
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // コンポーネントがアンマウントされたとき、またはtimeBackupEnabledがfalseになったときにインターバルをクリア
      }
    };
  }, [timeBackupEnabled, settings?.process_time, postBackup]);

  useEffect(() => {
    if (error) {
      alert(`設定の取得に失敗しました: ${error}`);
    }
    if (backupError) {
      alert(`バックアップの実行に失敗しました: ${backupError}`);
    }
  }, [error, backupError]);

  return (
    <div>
      <h1>バックアップ設定</h1>
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
            value={settings?.process_time || '00:00:00'}
            onChange={(e) => updateProcessTime(e.target.value)}
            step='1'
            className='w-30 h-6 bg-lime-100 text-black text-xs px-2 border-none outline-none'
          />
        </div>
      </div>

      {/* Backup Root Settings */}
      <div className='flex items-center mb-8'>
        <span className='text-black text-xs mr-4 w-28'>バックアップルート</span>

        {openRootDialog ? (
          <>
            <input
              type='text'
              value={backupRootTemp}
              onChange={(e) => setBackupRootTemp(e.target.value)}
              className='w-48 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none'
              autoFocus
            />
            <button
              onClick={handleRootSave}
              className='w-10 h-7 ml-2 bg-sky-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-sky-300'
            >
              <span className='text-black text-xs'>保存</span>
            </button>
            <button
              onClick={handleRootCancel}
              className='w-16 h-7 ml-2 bg-zinc-300 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-zinc-400'
            >
              <span className='text-black text-xs'>キャンセル</span>
            </button>
          </>
        ) : (
          <>
            <div className='w-48 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none flex items-center'>
              {settings?.destination_root_address}
            </div>
            <button
              onClick={handleBackupRootEdit}
              className='ml-2 p-1 hover:bg-gray-200 rounded'
            >
              <Edit className='w-6 h-6 text-gray-600' />
            </button>
          </>
        )}
      </div>
      {/* Path Level Settings */}
      <div className='flex items-center mb-8'>
        <span className='text-black text-xs mr-4 w-28'>パスレベル</span>
        <input
          type='number'
          value={pathLevel}
          onChange={(e) => setPathLevel(Number(e.target.value))}
          min='0'
          className='w-16 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none'
        />
        <ToolTip content={pathLevelTooltipContent}>
          <LucideCircleHelp size={16} className='text-blue-500 ml-2' />
        </ToolTip>

        <span className='text-black text-xs ml-2'>（0: ルートから）</span>
      </div>
      <BackupPairSettings
        settings={settings}
        addPair={addPair}
        removePair={removePair}
        updatePairSource={updatePairSource}
        updatePairDestination={updatePairDestination}
        updateDestinationRoot={updateDestinationRoot}
        pathLevel={pathLevel}
      />

      {/* Bottom Buttons */}
      <div className='absolute bottom-8 right-8 flex gap-4'>
        {settings === initialSettings ? (
          <button
            onClick={postBackup}
            disabled={backupLoading}
            className='w-36 h-7 bg-green-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-green-300'
          >
            <span className='text-black text-xs'>バックアップ手動開始</span>
          </button>
        ) : (
          <></>
        )}
        {settings !== initialSettings ? (
          <>
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
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Backup;
