import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useWindowDimensions,
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useFishStore } from '../store';
import { useMeditationFeedback } from '../hooks';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  getRandomSuccessQuote,
  getRandomFailQuote,
  getRandomAwayQuote,
} from '../constants';

const MEDITATION_NORMAL_MS = 60 * 1000;
const MEDITATION_AWAY_MS = 120 * 1000;
const FISH_SPEED = 2;
const MARGIN = 60;
const FISH_SIZE = 48;

export function TankCanvas() {
  const { width, height } = useWindowDimensions();
  const status = useFishStore((s) => s.status);
  const feed = useFishStore((s) => s.feed);
  const hasNote = useFishStore((s) => s.hasNote);
  const noteMessage = useFishStore((s) => s.noteMessage);
  const setNote = useFishStore((s) => s.setNote);
  const clearNote = useFishStore((s) => s.clearNote);
  const streak = useFishStore((s) => s.streak);
  const points = useFishStore((s) => s.points);

  const [isHolding, setIsHolding] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successQuestion, setSuccessQuestion] = useState('');
  const [letterModalVisible, setLetterModalVisible] = useState(false);
  const [awayQuote, setAwayQuote] = useState('');

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { onMeditationComplete } = useMeditationFeedback(isHolding);

  // AWAY 상태 진입 시 한 번만 quote 생성
  useEffect(() => {
    if (status === 'AWAY') {
      setAwayQuote(getRandomAwayQuote());
    }
  }, [status]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // === Reanimated SharedValues ===
  const fishX = useSharedValue(width / 2);
  const fishY = useSharedValue(height / 2);
  const fishAngle = useSharedValue(0);
  const targetX = useSharedValue(-1);
  const targetY = useSharedValue(-1);
  const randomAngle = useSharedValue(0);
  const progress = useSharedValue(0);
  const requiredDurationMs = useSharedValue(MEDITATION_NORMAL_MS);

  useEffect(() => {
    requiredDurationMs.value =
      status === 'AWAY' ? MEDITATION_AWAY_MS : MEDITATION_NORMAL_MS;
  }, [status]);

  useEffect(() => {
    fishX.value = width / 2;
    fishY.value = height / 2;
  }, [width, height]);

  // === 명상 성공 ===
  const handleMeditationSuccess = useCallback(
    (_x: number, _y: number) => {
      onMeditationComplete();
      feed();
      setSuccessQuestion(getRandomSuccessQuote());
      setShowSuccessOverlay(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(
        () => setShowSuccessOverlay(false),
        4000
      );
    },
    [onMeditationComplete, feed]
  );

  // === 명상 실패 (터치 해제) ===
  const handleMeditationFail = useCallback(() => {
    const failMsg = getRandomFailQuote();
    setNote(failMsg);
  }, [setNote]);

  // === Pan Gesture ===
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      targetX.value = e.x;
      targetY.value = e.y;
      progress.value = 0;
      runOnJS(setIsHolding)(true);
    })
    .onUpdate((e) => {
      targetX.value = e.x;
      targetY.value = e.y;
    })
    .onEnd(() => {
      if (progress.value < 1) {
        progress.value = 0;
        runOnJS(handleMeditationFail)();
      }
      targetX.value = -1;
      targetY.value = -1;
      runOnJS(setIsHolding)(false);
    });

  // === 물고기 AI 움직임 + 명상 프로그레스 (단일 useFrameCallback) ===
  useFrameCallback((frame) => {
    'worklet';
    const t = frame.timestamp * 0.001;

    // 물고기 이동
    if (targetX.value >= 0 && targetY.value >= 0) {
      const dx = targetX.value - fishX.value;
      const dy = targetY.value - fishY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        fishAngle.value = Math.atan2(dy, dx);
        fishX.value += (dx / dist) * FISH_SPEED * 2;
        fishY.value += (dy / dist) * FISH_SPEED * 2;
      }
    } else {
      randomAngle.value += Math.sin(t * 2.3) * 0.08;
      fishX.value += Math.cos(randomAngle.value) * FISH_SPEED;
      fishY.value += Math.sin(randomAngle.value) * FISH_SPEED;
      fishAngle.value = randomAngle.value;
    }
    fishX.value = Math.max(MARGIN, Math.min(width - MARGIN, fishX.value));
    fishY.value = Math.max(MARGIN, Math.min(height - MARGIN, fishY.value));

    // 프로그레스 업데이트
    if (targetX.value >= 0) {
      const dt = frame.timeSincePreviousFrame ?? 16;
      progress.value = Math.min(
        1,
        progress.value + dt / requiredDurationMs.value
      );
      if (progress.value >= 1) {
        runOnJS(handleMeditationSuccess)(fishX.value, fishY.value);
        progress.value = 0;
        targetX.value = -1;
        targetY.value = -1;
        runOnJS(setIsHolding)(false);
      }
    }
  });

  // === Animated Styles ===
  const fishStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: fishX.value - FISH_SIZE / 2 },
      { translateY: fishY.value - FISH_SIZE / 2 },
    ],
  }));

  const progressBarWidth = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [0, width - Spacing.xl * 2])
  );

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  // === 쪽지 모달 닫기 (clearNote 포함) ===
  const handleCloseLetterModal = useCallback(() => {
    setLetterModalVisible(false);
    if (status !== 'AWAY') {
      clearNote();
    }
  }, [status, clearNote]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.tankBg }]}>
      {/* 상태 표시 (좌측 상단) */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {streak > 0 ? `${streak}일 연속` : ''}
        </Text>
        <Text style={styles.pointsText}>{points}P</Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          {/* 물고기 (NORMAL 상태) */}
          {status === 'NORMAL' && (
            <Animated.View style={[styles.fish, fishStyle]}>
              <Text style={styles.fishEmoji}>🐠</Text>
            </Animated.View>
          )}

          {/* 쪽지 (AWAY 또는 실패 시) */}
          {(status === 'AWAY' || hasNote) && (
            <Pressable
              style={[
                styles.noteContainer,
                {
                  left: width / 2 - 60,
                  top: height / 2 + 40,
                },
              ]}
              onPress={() => setLetterModalVisible(true)}
            >
              <Text style={styles.noteEmoji}>📜</Text>
              <Text style={styles.noteText} numberOfLines={1}>
                {status === 'AWAY' ? awayQuote : noteMessage || '...'}
              </Text>
            </Pressable>
          )}
        </View>
      </GestureDetector>

      {/* 프로그레스 바 (하단) */}
      {isHolding && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </View>
      )}

      {/* 타이머 카운트다운 (중앙) */}
      {isHolding && (
        <View style={styles.timerOverlay} pointerEvents="none">
          <TimerDisplay progress={progress} durationMs={requiredDurationMs} />
        </View>
      )}

      {/* 성공 오버레이 */}
      {showSuccessOverlay && (
        <View style={styles.successOverlay} pointerEvents="none">
          <Text style={styles.successEmoji}>🎉</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{successQuestion}</Text>
          </View>
        </View>
      )}

      {/* 편지/쪽지 모달 */}
      <Modal
        visible={letterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseLetterModal}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleCloseLetterModal}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {status === 'AWAY' ? '물고기가 떠났어요' : '금붕어의 한마디'}
            </Text>
            <Text style={styles.modalBody}>
              {status === 'AWAY'
                ? '하루 동안 명상으로 먹이를 주지 않으면 물고기가 떠나요.\n\n다시 만나려면 2분 동안 명상을 완료해 주세요.'
                : noteMessage || '조금만 더 집중해봐요!'}
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={handleCloseLetterModal}
            >
              <Text style={styles.modalButtonText}>알겠어요</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** 타이머 숫자 표시 — 값이 변경될 때만 JS 스레드 업데이트 */
