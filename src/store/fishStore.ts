import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: AsyncStorage → react-native-mmkv 마이그레이션 (dev build 필요)

const FEED_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간
const POINTS_PER_FEED = 10;

export type FishStatus = 'NORMAL' | 'AWAY';

export interface FishState {
  status: FishStatus;
  lastFedTime: number;
  streak: number;
  points: number;

  /** 실패 시 쪽지 표시 여부 */
  hasNote: boolean;
  /** 쪽지 메시지 */
  noteMessage: string;

  /** 앰비언트 사운드 ON/OFF */
  ambientSoundEnabled: boolean;

  checkStatus: () => void;
  feed: (bonusPoints?: number) => void;
  setNote: (message: string) => void;
  clearNote: () => void;
  toggleAmbientSound: () => void;
}

export const useFishStore = create<FishState>()(
  persist(
    (set, get) => ({
      status: 'NORMAL',
      lastFedTime: 0,
      streak: 0,
      points: 0,
      hasNote: false,
      noteMessage: '',
      ambientSoundEnabled: true,

      checkStatus: () => {
        const now = Date.now();
        const { lastFedTime } = get();
        if (lastFedTime === 0) return;
        if (now - lastFedTime > FEED_EXPIRY_MS) {
          set({ status: 'AWAY', streak: 0 });
        }
      },

      feed: (bonusPoints = 0) => {
        set({
          status: 'NORMAL',
          lastFedTime: Date.now(),
          streak: get().streak + 1,
          points: get().points + POINTS_PER_FEED + bonusPoints,
          hasNote: false,
          noteMessage: '',
        });
      },

      setNote: (message: string) => {
        set({ hasNote: true, noteMessage: message });
      },

      clearNote: () => {
        set({ hasNote: false, noteMessage: '' });
      },

      toggleAmbientSound: () => {
        set({ ambientSoundEnabled: !get().ambientSoundEnabled });
      },
    }),
    {
      name: 'mindful-tank-fish',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        lastFedTime: state.lastFedTime,
        streak: state.streak,
        points: state.points,
        hasNote: state.hasNote,
        noteMessage: state.noteMessage,
        ambientSoundEnabled: state.ambientSoundEnabled,
      }),
      onRehydrateStorage: () => () => {
        setTimeout(() => useFishStore.getState().checkStatus(), 0);
      },
    }
  )
);
