import { invoke } from '@tauri-apps/api/core';
import { create } from 'zustand';

type State = {
  response: unknown;
  error: unknown;
  loading: boolean;
};

type Action = {
  onRestore: () => void;
};

export const useStore = create<State & Action>((set) => ({
  response: '',
  error: null,
  loading: false,
  onRestore: async () => {
    set({ loading: true });
    // Simulate an async operation
    try {
      await invoke('restore').then((response) => {
        set({ response, loading: false });
      });
    } catch (error) {
      set({ error, loading: false });
      console.error('Restore failed:', error);
      set({ response: 'Restore failed', loading: false });
    } finally {
      set({ loading: false });
    }
  }
}));
