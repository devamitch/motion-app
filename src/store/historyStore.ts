import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const storage = new MMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.delete(name),
};

export interface SessionEntry {
  mode: string;
  feedback: string;
  timestamp: number;
}

interface HistoryState {
  history: SessionEntry[];
  addSession: (session: SessionEntry) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addSession: (session) => set((state) => ({ 
        history: [session, ...state.history].slice(0, 50) 
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'motion-history-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
