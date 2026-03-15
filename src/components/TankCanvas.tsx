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
  withTiming,
  withSequence,
  withDelay,
  type SharedValue,
} from 'react-native-reanimated';
import { useFishStore, calcPomodoroPoints } from '../store';
import { useMeditationFeedback, usePomodoroTimer, useBurnInGuard, useFocusMode } from '../hooks';
import { PomodoroPanel, PomodoroActiveOverlay } from './PomodoroPanel';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  getRandomSuccessQuote,
  getRandomFailQuote,
  getRandomAwayQuote,
  getRandomPomodoroQuote,
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
  const lastPomodoroDurationMs = useFishStore((s) => s.lastPomodoroDurationMs);
  const setLastPomodoroDuration = useFishStore((s) => s.setLastPomodoroDuration);
  const ambientSoundEnabled = useFishStore((s) => s.ambientSoundEnabled);
  const toggleAmbientSound = useFishStore((s) => s.toggleAmbientSound);

  const [isHolding, setIsHolding] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successQuestion, setSuccessQuestion] = useState('');
  const [letterModalVisible, setLetterModalVisible] = useState(false);
  const [awayQuote, setAwayQuote] = useState('');
  const [showPomodoroPanel, setShowPomodoroPanel] = useState(false);
  const [selectedPomodoroDuration, setSelectedPomodoroDuration] = useState(
    lastPomodoroDurationMs
  );
  const [fishScared, setFishScared] = useState(false);
  const [showFoodDrop, setShowFoodDrop] = useState(false);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const foodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 물고기 놀람 애니메이션 값
  const fishScale = useSharedValue(1);
  const fishOpacity = useSharedValue(1);
  // 먹이 투하 애니메이션 값
  const foodY = useSharedValue(-50);
  const foodOpacity = useSharedValue(0);

  const { onMeditationComplete } = useMeditationFeedback(isHolding);
  const { openDndSettings } = useFocusMode();

  // 뽀모도로 타이머
  const handlePomodoroSuccess = useCallback(() => {
    const bonus = calcPomodoroPoints(selectedPomodoroDuration);
    feed(bonus);
    setSuccessQuestion(getRandomPomodoroQuote());
    setShowSuccessOverlay(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(
      () => setShowSuccessOverlay(false),
      4000
    );
  }, [feed, selectedPomodoroDuration]);

  const handlePomodoroFail = useCallback(() => {
    setNote(getRandomFailQuote());
  }, [setNote]);

  const pomodoro = usePomodoroTimer(handlePomodoroSuccess, handlePomodoroFail);

  // 번인 방지 (뽀모도로 진행 중에만 활성)
  const { offsetX, offsetY } = useBurnInGuard(pomodoro.status === 'running');

  const burnInStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  // AWAY 상태 진입 시 한 번만 quote 생성
  useEffect(() => {
    if (status === 'AWAY') {
      setAwayQuote(getRandomAwayQuote());
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      if (scaredTimerRef.current) clearTimeout(scaredTimerRef.current);
      if (foodTimerRef.current) clearTimeout(foodTimerRef.current);
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
  const meditationSucceeded = useSharedValue(false);

  useEffect(() => {
    requiredDurationMs.value =
      status === 'AWAY' ? MEDITATION_AWAY_MS : MEDITATION_NORMAL_MS;
  }, [status]);

  useEffect(() => {
    fishX.value = width / 2;
    fishY.value = height / 2;
  }, [width, height]);

  const handleMeditationSuccess = useCallback(
    (_x: number, _y: number) => {
      onMeditationComplete();
      feed();
      setSuccessQuestion(getRandomSuccessQuote());

      // 먹이 투하 애니메이션
      setShowFoodDrop(true);
      foodY.value = -50;
      foodOpacity.value = 1;
      foodY.value = withTiming(height / 2 - 20, { duration: 800 });
      foodOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
      if (foodTimerRef.current) clearTimeout(foodTimerRef.current);
      foodTimerRef.current = setTimeout(() => setShowFoodDrop(false), 3000);

      // 성공 오버레이
      setShowSuccessOverlay(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(
        () => setShowSuccessOverlay(false),
        4000
      );
    },
    [onMeditationComplete, feed, height, foodY, foodOpacity]
  );

  const handleMeditationFail = useCallback(() => {
    setNote(getRandomFailQuote());

    // 물고기 놀람 → 사라짐 연출
    setFishScared(true);
    fishScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    fishOpacity.value = withDelay(400, withTiming(0, { duration: 300 }));
    if (scaredTimerRef.current) clearTimeout(scaredTimerRef.current);
    scaredTimerRef.current = setTimeout(() => {
      setFishScared(false);
      fishScale.value = 1;
      fishOpacity.value = 1;
    }, 1500);
  }, [setNote, fishScale, fishOpacity]);

  // === Pan Gesture ===
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      targetX.value = e.x;
      targetY.value = e.y;
      progress.value = 0;
      meditationSucceeded.value = false;
      runOnJS(setIsHolding)(true);
    })
    .onUpdate((e) => {
      targetX.value = e.x;
      targetY.value = e.y;
    })
    .onEnd(() => {
      if (!meditationSucceeded.value && progress.value < 1) {
        progress.value = 0;
        runOnJS(handleMeditationFail)();
      }
      meditationSucceeded.value = false;
      targetX.value = -1;
      targetY.value = -1;
      runOnJS(setIsHolding)(false);
    });

  // === 물고기 움직임 + 프로그레스 ===
  useFrameCallback((frame) => {
    'worklet';
    const t = frame.timestamp * 0.001;

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

    if (targetX.value >= 0) {
      const dt = frame.timeSincePreviousFrame ?? 16;
      progress.value = Math.min(
        1,
        progress.value + dt / requiredDurationMs.value
      );
      if (progress.value >= 1) {
        meditationSucceeded.value = true;
        runOnJS(handleMeditationSuccess)(fishX.value, fishY.value);
        progress.value = 0;
        targetX.value = -1;
        targetY.value = -1;
        runOnJS(setIsHolding)(false);
      }
    }
  });

  const fishStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: fishX.value - FISH_SIZE / 2 },
      { translateY: fishY.value - FISH_SIZE / 2 },
      { scale: fishScale.value },
    ],
    opacity: fishOpacity.value,
  }));

  const foodDropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: foodY.value }],
    opacity: foodOpacity.value,
  }));

  const progressBarWidth = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [0, width - Spacing.xl * 2])
  );

  const progressBarStyle = useAnimatedStyle(() => ({
    width: progressBarWidth.value,
  }));

  const handleCloseLetterModal = useCallback(() => {
    setLetterModalVisible(false);
    if (status !== 'AWAY') {
      clearNote();
    }
  }, [status, clearNote]);

  const handleStartPomodoro = useCallback(() => {
    setLastPomodoroDuration(selectedPomodoroDuration);
    setShowPomodoroPanel(false);
    pomodoro.start(selectedPomodoroDuration);
  }, [selectedPomodoroDuration, pomodoro, setLastPomodoroDuration]);

  const handleStopPomodoro = useCallback(() => {
    pomodoro.stop();
  }, [pomodoro]);

  // 뽀모도로 성공/실패 후 리셋
  useEffect(() => {
    if (pomodoro.status === 'success' || pomodoro.status === 'failed') {
      const timer = setTimeout(() => pomodoro.reset(), 100);
      return () => clearTimeout(timer);
    }
  }, [pomodoro.status]);

  // 뽀모도로 진행 중이면 전체 화면 오버레이
  if (pomodoro.status === 'running') {
    return (
      <Animated.View style={[{ flex: 1 }, burnInStyle]}>
        <PomodoroActiveOverlay
          remainingMs={pomodoro.remainingMs}
          progressRatio={pomodoro.progressRatio}
          onStop={handleStopPomodoro}
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.tankBg }]}>
      {/* 상태 표시 */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {streak > 0 ? `${streak}일 연속` : ''}
        </Text>
        <Text style={styles.pointsText}>{points}P</Text>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.actionButton}
          onPress={toggleAmbientSound}
        >
          <Text style={styles.actionButtonText}>
            {ambientSoundEnabled ? '🔊' : '🔇'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => setShowPomodoroPanel(true)}
        >
          <Text style={styles.actionButtonText}>⏱️ 집중</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          {status === 'NORMAL' && (
            <Animated.View style={[styles.fish, fishStyle]}>
              <Text style={styles.fishEmoji}>
                {fishScared ? '😱' : '🐠'}
              </Text>
            </Animated.View>
          )}

          {(status === 'AWAY' || hasNote) && (
            <Pressable
              style={[
                styles.noteContainer,
                { left: width / 2 - 60, top: height / 2 + 40 },
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

      {/* 명상 프로그레스 바 */}
      {isHolding && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </View>
      )}

      {/* 명상 타이머 카운트다운 */}
      {isHolding && (
        <View style={styles.timerOverlay} pointerEvents="none">
          <TimerDisplay progress={progress} durationMs={requiredDurationMs} />
        </View>
      )}

      {/* 먹이 투하 */}
      {showFoodDrop && (
        <Animated.View
          style={[styles.foodDrop, foodDropStyle]}
          pointerEvents="none"
        >
          <Text style={styles.foodEmoji}>🍞</Text>
        </Animated.View>
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

      {/* 뽀모도로 설정 패널 */}
      <PomodoroPanel
        visible={showPomodoroPanel}
        selectedDurationMs={selectedPomodoroDuration}
        onSelectDuration={setSelectedPomodoroDuration}
        onStart={handleStartPomodoro}
        onClose={() => setShowPomodoroPanel(false)}
        onOpenDnd={openDndSettings}
      />

      {/* 쪽지 모달 */}
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
  container: { flex: 1 },
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
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.md,
    gap: Spacing.sm,
    zIndex: 10,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  fish: {
    position: 'absolute',
    width: FISH_SIZE,
    height: FISH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishEmoji: { fontSize: 36 },
  noteContainer: {
    position: 'absolute',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  noteEmoji: { fontSize: 32 },
  foodDrop: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -16,
  },
  foodEmoji: { fontSize: 32 },
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
    ...StyleSheet.absoluteFillObject,
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: { fontSize: 64 },
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
