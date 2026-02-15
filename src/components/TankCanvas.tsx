import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useWindowDimensions,
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Canvas,
  Rect,
  LinearGradient,
  Path,
  Group,
  Ellipse,
  Skia,
  vec,
  useClock,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useFishStore } from '../store';
import { useMeditationFeedback } from '../hooks';
import { Colors, FontSize, Spacing, BorderRadius, getRandomProductivityQuestion } from '../constants';

const MEDITATION_NORMAL_MS = 60 * 1000;
const MEDITATION_AWAY_MS = 120 * 1000;
const PROGRESS_RING_R = 56;
const PROGRESS_STROKE = 8;

const FISH_BODY_RX = 20;
const FISH_BODY_RY = 10;
const FISH_TAIL_LEN = 18;
const FISH_SPEED = 2;
const MARGIN = 60;

function makeLetterIconPath(size: number) {
  const p = Skia.Path.Make();
  const w = size * 0.5;
  const h = size * 0.4;
  p.moveTo(0, 0);
  p.lineTo(w, 0);
  p.lineTo(w, h);
  p.lineTo(w / 2, h * 0.7);
  p.lineTo(0, h);
  p.close();
  return p;
}

const tailPath = (() => {
  const p = Skia.Path.Make();
  p.moveTo(0, -FISH_BODY_RY);
  p.lineTo(-FISH_TAIL_LEN, 0);
  p.lineTo(0, FISH_BODY_RY);
  p.close();
  return p;
})();

const letterPath = makeLetterIconPath(36);

/** 원형 프로그레스용 Path (중심 cx,cy 반지름 r) */
function makeCirclePath(cx: number, cy: number, r: number) {
  const p = Skia.Path.Make();
  p.addCircle(cx, cy, r);
  return p;
}

/**
 * 수조 배경 + 물고기/편지 아이콘 + 명상 Hold to Feed 원형 게이지.
 * 터치 시 물고기 추적, 누르고 있으면 게이지 상승(60초/120초 완료 시 feed).
 */
