# Mindful Tank v2.0 — 개발 계획서

> 16-bit 레트로 픽셀아트 감성의 도파민 차단 앱.
> PRD 기반 전면 리뉴얼. 이 문서를 기준으로 Phase별 순서대로 구현.

---

## 1. 기술 스택

| 구분 | 기존 | 변경 |
|------|------|------|
| Graphics | React Native Skia (벡터) | Skia Image (픽셀아트 스프라이트) |
| Animation | Reanimated 3 | Reanimated 3 (유지) |
| State | Zustand | Zustand (유지) |
| Storage | AsyncStorage | **react-native-mmkv** |
| Sound | expo-av | expo-av (유지) |
| Haptic | expo-haptics | expo-haptics (유지) |
| Font | System | **도트 폰트 (DungGeunMo 등)** |
| Timer | 60초 명상만 | 명상 + **뽀모도로 (20분~4시간)** |

---

## 2. Phase 구조 (4 Phase)

### Phase 1: 기초 인프라 전환
> 기존 코드의 기반을 새 스택으로 마이그레이션

| Task | 파일 | 내용 |
|------|------|------|
| 1-1 | `package.json` | react-native-mmkv, expo-font 추가 |
| 1-2 | `src/store/fishStore.ts` | AsyncStorage → MMKV 교체 |
| 1-3 | `src/constants/theme.ts` | 도트 폰트 FontFamily 추가, 다크 컬러 스키마 적용 |
| 1-4 | `assets/fonts/` | 둥근모 또는 Pixelify Sans TTF 배치 |
| 1-5 | `app.json` | 폰트 로딩 설정 |
| 1-6 | `AppContent.tsx` | expo-font 로딩 대기 로직 |

**완료 기준**: MMKV로 상태 저장/복원 정상 동작, 도트 폰트 텍스트 렌더링 확인

---

### Phase 2: 핵심 비주얼 & 인터랙션 리뉴얼
> 벡터 → 픽셀아트 전환, 쪽지 시스템 강화, quotes 시스템

| Task | 파일 | 내용 |
|------|------|------|
| 2-1 | `assets/sprites/` | 물고기 스프라이트시트 (idle, swim, eat, scared) 배치 |
| 2-2 | `assets/sprites/` | 배경 픽셀아트 (바다, 바닥, 장식) 배치 |
| 2-3 | `src/components/TankCanvas.tsx` | Skia Oval/Path → Skia Image 스프라이트 렌더링 전환 |
| 2-4 | `src/components/TankCanvas.tsx` | 배경 그라데이션 → 픽셀아트 배경 이미지 교체 |
| 2-5 | `src/constants/quotes.ts` | 50종+ 금붕어 멘트 데이터 (성공/실패/업적/일상) |
| 2-6 | `src/components/TankCanvas.tsx` | 실패 시 쪽지 시스템 강화: 금붕어 놀라 사라짐 + 바닥에 쪽지 표시 |
| 2-7 | `assets/lottie/food-drop.json` | 먹이 투하 애니메이션 |
| 2-8 | `src/components/TankCanvas.tsx` | 성공 시 먹이 투하 + 먹는 애니메이션 연출 |

**완료 기준**: 픽셀아트 물고기가 유영, 명상 성공/실패 시 새 연출 동작, quotes 랜덤 출력

---

### Phase 3: 뽀모도로 & 시스템 기능
> Dot-moro 타이머, OLED 보호, 방해금지 모드

| Task | 파일 | 내용 |
|------|------|------|
| 3-1 | `src/store/fishStore.ts` | 뽀모도로 상태 추가 (pomodoroMode, duration, startTime) |
| 3-2 | `src/components/PomodoroPanel.tsx` | 타이머 설정 UI (20분/45분/1시간/2시간/4시간 선택) |
| 3-3 | `src/components/TankCanvas.tsx` | 뽀모도로 활성 시 화면 전환 (타이머 숫자 표시, 물고기 유영 유지) |
| 3-4 | `src/hooks/usePomodoroTimer.ts` | 타이머 엔진 (백그라운드 유지, 앱 이탈 감지) |
| 3-5 | `src/hooks/useBurnInGuard.ts` | OLED 번인 방지: 10초 후 밝기 10%, 5분마다 픽셀 시프팅 |
| 3-6 | `src/hooks/useFocusMode.ts` | 방해금지 모드 연동 안내 (expo-intent-launcher) |
| 3-7 | `src/hooks/useMeditationFeedback.ts` | 뽀모도로 완료/실패 시 별도 사운드 + 진동 패턴 |
| 3-8 | `src/components/TankCanvas.tsx` | 뽀모도로 실패 시 금붕어 가출 + 쪽지 시스템 연동 |

**완료 기준**: 뽀모도로 시작→유지→성공/실패 전체 플로우 동작, 번인 방지 작동, DND 안내 표시

---

### Phase 4: 통합 & 폴리싱
> 상점 확장, 사운드 토글, 최종 QA

