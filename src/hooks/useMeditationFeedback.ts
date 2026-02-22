import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { Sound } from 'expo-av/build/Audio';

const isWeb = Platform.OS === 'web';

const HAPTIC_INTERVAL_MS = 10 * 1000; // 10초마다 Selection 진동

/** 명상 오감 피드백: ASMR 루프, 10초 간격 진동, 완료 시 종소리 + 강한 진동 */
export function useMeditationFeedback(isHolding: boolean) {
  const waterSoundRef = useRef<Sound | null>(null);
  const bellSoundRef = useRef<Sound | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 사운드 미리 로드 (터치 시 지연 방지)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch {
        // 오디오 모드 실패 시 계속 진행 (진동은 동작)
      }

      try {
        // 물소리(ASMR) 루프용
        const { sound: water } = await Audio.Sound.createAsync(
          require('../../assets/sounds/water.mp3'),
          { shouldPlay: false }
        );
        await water.setIsLoopingAsync(true);
        if (mounted) waterSoundRef.current = water;
        else water.unloadAsync();
      } catch {
        // 에셋 없거나 로드 실패 시 무시
      }

      try {
        // 완료 시 종소리
        const { sound: bell } = await Audio.Sound.createAsync(
          require('../../assets/sounds/bell.mp3'),
          { shouldPlay: false, isLooping: false }
        );
        if (mounted) bellSoundRef.current = bell;
        else bell.unloadAsync();
      } catch {
        // 에셋 없거나 로드 실패 시 무시
      }
    })();

    return () => {
      mounted = false;
      waterSoundRef.current?.unloadAsync().then(() => {
        waterSoundRef.current = null;
      });
      bellSoundRef.current?.unloadAsync().then(() => {
        bellSoundRef.current = null;
      });
    };
  }, []);

  // isHolding true → ASMR 재생, 10초마다 Selection 진동
  useEffect(() => {
    if (!isHolding) {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
      waterSoundRef.current?.stopAsync().catch(() => {});
      return;
    }

    waterSoundRef.current?.playAsync().catch(() => {});
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
      waterSoundRef.current?.stopAsync().catch(() => {});
    };
  }, [isHolding]);

  const triggerComplete = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    waterSoundRef.current?.stopAsync().catch(() => {});
    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    bellSoundRef.current?.replayAsync().catch(() => {});
  };

  return { onMeditationComplete: triggerComplete };
}
