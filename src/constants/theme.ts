/**
 * Mindful Tank 앱 디자인 가이드
 * 메인 색상, 폰트 스타일 등 앱 전체에서 사용할 상수
 */

export const Colors = {
  /** 수조 배경 - 부드러운 파란색 그라데이션 (상단) */
  tankGradientTop: '#87CEEB',
  /** 수조 배경 - 부드러운 파란색 그라데이션 (하단) */
  tankGradientBottom: '#E0F4FF',
  /** 메인 강조색 (CTA, 성공 등) */
  primary: '#2E86AB',
  /** 보조 색상 */
  secondary: '#A23B72',
  /** 배경 기본 */
  background: '#F8FAFC',
  /** 카드/모달 배경 */
  surface: '#FFFFFF',
  /** 기본 텍스트 */
  onSurface: '#1E293B',
  /** 보조 텍스트 */
  onSurfaceVariant: '#64748B',
  /** 비활성 */
  outline: '#CBD5E1',
  /** 성공 (명상 완료 등) */
  success: '#059669',
  /** 경고 */
  warning: '#D97706',
} as const;

export const FontFamily = {
  /** 제목, 강조용 */
  heading: 'System',
  /** 본문 */
  body: 'System',
  /** 숫자/타이머 등 */
  mono: 'System',
} as const;

export const FontSize = {
  /** 작은 라벨, 캡션 */
  xs: 12,
  /** 본문 보조 */
  sm: 14,
  /** 본문 */
  md: 16,
  /** 소제목 */
  lg: 18,
  /** 제목 */
  xl: 20,
  /** 대제목 */
  xxl: 24,
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
