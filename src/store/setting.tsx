import { invoke } from '@tauri-apps/api/core';
import { create } from 'zustand';

export type SyncPath = {
  source: string;
  destination: string;
};
export type Settings = {
  sync_pair: SyncPath[];
  destination_root_address?: string;
  process_time: string;
};

type State = {
  settings: Settings | undefined;
  loading: boolean;
  error: unknown;
};

type Action = {
  fetchSettings: () => void;
  updateSettings: (newSettings: Settings) => void;
  addPair: (newPair: SyncPath) => void;
};

export const useStore = create<State & Action>((set) => ({
  settings: undefined,
  loading: false,
  error: undefined,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await invoke<Settings>('load_config');
      set({ settings: response, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error, loading: false });
    }
  },
  updateSettings: async (newSettings: Settings) => {
    set({ loading: true });
    try {
      await invoke('update_config', { settings: newSettings });
      set({ settings: newSettings, loading: false });
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ error, loading: false });
    }
  },
  addPair: async (newPair: SyncPath) => {
    try {
      set((state) => {
        settings: state.settings;
      });
    } catch (error) {
      console.error('Error adding settings:', error);
      set({ error });
    }
  }
}));
