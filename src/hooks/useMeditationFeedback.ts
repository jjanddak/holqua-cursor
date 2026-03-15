import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';
const HAPTIC_INTERVAL_MS = 10 * 1000;

/**
 * 명상 오감 피드백 (사운드 에셋 제거 상태 — 진동만 동작)
 * 사운드 파일이 추가되면 Audio 로직 복원 예정
 */
export function useMeditationFeedback(isHolding: boolean) {
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isHolding) {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
      return;
    }

    if (!isWeb) {
      hapticIntervalRef.current = setInterval(() => {
        Haptics.selectionAsync().catch(() => {});
      }, HAPTIC_INTERVAL_MS);
    }

    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    };
  }, [isHolding]);

  const triggerComplete = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
  };

  return { onMeditationComplete: triggerComplete };
}
