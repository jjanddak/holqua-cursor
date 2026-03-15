# 현재 상태: v2.0 MVP 구현 완료

## 완료된 Phase

### Phase 1: 기초 인프라 전환
- Skia 제거 → View/Reanimated 기반 렌더링
- 다크 테마 (Deep Teal) 적용
- quotes.ts 50종+ 금붕어 멘트
- 더미 사운드 제거 + 명세서 작성
- canvaskit.wasm 제거 (웹 번들 84% 감소)

### Phase 2: 뽀모도로 타이머 + 시스템 기능
- usePomodoroTimer: 20분~4시간, 백그라운드 감지 → 즉시 실패
- PomodoroPanel: 설정 UI + PomodoroActiveOverlay
- useBurnInGuard: OLED 번인 방지 (5분 픽셀 시프팅)
- expo-keep-awake: 화면 유지
- 시간 비례 포인트 지급

### Phase 3: 연출 강화 + 방해금지 모드
- 실패 시 금붕어 놀람 (스케일 bounce + 페이드아웃 + 😱)
- 성공 시 먹이 투하 (🍞 낙하 애니메이션)
- useFocusMode: DND 설정 화면 열기

### Phase 4: 폴리싱
- 사운드 토글 UI (🔊/🔇)
- 성공 후 실패 중복 호출 버그 수정
- expo-av 미사용 패키지 제거
- 최종 코드 리뷰 반영

## 다음 작업 (향후)

### 에셋 교체 (우선순위 높음)
- 이모지 placeholder → 실제 픽셀아트 스프라이트
- 사운드 파일 추가 (SOUND_SPEC.md 참고)
- 도트 폰트 적용 (DungGeunMo 등)

### 기능 확장
- 상점 시스템 재구현 (스프라이트 스킨)
- 명상 통계 대시보드
- 소셜 기능

### 기술 부채
- AsyncStorage → MMKV 마이그레이션 (dev build 필요)
- expo-brightness로 실제 밝기 제어
- E2E 테스트 작성

## 파일 구조 요약
```
src/
├── components/
│   ├── TankCanvas.tsx        # 메인 화면 (명상 + 뽀모도로)
│   └── PomodoroPanel.tsx     # 뽀모도로 설정/진행 UI
├── store/
│   └── fishStore.ts          # Zustand (생존, 포인트, 뽀모도로)
├── hooks/
│   ├── useMeditationFeedback.ts  # 명상 진동 피드백
│   ├── usePomodoroTimer.ts       # 뽀모도로 엔진
│   ├── useBurnInGuard.ts         # OLED 번인 방지
│   └── useFocusMode.ts           # DND 안내
└── constants/
    ├── theme.ts              # 다크 컬러 스키마
    └── quotes.ts             # 50종+ 금붕어 멘트
```