export function TankCanvas() {
  const { width, height } = useWindowDimensions();
  const status = useFishStore((s) => s.status);
  const feed = useFishStore((s) => s.feed);

  const [isHolding, setIsHolding] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successFishX, setSuccessFishX] = useState(0);
  const [successFishY, setSuccessFishY] = useState(0);
  const [successQuestion, setSuccessQuestion] = useState('');
  const [letterModalVisible, setLetterModalVisible] = useState(false);

  const { onMeditationComplete } = useMeditationFeedback(isHolding);

  const handleMeditationSuccess = useCallback(
    (x: number, y: number) => {
      onMeditationComplete();
      feed();
      setSuccessFishX(x);
      setSuccessFishY(y);
      setSuccessQuestion(getRandomProductivityQuestion());
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 4000);
    },
    [onMeditationComplete, feed]
  );

  const clock = useClock();
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
      }
      targetX.value = -1;
      targetY.value = -1;
      runOnJS(setIsHolding)(false);
    });

  useFrameCallback((frame) => {
    'worklet';
    const t = frame.timestamp * 0.001;
    if (targetX.value >= 0 && targetY.value >= 0) {
      const dx = targetX.value - fishX.value;
      const dy = targetY.value - fishY.value;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        fishAngle.value = Math.atan2(dy, dx);
        const vx = (dx / dist) * FISH_SPEED * 2;
        const vy = (dy / dist) * FISH_SPEED * 2;
        fishX.value += vx;
        fishY.value += vy;
      }
    } else {
      randomAngle.value += Math.sin(t * 2.3) * 0.08;
      const vx = Math.cos(randomAngle.value) * FISH_SPEED;
      const vy = Math.sin(randomAngle.value) * FISH_SPEED;
      fishX.value += vx;
      fishY.value += vy;
      fishAngle.value = randomAngle.value;
    }
    fishX.value = Math.max(MARGIN, Math.min(width - MARGIN, fishX.value));
    fishY.value = Math.max(MARGIN, Math.min(height - MARGIN, fishY.value));
  });

  useFrameCallback((frame) => {
    'worklet';
    if (targetX.value < 0) return;
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
  });

  useEffect(() => {
    fishX.value = width / 2;
    fishY.value = height / 2;
  }, [width, height]);

  const tailWiggle = useDerivedValue(
    () => Math.sin(clock.value / 200) * 0.35
  );

  const fishTransform = useDerivedValue(() => [
    { translateX: fishX.value },
    { translateY: fishY.value },
    { rotate: fishAngle.value },
  ]);

  const tailTransform = useDerivedValue(() => [
    { translateX: -FISH_BODY_RX },
    { translateY: 0 },
    { rotate: tailWiggle.value },
  ]);

  const letterX = width / 2 - 18;
  const letterY = height - 80;

  const progressCirclePath = useMemo(
    () => makeCirclePath(width / 2, height / 2, PROGRESS_RING_R),
    [width, height]
  );

  const SPARKLE_SIZE = 100;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={{ flex: 1, width, height }}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[Colors.tankGradientTop, Colors.tankGradientBottom]}
            />
          </Rect>
          {isHolding && (
            <Group>
              <Path
                path={progressCirclePath}
                style="stroke"
                strokeWidth={PROGRESS_STROKE}
                strokeCap="round"
                color={Colors.outline}
                opacity={0.5}
              />
              <Path
                path={progressCirclePath}
                style="stroke"
                strokeWidth={PROGRESS_STROKE}
                strokeCap="round"
                color={Colors.primary}
                start={0}
                end={progress}
              />
            </Group>
          )}
          {status === 'NORMAL' && (
            <Group transform={fishTransform} origin={{ x: 0, y: 0 }}>
              <Ellipse
                cx={0}
                cy={0}
                rx={FISH_BODY_RX}
                ry={FISH_BODY_RY}
                color={Colors.primary}
              />
              <Group transform={tailTransform} origin={{ x: 0, y: 0 }}>
                <Path path={tailPath} color={Colors.primary} />
              </Group>
            </Group>
          )}
          {status === 'AWAY' && (
            <Group
              transform={[{ translateX: letterX }, { translateY: letterY }]}
              origin={{ x: 18, y: 0 }}
            >
              <Path path={letterPath} color={Colors.onSurfaceVariant} />
            </Group>
          )}
        </Canvas>
      </GestureDetector>

      {status === 'AWAY' && (
        <Pressable
          style={[
            styles.letterTouchArea,
            {
              left: width / 2 - 40,
              top: height - 80 - 40,
            },
          ]}
          onPress={() => setLetterModalVisible(true)}
        />
      )}

      {showSuccessOverlay && (
        <View
          style={[
            styles.successOverlay,
            {
              left: successFishX - SPARKLE_SIZE / 2,
              top: successFishY - SPARKLE_SIZE - 60,
            },
          ]}
          pointerEvents="none"
        >
          <LottieView
            source={require('../../assets/lottie/sparkle.json')}
            autoPlay
            loop={false}
            style={{ width: SPARKLE_SIZE, height: SPARKLE_SIZE }}
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText} numberOfLines={2}>
              {successQuestion}
            </Text>
          </View>
        </View>
      )}

      <Modal
        visible={letterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLetterModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLetterModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>물고기가 떠났어요</Text>
            <Text style={styles.modalBody}>
              하루 동안 명상으로 먹이를 주지 않으면 물고기가 그만큼 멀어져요.
              {'\n\n'}
              다시 만나려면 2분 동안 잠깐 숨을 고르는 명상을 완료해 주세요.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setLetterModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>알겠어요</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  letterTouchArea: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  successOverlay: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
  },
  bubble: {
    marginTop: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BorderRadius.md,
    maxWidth: 200,
  },
  bubbleText: {
    fontSize: FontSize.sm,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    color: Colors.surface,
  },
});
