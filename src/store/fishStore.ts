import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FEED_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

export type FishStatus = 'NORMAL' | 'AWAY';

export interface FishState {
  status: FishStatus;
  lastFedTime: number;
  streak: number;
  checkStatus: () => void;
  /** 명상 성공 시 호출 (Step 4에서 사용) */
  feed: () => void;
}

export const useFishStore = create<FishState>()(
  persist(
    (set, get) => ({
      status: 'NORMAL',
      lastFedTime: 0,
      streak: 0,

      checkStatus: () => {
        const now = Date.now();
        const { lastFedTime, streak } = get();
        if (lastFedTime === 0) {
          // 한 번도 급여한 적 없으면 그대로
          return;
        }
        if (now - lastFedTime > FEED_EXPIRY_MS) {
          set({ status: 'AWAY', streak: 0 });
        }
      },

      feed: () => {
        set({
          status: 'NORMAL',
          lastFedTime: Date.now(),
          streak: get().streak + 1,
        });
      },
    }),
    {
      name: 'mindful-tank-fish',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        lastFedTime: state.lastFedTime,
        streak: state.streak,
      }),
      onRehydrateStorage: () => () => {
        // 앱 재시작 후 스토어 복원이 끝난 뒤 생존 여부 갱신 (콜백 시점에 이미 state 병합됨)
        setTimeout(() => get().checkStatus(), 0);
      },
    }
  )
);