| Task | 파일 | 내용 |
|------|------|------|
| 4-1 | `src/components/ShopModal.tsx` | 상점에 새 스프라이트 스킨 반영, 수조 배경 테마 교체 |
| 4-2 | `src/constants/shop.ts` | 새 상품 데이터 (픽셀아트 스킨, 배경) |
| 4-3 | `src/components/TankCanvas.tsx` | Ambient Sound ON/OFF 토글 UI |
| 4-4 | `src/store/fishStore.ts` | 뽀모도로 보상 포인트 체계 (시간 비례) |
| 4-5 | 전체 | E2E 테스트 (명상 플로우, 뽀모도로 플로우, 상점 구매) |
| 4-6 | 전체 | iOS/Android/Web 크로스플랫폼 검증 |

**완료 기준**: 전체 시나리오 통과, 3개 플랫폼 정상 동작

---

## 3. 에셋 목록 (준비 필요)

### 필수 에셋
| 에셋 | 경로 | 형식 | 용도 |
|------|------|------|------|
| 물고기 스프라이트시트 | `assets/sprites/fish-default.png` | PNG | idle/swim/eat/scared 프레임 |
| 배경 이미지 | `assets/sprites/bg-default.png` | PNG | 16-bit 바다 배경 |
| 도트 폰트 | `assets/fonts/DungGeunMo.ttf` | TTF | UI 전체 |
| 먹이 투하 | `assets/lottie/food-drop.json` | Lottie | 성공 시 먹이 |
| 실패 사운드 | `assets/sounds/fail.mp3` | MP3 | 실패 시 효과음 |
| 뽀모도로 완료음 | `assets/sounds/pomodoro-done.mp3` | MP3 | 타이머 완료 |

### 추가 스킨 (Phase 4)
| 에셋 | 경로 | 용도 |
|------|------|------|
| 골드 물고기 | `assets/sprites/fish-gold.png` | 상점 스킨 |
| 코랄 물고기 | `assets/sprites/fish-coral.png` | 상점 스킨 |
| 석양 배경 | `assets/sprites/bg-sunset.png` | 상점 테마 |
| 심해 배경 | `assets/sprites/bg-deep.png` | 상점 테마 |

---

## 4. 병렬 작업 가능 매트릭스

```
Phase 1: [1-1,1-2] → [1-3,1-4,1-5] → [1-6]
          순차         병렬              순차

Phase 2: [2-1,2-2,2-5,2-7] → [2-3,2-4] → [2-6,2-8]
          병렬(에셋+데이터)    병렬(렌더링)   병렬(연출)

Phase 3: [3-1] → [3-2,3-4,3-5,3-6] → [3-3,3-7,3-8]
          순차    병렬(독립 모듈)        병렬(통합)

Phase 4: [4-1,4-2,4-3,4-4] → [4-5] → [4-6]
          병렬                 순차      순차
```

---

## 5. 아키텍처

```
┌───────────────────────────────────────────────┐
│            AppContent.tsx                     │
│  - Font 로딩 대기                            │
│  - Reanimated 초기화                         │
│  - GestureHandlerRootView                    │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│          TankCanvas.tsx (단일 화면)           │
│                                               │
│  ┌─────────────┐  ┌──────────────┐           │
│  │ Skia Canvas  │  │  Overlays    │           │
│  │ - 배경(픽셀) │  │ - 뽀모도로UI│           │
│  │ - 물고기     │  │ - 쪽지       │           │
│  │ - 먹이       │  │ - Lottie     │           │
│  │ - 게이지     │  │ - 상점모달   │           │
│  └─────────────┘  └──────────────┘           │
└──────────────────┬────────────────────────────┘
                   ↓
┌────────────┐ ┌────────────┐ ┌────────────────┐
│ fishStore  │ │ Hooks      │ │ Constants      │
│ (Zustand)  │ │            │ │                │
│ - status   │ │ - feedback │ │ - quotes.ts    │
│ - points   │ │ - pomodoro │ │ - theme.ts     │
│ - pomodoro │ │ - burnIn   │ │ - shop.ts      │
│ - MMKV     │ │ - focus    │ │                │
└────────────┘ └────────────┘ └────────────────┘
```

---

## 6. 에이전트 실행 전략

각 Phase 시작 시 Admin Agent가 다음 패턴으로 실행:

1. **구현 에이전트** (worktree isolation) — 병렬 가능한 Task를 동시 투입
2. **리뷰 에이전트** — 구현 결과물 코드 품질/로직 검증
3. **수정 요청** — 문제 발견 시 구현 에이전트에 피드백
4. **테스트 에이전트** — 빌드 + 유닛 테스트 + 시나리오 검증
5. **병합** — 모든 검증 통과 시 메인 브랜치 반영

---

## 7. 현재 상태

- **v1.0 (Step 1~7)**: 완료 (Skia 벡터 기반)
- **v2.0 시작점**: 이 문서의 Phase 1부터
- **다음 실행할 Phase**: Phase 1 (기초 인프라 전환)
