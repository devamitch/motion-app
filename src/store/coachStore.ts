import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const storage = new MMKV();

const mmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.delete(name),
};

export type CoachMode = 'boxing' | 'dance';

interface CoachState {
  selectedMode: CoachMode;
  llmStatus: 'IDLE' | 'DOWNLOADING' | 'ERROR' | 'READY';
  downloadProgress: number;
  sessionCount: number;
  totalScore: number;
  setMode: (mode: CoachMode) => void;
  setLlmStatus: (status: CoachState['llmStatus']) => void;
  setDownloadProgress: (progress: number) => void;
  addScore: (score: number) => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set) => ({
      selectedMode: 'boxing',
      llmStatus: 'IDLE',
      downloadProgress: 0,
      sessionCount: 0,
      totalScore: 0,
      setMode: (selectedMode) => set({ selectedMode }),
      setLlmStatus: (llmStatus) => set({ llmStatus }),
      setDownloadProgress: (downloadProgress) => set({ downloadProgress }),
      addScore: (score) => set((s) => ({
        sessionCount: s.sessionCount + 1,
        totalScore: s.totalScore + score,
      })),
    }),
    {
      name: 'motion-coach-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
