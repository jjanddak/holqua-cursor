import { useEffect, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';

const SHIFT_INTERVAL_MS = 5 * 60 * 1000; // 5분마다
const SHIFT_RANGE = 4; // +-4px

/**
 * OLED 번인 방지
 * - 5분마다 UI 전체 오프셋 미세 변경 (픽셀 시프팅)
 * - 밝기 제어는 expo-brightness로 시도 (설치 시 별도 적용)
 *
 * TODO: expo-brightness 설치 후 밝기 10%로 자동 저하 구현
 */
export function useBurnInGuard(isActive: boolean) {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      offsetX.value = 0;
      offsetY.value = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      offsetX.value = (Math.random() - 0.5) * 2 * SHIFT_RANGE;
      offsetY.value = (Math.random() - 0.5) * 2 * SHIFT_RANGE;
    }, SHIFT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

  return { offsetX, offsetY };
}
