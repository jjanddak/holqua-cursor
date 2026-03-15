/**
 * Mindful Tank v2.0 디자인 가이드
 * 16-bit 레트로 픽셀아트 감성 — 다크 테마 (Deep Teal)
 */

export const Colors = {
  /** 수조 배경 (깊은 바다색 - OLED 효율) */
  tankBg: '#0A2A3A',
  /** 수조 배경 밝은 영역 */
  tankBgLight: '#133E52',

  /** 주요 액센트 (민트) */
  primary: '#4ECDC4',
  /** 보조 (코랄 - 경고/실패) */
  secondary: '#FF6B6B',

  /** 배경 기본 */
  background: '#0A1A2A',
  /** 카드/모달 배경 */
  surface: '#1A3A4A',
  /** 기본 텍스트 */
  onSurface: '#E8F4F8',
  /** 보조 텍스트 */
  onSurfaceVariant: '#7FBFCC',
  /** 비활성 */
  outline: '#2A4A5A',

  /** 성공 */
  success: '#45B7A0',
  /** 경고 */
  warning: '#F4A261',
  /** 위험 */
  danger: '#E76F51',
} as const;

export const FontFamily = {
  heading: 'System',
  body: 'System',
  mono: 'System',
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  timer: 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
