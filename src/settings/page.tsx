import React, { useEffect, useState } from 'react';
import { Edit, X, LucideCircleHelp } from 'lucide-react';
import { SyncPath, useStore as settingsStore } from '../store/setting';
import { useStore as backupStore } from '../store/backup';
import { confirm, open } from '@tauri-apps/plugin-dialog';
import { stringType } from '../components/validator';
import ToolTip from '../components/ToolTip';

const Settings: React.FC = () => {
  const [timeBackupEnabled, setTimeBackupEnabled] = useState<boolean>(true);
  const [backupRootTemp, setBackupRootTemp] = useState<string>('');
  const [backupPairEditStates, setBackupPairEditStates] = useState<boolean[]>(
    []
  );
  const [backupPairCancelValues, setBackupPairCancelValues] = useState<
    string[]
  >([]);
  const [pathLevel, setPathLevel] = useState<number>(2);
  const {
    addPair,
    error,
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
  // NOTE: バックアップペアの追加・削除処理
  const handleAddBackupPair = () => {
    const newPair: SyncPath = {
      source: '',
      destination: ''
    };
    addPair(newPair);
    setBackupPairEditStates((prev) => [...prev, false]);
    setBackupPairCancelValues((prev) => [...prev, '']);
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
          setBackupPairEditStates((prev) => {
            const newStates = [...prev];
            newStates.splice(index, 1);
            return newStates;
          });
          setBackupPairCancelValues((prev) => {
            const newStates = [...prev];
            newStates.splice(index, 1);
            return newStates;
          });
        } else {
          alert('削除がキャンセルされました');
          return false;
        }
      })
      .catch((error) => {
        alert(`確認ダイアログのエラー:${error}`);
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
      return directory;
    } else {
      return '';
    }
  };

  // NOTE: バックアップ元・先の選択処理
  const onSelectSource = async (index: number) => {
    const selectDirectory = await selectDirectoryDialog(index, 'source');
    if (selectDirectory !== '') {
      // NOTE: 選択されたバックアップ元を更新
      updatePairSource(index, selectDirectory);

      // NOTE: 選択されたバックアップ元とパスレベルに基づいてバックアップ先を更新
      const tempPair = selectDirectory.replace(/\\/g, '/');
      const pathParts = tempPair.split('/').filter((part) => part !== '');
      const targetParts = pathParts.slice(pathLevel);
      if (settings?.destination_root_address !== undefined) {
        const destinationType = stringType(settings.destination_root_address);
        console.log(
          'Destination Type:',
          destinationType,
          'Target Parts:',
          targetParts
        );
        if (destinationType === 'windows-drive-letter') {
          // Windowsドライブレターの場合(例: C:\)、先頭に何もつけずに結合
          const destinationPath = `${
            settings?.destination_root_address
          }${targetParts.join('\\')}`;
          updatePairDestination(index, destinationPath);
          console.log('Destination Path for DriveLetter:', destinationPath);
        } else if (
          destinationType === 'domain-name' ||
          destinationType === 'ipv4-address'
        ) {
          // ドメイン名やIPv4アドレスの場合、先頭に '\\' を追加
          const destinationPath = `\\\\${
            settings?.destination_root_address
          }\\${targetParts.join('\\')}`;
          console.log('Destination Path for Domain/IP:', destinationPath);
          updatePairDestination(index, destinationPath);
        }
      }
    }
  };

  const handleSave = () => {
    if (!settings) {
      alert('設定がロードされていません');
      return;
    }
    updateSettings(settings);
  };

  const handleCancel = () => {
    initialize(initialSettings);
    setBackupPairCancelValues((prev) => [...prev, '']);
    setBackupPairEditStates((prev) => prev.map(() => false));
    alert('設定をキャンセルしました');
  };

  const DialogButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className='w-6 h-5 bg-white rounded-md shadow-md border border-black backdrop-blur-sm flex items-center justify-center hover:bg-gray-50'
    >
      <span className='text-black text-xs'>≡</span>
    </button>
  );

  // NOTE: settins関連エラー監視
  useEffect(() => {
    if (error !== undefined) {
      alert(`Error: ${error}`);
    }
  }, [error]);

  // NOTE: バックアップの手動開始のエラー監視
  useEffect(() => {
    if (backupError !== undefined) {
      alert(`バックアップエラー: ${backupError}`);
    }
  }, [backupError]);

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
                {backupPairEditStates[index] ? (
                  <>
                    <input
                      type='text'
                      value={pair.destination}
                      onChange={(e) =>
                        updatePairDestination(index, e.target.value)
                      }
                      className='w-48 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none'
                    />
                    <button
                      onClick={() => {
                        setBackupPairEditStates((prev) => {
                          const newStates = [...prev];
                          newStates[index] = false;
                          return newStates;
                        });
                      }}
                      className='w-10 h-7 ml-2 bg-sky-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-sky-300'
                    >
                      <span className='text-black text-xs'>保存</span>
                    </button>
                    <button
                      onClick={() => {
                        setBackupPairEditStates((prev) => {
                          const newStates = [...prev];
                          newStates[index] = false;
                          return newStates;
                        });
                        updatePairDestination(
                          index,
                          backupPairCancelValues[index]
                        );
                      }}
                      className='w-16 h-7 ml-2 bg-zinc-300 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-zinc-400'
                    >
                      <span className='text-black text-xs'>キャンセル</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className='w-48 h-6 bg-zinc-100 text-black text-xs px-3 border-none outline-none flex items-center'>
                      {pair.destination || ''}
                    </div>
                    <button
                      onClick={() => {
                        setBackupPairEditStates((prev) => {
                          const newStates = [...prev];
                          newStates[index] = true;
                          return newStates;
                        });
                        setBackupPairCancelValues((prev) => {
                          const newStates = [...prev];
                          newStates[index] =
                            settings?.sync_pair[index].destination;
                          return newStates;
                        });
                      }}
                      className='w-6 h-6 bg-white rounded-md shadow-md border border-black backdrop-blur-sm flex items-center justify-center hover:bg-gray-50'
                      title='バックアップ先を編集'
                    >
                      <Edit className='w-6 h-6 text-gray-600' />
                    </button>
                  </>
                )}
                {/* <DialogButton onClick={() => onSelectDestination(index)} /> */}
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
    </div>
  );
};

export default Settings;
