import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

type File = {
  id: string;
  name: string;
};

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [authUrl, setAuthUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('auth-success', authSuccess);
    window.addEventListener('auth-error', authError);

    // アプリ起動時に認証URLを取得
    invoke('generate_auth_url')
      .then((url: any) => setAuthUrl(url))
      .catch((error) => setErrorMessage(`認証URLの取得に失敗: ${error}`));

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('auth-success', authSuccess);
      window.removeEventListener('auth-error', authError);
    };
  }, []);

  const authSuccess = () => {
    setIsAuthenticated(true);
    setErrorMessage('');
  };

  const authError = (event: any) => {
    setErrorMessage(
      `認証エラー: ${event.target?.dispatchEvent.name || '不明なエラー'}`
    );
  };
  const handleAuthClick = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#code=')) {
      const code = hash.substring('#code='.length);
      console.log('認証コード:', code);
      invoke('exchange_code_for_token', { code }).catch((error: any) =>
        setErrorMessage(`トークン交換に失敗: ${error}`)
      );
    } else if (hash.includes('error')) {
      setErrorMessage(`認証に失敗しました: ${hash}`);
    }
  };

  const listFiles = () => {
    invoke('list_drive_files')
      .then((data: any) => {
        console.log('ファイルリスト:', JSON.parse(data));
        setFiles(JSON.parse(data).files || []);
        setErrorMessage('');
      })
      .catch((error: any) =>
        setErrorMessage(`ファイルリストの取得に失敗: ${error}`)
      );
  };

  return (
    <div>
      <h1>Google Drive Integration</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {!isAuthenticated ? (
        <button onClick={handleAuthClick} disabled={!authUrl}>
          Google Drive に認証
        </button>
      ) : (
        <div>
          <p>認証済み</p>
          <button onClick={listFiles}>ファイルリストを取得</button>
          <ul>
            {files.map((file) => (
              <li key={file.id}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
