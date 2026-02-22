import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFishStore } from '../store';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  FISH_SKINS,
  TANK_THEMES,
  type FishSkinItem,
  type TankThemeItem,
} from '../constants';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
}

function FishSkinRow({
  item,
  isSelected,
  isOwned,
  points,
  onSelect,
  onPurchase,
}: {
  item: FishSkinItem;
  isSelected: boolean;
  isOwned: boolean;
  points: number;
  onSelect: () => void;
  onPurchase: () => void;
}) {
  const canBuy = item.cost <= points;
  return (
    <View style={styles.row}>
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <Text style={styles.rowLabel}>{item.name}</Text>
      <View style={styles.rowRight}>
        {isSelected ? (
          <Text style={styles.appliedText}>적용됨</Text>
        ) : isOwned ? (
          <Pressable style={styles.selectButton} onPress={onSelect}>
            <Text style={styles.selectButtonText}>선택</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.buyButton, !canBuy && styles.buyButtonDisabled]}
            onPress={onPurchase}
            disabled={!canBuy}
          >
            <Text style={styles.buyButtonText}>{item.cost} P</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function TankThemeRow({
  item,
  isSelected,
  isOwned,
  points,
  onSelect,
  onPurchase,
}: {
  item: TankThemeItem;
  isSelected: boolean;
  isOwned: boolean;
  points: number;
  onSelect: () => void;
  onPurchase: () => void;
}) {
  const canBuy = item.cost <= points;
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.themePreview,
          { backgroundColor: item.gradientTop },
        ]}
      />
      <Text style={styles.rowLabel}>{item.name}</Text>
      <View style={styles.rowRight}>
        {isSelected ? (
          <Text style={styles.appliedText}>적용됨</Text>
        ) : isOwned ? (
          <Pressable style={styles.selectButton} onPress={onSelect}>
            <Text style={styles.selectButtonText}>선택</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.buyButton, !canBuy && styles.buyButtonDisabled]}
            onPress={onPurchase}
            disabled={!canBuy}
          >
            <Text style={styles.buyButtonText}>{item.cost} P</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function ShopModal({ visible, onClose }: ShopModalProps) {
  const points = useFishStore((s) => s.points);
  const fishSkinId = useFishStore((s) => s.fishSkinId);
  const tankThemeId = useFishStore((s) => s.tankThemeId);
  const purchasedFishSkins = useFishStore((s) => s.purchasedFishSkins);
  const purchasedTankThemes = useFishStore((s) => s.purchasedTankThemes);
  const purchaseFishSkin = useFishStore((s) => s.purchaseFishSkin);
  const purchaseTankTheme = useFishStore((s) => s.purchaseTankTheme);
  const setFishSkin = useFishStore((s) => s.setFishSkin);
  const setTankTheme = useFishStore((s) => s.setTankTheme);

  const isFishSkinOwned = (id: string) => id === 'default' || purchasedFishSkins.includes(id);
  const isTankThemeOwned = (id: string) => id === 'default' || purchasedTankThemes.includes(id);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>상점</Text>
            <Text style={styles.points}>포인트: {points} P</Text>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>물고기 색상</Text>
            {FISH_SKINS.map((item) => (
              <FishSkinRow
                key={item.id}
                item={item}
                isSelected={fishSkinId === item.id}
                isOwned={isFishSkinOwned(item.id)}
                points={points}
                onSelect={() => setFishSkin(item.id)}
                onPurchase={() => purchaseFishSkin(item.id, item.cost)}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
              수조 배경 테마
            </Text>
            {TANK_THEMES.map((item) => (
              <TankThemeRow
                key={item.id}
                item={item}
                isSelected={tankThemeId === item.id}
                isOwned={isTankThemeOwned(item.id)}
                points={points}
                onSelect={() => setTankTheme(item.id)}
                onPurchase={() => purchaseTankTheme(item.id, item.cost)}
              />
            ))}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    maxWidth: 360,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  points: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  scroll: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  themePreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
  rowRight: {
    marginLeft: Spacing.sm,
  },
  appliedText: {
    fontSize: FontSize.sm,
    color: Colors.success,
  },
  selectButton: {
    backgroundColor: Colors.outline,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  selectButtonText: {
    fontSize: FontSize.sm,
    color: Colors.onSurface,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  buyButtonText: {
    fontSize: FontSize.sm,
    color: Colors.surface,
  },
  closeButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.outline,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
});
