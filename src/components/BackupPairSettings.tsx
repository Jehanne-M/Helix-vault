import React, { useState } from 'react';
import { Edit, X } from 'lucide-react';
import { SyncPath } from '../store/setting';
import { confirm, open } from '@tauri-apps/plugin-dialog';
import { stringType } from '../components/validator';
import { create } from 'zustand';

type BackupPairSettingsProps = {
  settings: any;
  addPair?: (pair: SyncPath) => void | null;
  removePair: (index: number) => void;
  updatePairSource: (index: number, source: string) => void;
  updatePairDestination: (index: number, destination: string) => void;
  updateDestinationRoot: (root: string) => void;
  pathLevel: number;
};

const BackupPairSettings: React.FC<BackupPairSettingsProps> = ({
  settings,
  addPair,
  removePair,
  updatePairSource,
  updatePairDestination,
  updateDestinationRoot,
  pathLevel
}) => {
  const [backupPairEditStates, setBackupPairEditStates] = useState<boolean[]>(
    []
  );
  const [backupPairCancelValues, setBackupPairCancelValues] = useState<
    string[]
  >([]);

  const handleAddBackupPair = () => {
    if (addPair !== undefined) {
      const newPair: SyncPath = {
        source: '',
        destination: ''
      };
      addPair(newPair);
      setBackupPairEditStates((prev) => [...prev, false]);
      setBackupPairCancelValues((prev) => [...prev, '']);
    }
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

  const onSelectSource = async (index: number) => {
    const selectDirectory = await selectDirectoryDialog(index, 'source');
    if (selectDirectory !== '') {
      updatePairSource(index, selectDirectory);

      const deleteBackSlash = selectDirectory.replace(/\\/g, '/');
      const deleteColons = deleteBackSlash.replace(/:/g, '');
      const pathParts = deleteColons.split('/').filter((part) => part !== '');
      console.log('Selected Source Path Parts:', pathParts);
      console.log('Path Level:', pathLevel);
      console.log('path length:', pathParts.length);
      if (pathParts.length <= pathLevel) {
        const targetParts = pathParts;
        createTempPath(index, targetParts);
      } else {
        const targetParts = pathParts.slice(pathLevel);
        createTempPath(index, targetParts);
      }
    }
  };
  const createTempPath = (index: number, pathParts: string[]) => {
    if (settings?.destination_root_address !== undefined) {
      const destinationType = stringType(settings.destination_root_address);

      if (destinationType === 'windows-drive-letter') {
        const destinationPath = `${settings?.destination_root_address}${
          settings?.user_name ?? 'unknown'
        }\\${pathParts.join('\\')}`;
        updatePairDestination(index, destinationPath);
        console.log('Destination Path for DriveLetter:', destinationPath);
      } else if (
        destinationType === 'domain-name' ||
        destinationType === 'ipv4-address'
      ) {
        const destinationPath = `\\\\${
          settings?.destination_root_address
        }\\${pathParts.join('\\')}`;
        console.log('Destination Path for Domain/IP:', destinationPath);
        updatePairDestination(index, destinationPath);
      }
    }
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
    <div>
      {/* Backup Pairs Headers */}
      <div className='flex justify-around mb-4 mt-8 mr-8'>
        <span className='text-black text-xs'>バックアップ元</span>
        <span className='text-black text-xs'>バックアップ先</span>
      </div>

      {/* Backup Pairs */}
      <div className='space-y-4 orverflow-y-auto '>
        {settings?.sync_pair.map((pair: SyncPath, index: number) => (
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
      {addPair !== undefined && (
        <div className='mt-8'>
          <button
            onClick={handleAddBackupPair}
            className='w-10 h-7 bg-lime-200 rounded-md shadow-md border border-black backdrop-blur-sm hover:bg-lime-300'
          >
            <span className='text-black text-xs'>追加</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BackupPairSettings;
