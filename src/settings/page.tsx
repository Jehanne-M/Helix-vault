import React, { useEffect, useState } from 'react';
import { Edit, X } from 'lucide-react';

import { SyncPath, useStore as settingsStore } from '../store/setting';
import { confirm, open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

const Settings: React.FC = () => {
  const [timeBackupEnabled, setTimeBackupEnabled] = useState<boolean>(true);
  const [backupRootTemp, setBackupRootTemp] = useState<string>('');
  const [checkedState, setCheckedState] = useState<boolean>(true);
  const [editPair, setEditPair] = useState<{
    [key: string]: { source: boolean; destination: boolean };
  }>({});
  const {
    addPair,
    openRootDialog,
    settings,
    initialSettings,
    initialize,
    removePair,
    updateSettings,
    updatePairSource,
    updatePairDestination,
    updateProcessTime,
    updateDestinationRoot,
    setOpenRootDialog
  } = settingsStore();

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

  // NOTE:
  const handleAddBackupPair = () => {
    const newPair: SyncPath = {
      source: '',
      destination: ''
    };
    addPair(newPair);
  };
  const handleDeleteBackupPair = async (index: number) => {
    console.log('バックアップペアを削除:', index);
    if (
      settings?.sync_pair?.length === 1 ||
      settings?.sync_pair?.length === undefined
    ) {
      alert('最低1つのバックアップペアが必要です');
      return;
    }
    await confirm('このバックアップペアを削除しますか？', {
      title: '確認',
      kind: 'warning'
    })
      .then((result) => {
        if (result) {
          removePair(index);
        } else {
          console.log('削除がキャンセルされました');
          return false;
        }
      })
      .catch((error) => {
        console.error('確認ダイアログのエラー:', error);
        return false;
      });
  };

  const selectDirectoryDialog = async (
    index: number,
    target: 'source' | 'destination'
  ) => {
    const defaultPath =
      target === 'source'
        ? settings?.sync_pair[index].source
        : settings?.sync_pair[index].destination || '~';
    const directory = await open({
      directory: true,
      multiple: false,
      title: 'フォルダを選択',
      defaultPath
    });
    if (typeof directory === 'string') {
      console.log('選択されたディレクトリ:', directory);
      return directory;
    } else {
      console.error('ディレクトリの選択に失敗');
      return '';
    }
  };

  const onSelectSource = async (index: number) => {
    const selectDirectory = await selectDirectoryDialog(index, 'source');
    if (selectDirectory !== '') {
      updatePairSource(index, selectDirectory);
    }
  };
  const onSelectDestination = async (index: number) => {
    const selectDirectory = await selectDirectoryDialog(index, 'destination');
    if (selectDirectory !== '') {
      updatePairDestination(index, selectDirectory);
    }
  };
  const handleSave = () => {
    if (!settings) {
      console.error('設定がロードされていません');
      return;
    }
    updateSettings(settings);
  };

  const handleCancel = () => {
    initialize(initialSettings);
    alert('設定をキャンセルしました');
  };

  const handleManualBackup = async () => {
    await invoke('backup')
      .then((result) => {
        console.log('バックアップ結果:', result);
      })
      .catch((error) => {
        console.error('バックアップエラー:', error);
      });
  };

  const DialogButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className='w-6 h-5 bg-white rounded-md shadow-md border border-black backdrop-blur-sm flex items-center justify-center hover:bg-gray-50'
    >
      <span className='text-black text-xs'>≡</span>
    </button>
  );

  useEffect(() => {
    // 初期設定のロード
    console.log('初期設定をロード:', initialSettings);
    console.log('settings:', settings);
    if (settings !== initialSettings) {
      console.log('settings===initialSettings:');
    }
  }, [settings, initialSettings]);

  return (
    <div className=' bg-white overflow-hidden'>
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
              value={settings?.process_time || '00:00:00'}
              onChange={(e) => updateProcessTime(e.target.value)}
              step='1'
              className='w-30 h-6 bg-lime-100 text-black text-xs px-2 border-none outline-none'
            />
          </div>
        </div>

        {/* Backup Root Settings */}
        <div className='flex items-center mb-8'>
          <span className='text-black text-xs mr-4 w-28'>
            バックアップルート
          </span>

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

        {/* Backup Pairs Headers */}
        <div className='flex justify-around mb-4 mt-8 mr-8'>
          <span className='text-black text-xs'>バックアップ元</span>
          <span className='text-black text-xs'>バックアップ先</span>
        </div>

        {/* Backup Pairs */}
        <div className='space-y-4 orverflow-y-auto '>
          {settings?.sync_pair.map((pair, index) => (
            <div key={index} className='flex items-center gap-4'>
              {/* Source */}
              <div className='flex items-center'>
                <div className='w-56 h-7 bg-zinc-100 rounded-sm flex items-center px-2'>
                  <input
                    type='text'
                    readOnly={true}
                    value={pair.source}
                    className='w-full bg-transparent text-black text-xs outline-none'
                    placeholder='バックアップ元を選択'
                  />
                </div>
                <DialogButton onClick={() => onSelectSource(index)} />
              </div>

              {/* Destination */}
              <div className='flex items-center'>
                <div className='w-56 h-7 bg-zinc-100 rounded-sm flex items-center px-2'>
                  <input
                    type='text'
                    readOnly={true}
                    value={pair.destination}
                    className='w-full bg-transparent text-black text-xs outline-none'
                    placeholder='バックアップ先を選択'
                  />
                </div>
                <DialogButton onClick={() => onSelectDestination(index)} />
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteBackupPair(index)}
                  className='w-6 h-6 bg-red-200 rounded-md shadow-md border border-black backdrop-blur-sm flex items-center justify-center hover:bg-red-300 ml-2'
                  title='この行を削除'
                >
                  <X className='w-4 h-4 text-red-600' />
                </button>
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
          {settings === initialSettings ? (
            <button
              onClick={handleManualBackup}
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
    </div>
  );
};

export default Settings;
