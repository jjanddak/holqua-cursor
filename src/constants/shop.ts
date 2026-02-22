import { Colors } from './theme';

/** 물고기 스킨 한 종목 */
export interface FishSkinItem {
  id: string;
  name: string;
  color: string;
  cost: number;
}

/** 수조 테마 한 종목 */
export interface TankThemeItem {
  id: string;
  name: string;
  gradientTop: string;
  gradientBottom: string;
  cost: number;
}

export const FISH_SKINS: FishSkinItem[] = [
  { id: 'default', name: '기본', color: Colors.primary, cost: 0 },
  { id: 'gold', name: '골드', color: '#E8B923', cost: 50 },
  { id: 'coral', name: '코랄', color: '#E85D5D', cost: 50 },
  { id: 'mint', name: '민트', color: '#6EC4A6', cost: 50 },
  { id: 'purple', name: '퍼플', color: '#8B5CB6', cost: 50 },
];

export const TANK_THEMES: TankThemeItem[] = [
  {
    id: 'default',
    name: '기본',
    gradientTop: Colors.tankGradientTop,
    gradientBottom: Colors.tankGradientBottom,
    cost: 0,
  },
  {
    id: 'sunset',
    name: '석양',
    gradientTop: '#FF9A6C',
    gradientBottom: '#FFE5D9',
    cost: 80,
  },
  {
    id: 'deep',
    name: '심해',
    gradientTop: '#1B4965',
    gradientBottom: '#5FA8D3',
    cost: 80,
  },
  {
    id: 'forest',
    name: '숲',
    gradientTop: '#40916C',
    gradientBottom: '#B7E4C7',
    cost: 80,
  },
];

export function getFishSkinById(id: string): FishSkinItem | undefined {
  return FISH_SKINS.find((s) => s.id === id);
}

export function getTankThemeById(id: string): TankThemeItem | undefined {
  return TANK_THEMES.find((t) => t.id === id);
}
