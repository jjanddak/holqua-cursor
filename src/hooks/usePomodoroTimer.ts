import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export type PomodoroStatus = 'idle' | 'running' | 'success' | 'failed';

interface UsePomodoroTimerReturn {
  status: PomodoroStatus;
  elapsedMs: number;
  remainingMs: number;
  progressRatio: number;
  start: (durationMs: number) => void;
  stop: () => void;
  reset: () => void;
}

/**
 * 뽀모도로 타이머 엔진
 * - 백그라운드 진입 시 즉시 실패 처리
 * - expo-keep-awake로 화면 유지
 */
export function usePomodoroTimer(
  onSuccess: () => void,
  onFail: () => void
): UsePomodoroTimerReturn {
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const durationMsRef = useRef(0);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<PomodoroStatus>('idle');

  // statusRef를 동기화 (AppState 콜백에서 최신 값 참조)
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    deactivateKeepAwake('pomodoro');
  }, []);

  const start = useCallback(
    (durationMs: number) => {
      durationMsRef.current = durationMs;
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      setStatus('running');

      activateKeepAwakeAsync('pomodoro').catch(() => {});

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setElapsedMs(elapsed);

        if (elapsed >= durationMsRef.current) {
          cleanup();
          setStatus('success');
          onSuccess();
        }
      }, 1000);
    },
    [cleanup, onSuccess]
  );

  const stop = useCallback(() => {
    cleanup();
    setStatus('failed');
    onFail();
  }, [cleanup, onFail]);

  const reset = useCallback(() => {
    cleanup();
    setElapsedMs(0);
    setStatus('idle');
  }, [cleanup]);

  // 백그라운드 감지 → 즉시 실패
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (
        statusRef.current === 'running' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        cleanup();
        setStatus('failed');
        onFail();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => {
      sub.remove();
      cleanup();
    };
  }, [cleanup, onFail]);

  const remainingMs = Math.max(0, durationMsRef.current - elapsedMs);
  const progressRatio =
    durationMsRef.current > 0
      ? Math.min(1, elapsedMs / durationMsRef.current)
      : 0;

  return {
    status,
    elapsedMs,
    remainingMs,
    progressRatio,
    start,
    stop,
    reset,
  };
}
