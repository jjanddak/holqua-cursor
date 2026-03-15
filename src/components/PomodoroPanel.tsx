import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants';

const DURATION_OPTIONS = [
  { label: '20분', ms: 20 * 60 * 1000 },
  { label: '45분', ms: 45 * 60 * 1000 },
  { label: '1시간', ms: 60 * 60 * 1000 },
  { label: '2시간', ms: 120 * 60 * 1000 },
  { label: '4시간', ms: 240 * 60 * 1000 },
];

interface PomodoroPanelProps {
  visible: boolean;
  selectedDurationMs: number;
  onSelectDuration: (ms: number) => void;
  onStart: () => void;
  onClose: () => void;
  onOpenDnd?: () => void;
}

export function PomodoroPanel({
  visible,
  selectedDurationMs,
  onSelectDuration,
  onStart,
  onClose,
  onOpenDnd,
}: PomodoroPanelProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.title}>집중 타이머</Text>
        <Text style={styles.subtitle}>
          시간을 선택하고 집중을 시작하세요
        </Text>

        <View style={styles.optionsRow}>
          {DURATION_OPTIONS.map((opt) => (
            <Pressable
              key={opt.ms}
              style={[
                styles.optionButton,
                selectedDurationMs === opt.ms && styles.optionButtonSelected,
              ]}
              onPress={() => onSelectDuration(opt.ms)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDurationMs === opt.ms && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={onOpenDnd}>
          <Text style={styles.dndHint}>
            집중 모드 중에는 앱을 벗어나면 실패합니다.{'\n'}
            <Text style={styles.dndLink}>방해금지 모드 설정 열기</Text>
          </Text>
        </Pressable>

        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>시작</Text>
        </Pressable>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>취소</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** 뽀모도로 진행 중 오버레이 */
export function PomodoroActiveOverlay({
  remainingMs,
  progressRatio,
  onStop,
}: {
  remainingMs: number;
  progressRatio: number;
  onStop: () => void;
}) {
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const percentDone = Math.floor(progressRatio * 100);

  return (
    <View style={styles.activeOverlay}>
      <Text style={styles.activeTimer}>{timeStr}</Text>
      <Text style={styles.activePercent}>{percentDone}%</Text>

      <View style={styles.activeProgressTrack}>
        <View
          style={[
            styles.activeProgressFill,
            { width: `${percentDone}%` as any },
          ]}
        />
      </View>

      <Text style={styles.activeHint}>화면을 벗어나면 실패합니다</Text>

      <Pressable style={styles.stopButton} onPress={onStop}>
        <Text style={styles.stopButtonText}>포기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingBottom: 48,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  optionTextSelected: {
    color: Colors.background,
    fontWeight: '600',
  },
  dndHint: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  dndLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  startButtonText: {
    fontSize: FontSize.lg,
    color: Colors.background,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.md,
    color: Colors.onSurfaceVariant,
  },
  // Active overlay
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.tankBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  activeTimer: {
    fontSize: 72,
    color: Colors.onSurface,
    fontWeight: '200',
    marginBottom: Spacing.sm,
  },
  activePercent: {
    fontSize: FontSize.lg,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xl,
  },
  activeProgressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.outline,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  activeProgressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  activeHint: {
    fontSize: FontSize.xs,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xl,
  },
  stopButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  stopButtonText: {
    fontSize: FontSize.md,
    color: Colors.secondary,
  },
});
