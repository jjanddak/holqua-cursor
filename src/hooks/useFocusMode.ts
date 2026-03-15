import { useCallback } from 'react';
import { Platform, Linking } from 'react-native';

/**
 * 방해금지 모드 안내 및 설정 화면 열기
 */
export function useFocusMode() {
  const openDndSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:FOCUS');
      } else if (Platform.OS === 'android') {
        await Linking.sendIntent?.('android.settings.ZEN_MODE_SETTINGS');
      }
    } catch {
      // 설정 열기 실패 시 무시
    }
  }, []);

  return { openDndSettings };
}
