import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FEED_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

export type FishStatus = 'NORMAL' | 'AWAY';

export interface FishState {
  status: FishStatus;
  lastFedTime: number;
  streak: number;
  /** 상점 포인트 (명상 성공 시 증가) */
  points: number;
  /** 적용 중인 물고기 스킨 id */
  fishSkinId: string;
  /** 적용 중인 수조 테마 id */
  tankThemeId: string;
  /** 구매한 물고기 스킨 id 목록 (default 제외) */
  purchasedFishSkins: string[];
  /** 구매한 수조 테마 id 목록 (default 제외) */
  purchasedTankThemes: string[];
  checkStatus: () => void;
  /** 명상 성공 시 호출 (포인트 지급 포함) */
  feed: () => void;
  /** 포인트로 물고기 스킨 구매 */
  purchaseFishSkin: (skinId: string, cost: number) => boolean;
  /** 포인트로 수조 테마 구매 */
  purchaseTankTheme: (themeId: string, cost: number) => boolean;
  /** 적용할 물고기 스킨 변경 (보유한 스킨만) */
  setFishSkin: (skinId: string) => void;
  /** 적용할 수조 테마 변경 (보유한 테마만) */
  setTankTheme: (themeId: string) => void;
}

const POINTS_PER_FEED = 10;

export const useFishStore = create<FishState>()(
  persist(
    (set, get) => ({
      status: 'NORMAL',
      lastFedTime: 0,
      streak: 0,
      points: 0,
      fishSkinId: 'default',
      tankThemeId: 'default',
      purchasedFishSkins: [],
      purchasedTankThemes: [],

      checkStatus: () => {
        const now = Date.now();
        const { lastFedTime, streak } = get();
        if (lastFedTime === 0) {
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
          points: get().points + POINTS_PER_FEED,
        });
      },

      purchaseFishSkin: (skinId: string, cost: number) => {
        const { points, purchasedFishSkins, fishSkinId } = get();
        if (skinId === 'default') return false;
        if (purchasedFishSkins.includes(skinId)) return false;
        if (points < cost) return false;
        set({
          points: points - cost,
          purchasedFishSkins: [...purchasedFishSkins, skinId],
          fishSkinId: skinId,
        });
        return true;
      },

      purchaseTankTheme: (themeId: string, cost: number) => {
        const { points, purchasedTankThemes, tankThemeId } = get();
        if (themeId === 'default') return false;
        if (purchasedTankThemes.includes(themeId)) return false;
        if (points < cost) return false;
        set({
          points: points - cost,
          purchasedTankThemes: [...purchasedTankThemes, themeId],
          tankThemeId: themeId,
        });
        return true;
      },

      setFishSkin: (skinId: string) => {
        const { purchasedFishSkins } = get();
        if (skinId !== 'default' && !purchasedFishSkins.includes(skinId)) return;
        set({ fishSkinId: skinId });
      },

      setTankTheme: (themeId: string) => {
        const { purchasedTankThemes } = get();
        if (themeId !== 'default' && !purchasedTankThemes.includes(themeId)) return;
        set({ tankThemeId: themeId });
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
        fishSkinId: state.fishSkinId,
        tankThemeId: state.tankThemeId,
        purchasedFishSkins: state.purchasedFishSkins,
        purchasedTankThemes: state.purchasedTankThemes,
      }),
      onRehydrateStorage: () => () => {
        // 앱 재시작 후 스토어 복원이 끝난 뒤 생존 여부 갱신 (콜백 시점에 이미 state 병합됨)
        setTimeout(() => useFishStore.getState().checkStatus(), 0);
      },
    }
  )
);
