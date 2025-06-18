import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

type State = {
  response: any;
  error: unknown;
  loading: boolean;
};

type Actions = {
  postBackup: () => void;
};

export const useStore = create<State & Actions>((set) => ({
  response: undefined,
  error: undefined,
  loading: false,
  postBackup: async () => {
    set({ loading: true });
    try {
      // Simulate fetching settings
      await invoke('backup').then((response: any) => {
        set({ response });
      });
      // Clear any previous error
      set({ error: undefined });
    } catch (error) {
      set({ error });
    } finally {
      set({ loading: false });
    }
  }
}));