function TimerDisplay({
  progress,
  durationMs,
}: {
  progress: SharedValue<number>;
  durationMs: SharedValue<number>;
}) {
  const [seconds, setSeconds] = useState(60);
  const prevSeconds = useSharedValue(-1);

  useFrameCallback(() => {
    'worklet';
    const total = durationMs.value / 1000;
    const remaining = Math.ceil(total * (1 - progress.value));
    if (remaining !== prevSeconds.value) {
      prevSeconds.value = remaining;
      runOnJS(setSeconds)(remaining);
    }
  });

  return <Text style={styles.timerNumber}>{seconds}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    position: 'absolute',
    top: 56,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  statusText: {
    color: Colors.onSurfaceVariant,
    fontSize: FontSize.sm,
  },
  pointsText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  fish: {
    position: 'absolute',
    width: FISH_SIZE,
    height: FISH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishEmoji: {
    fontSize: 36,
  },
  noteContainer: {
    position: 'absolute',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  noteEmoji: {
    fontSize: 32,
  },
  noteText: {
    color: Colors.onSurfaceVariant,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    maxWidth: 120,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.outline,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  timerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerNumber: {
    fontSize: FontSize.timer,
    color: Colors.onSurface,
    fontWeight: '200',
    opacity: 0.6,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
  },
  bubble: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    maxWidth: 260,
  },
  bubbleText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: FontSize.md,
    color: Colors.background,
    fontWeight: '600',
  },
});
