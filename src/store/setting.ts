import { invoke } from '@tauri-apps/api/core';
import { create } from 'zustand';

export type SyncPath = {
  source: string;
  destination: string;
};
export type Settings = {
  sync_pair: SyncPath[];
  destination_root_address: string;
  process_time: string;
};

type State = {
  settings: Settings | undefined;
  initialSettings: Settings | undefined;
  loading: boolean;
  error: unknown;
  openRootDialog: boolean;
};

type Action = {
  addPair: (newPair: SyncPath) => void;
  fetchSettings: () => void;
  initialize: (initialSettings: State['initialSettings']) => void;
  updateSettings: (newSettings: Settings) => void;
  removePair: (index: number) => void;
  updatePairSource: (index: number, newSource: string) => void;
  updatePairDestination: (index: number, newDestination: string) => void;
  updateDestinationRoot: (newRoot: string) => void;
  updateProcessTime: (newTime: string) => void;
  setOpenRootDialog: (open: boolean) => void;
};

export const useStore = create<State & Action>((set) => ({
  settings: undefined,
  initialSettings: undefined,
  loading: false,
  error: undefined,
  openRootDialog: false,
  addPair: async (newPair: SyncPath) => {
    try {
      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              sync_pair: [...state.settings.sync_pair, newPair]
            }
          : {
              sync_pair: [newPair],
              destination_root_address:
                state.initialSettings?.destination_root_address || '',
              process_time: state.initialSettings?.process_time || '00:00:00'
            }
      }));
    } catch (error) {
      console.error('Error adding pair:', error);
      set({ error });
    }
  },
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await invoke<Settings>('load_config');
      set({ settings: response, initialSettings: response, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error, loading: false });
    }
  },

  initialize: (initialSettings) => {
    console.log('Initializing settings with:', initialSettings);
    set({ settings: initialSettings });
  },

  updateSettings: async (newSettings: Settings) => {
    try {
      await invoke<Settings>('save_config', { settings: newSettings });
      set({ initialSettings: newSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ error });
    }
  },

  removePair: (index: number) => {
    set((state) => {
      if (!state.settings) return state;
      const updatedPairs = [...state.settings.sync_pair];
      updatedPairs.splice(index, 1);
      return {
        settings: {
          ...state.settings,
          sync_pair: updatedPairs
        }
      };
    });
  },
  updatePairSource: (index: number, newSource: string) => {
    set((state) => {
      if (!state.settings) return state;
      const updatedPairs = [...state.settings.sync_pair];
      if (updatedPairs[index]) {
        updatedPairs[index].source = newSource;
      }
      return {
        settings: {
          ...state.settings,
          sync_pair: updatedPairs
        }
      };
    });
  },
  updatePairDestination: (index: number, newDestination: string) => {
    set((state) => {
      if (!state.settings) return state;
      const updatedPairs = [...state.settings.sync_pair];
      if (updatedPairs[index]) {
        updatedPairs[index].destination = newDestination;
      }
      return {
        settings: {
          ...state.settings,
          sync_pair: updatedPairs
        }
      };
    });
  },
  updateDestinationRoot: async (newRoot: string) => {
    try {
      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              destination_root_address: newRoot
            }
          : {
              sync_pair: state.initialSettings?.sync_pair || [],
              destination_root_address: newRoot,
              process_time: state.initialSettings?.process_time || '00:00:00'
            }
      }));
    } catch (error) {
      console.error('Error updating destination root:', error);
      set({ error });
    }
  },
  updateProcessTime: async (newTime: string) => {
    try {
      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              process_time: newTime
            }
          : {
              sync_pair: state.initialSettings?.sync_pair || [],
              destination_root_address:
                state.initialSettings?.destination_root_address || '',
              process_time: newTime
            }
      }));
    } catch (error) {
      console.error('Error updating process time:', error);
      set({ error });
    }
  },
  setOpenRootDialog: (open: boolean) => set({ openRootDialog: open })
}));
