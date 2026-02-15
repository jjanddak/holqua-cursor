# Mindful Tank — 개발 단계 및 아키텍처

> 둠스크롤링 방지용 명상 앱. 다른 AI 에이전트가 이 문서를 보고 단계별로 이어서 개발할 수 있도록 작성함.

---

## 1. 기술 스택

| 구분 | 기술 |
|------|------|
| **Graphics** | React Native Skia (`@shopify/react-native-skia`) |
| **Animation** | Reanimated 3 (`react-native-reanimated`) |
| **State** | Zustand |
| **UI** | React Native Paper 또는 기본 컴포넌트 |

---

## 2. 폴더 구조

```
/src
├── components/   # UI 컴포넌트 (TankCanvas, 물고기, 모달 등)
├── hooks/        # 커스텀 훅 (useMeditationFeedback 등)
├── store/        # Zustand 스토어 (생존 상태, 포인트, 상점 등)
├── engine/       # 게임/로직 엔진 (필요 시)
├── assets/       # 이미지, 사운드, Lottie JSON
└── constants/    # 디자인 가이드 (theme.ts: Colors, FontSize 등)
```

- **디자인 상수**: `src/constants/theme.ts` — 앱 전체 색상·폰트·간격·모서리 반경
- **메인 캔버스**: `src/components/TankCanvas.tsx` — Skia 수조 배경(파란 그라데이션)

---

## 3. 개발 단계 (7단계)

### Step 1 ✅ 완료
- `/src` 아래 `components`, `hooks`, `store`, `engine`, `assets`, `constants` 구조 생성
- Skia로 수조 배경(부드러운 파란 그라데이션) 메인 Canvas 컴포넌트 작성
- 디자인 가이드: `src/constants/theme.ts` (메인 색상, 폰트 스타일)

### Step 2 ✅ 완료
- **물고기 생존 상태 (Zustand)** — `src/store/fishStore.ts`
  - 상태: `NORMAL`(생존), `AWAY`(떠남)
  - 데이터: `lastFedTime`(타임스탬프), `streak`(연속일수)
  - `checkStatus()`: 앱 실행 시(재수화 완료 후) 현재 시간과 `lastFedTime` 비교 → 24시간 경과 시 `status = AWAY`, `streak = 0`
  - `feed()`: 명상 성공 시 호출 (status NORMAL, lastFedTime 갱신, streak+1)
  - **AsyncStorage** persist (`mindful-tank-fish`)로 앱 재시작 후에도 상태 유지
  - `App.tsx`에서 `useFishStore` 구독으로 앱 로드 시 재수화 및 `checkStatus` 실행

### Step 3 ✅ 완료
- **Skia 물고기 애니메이션** — `src/components/TankCanvas.tsx` (통합)
  - Ellipse + Path로 단순 물고기 형태, 꼬리 살랑거림(useClock + useDerivedValue, Math.sin)
  - 평소 시간 기반으로 방향 변경하며 헤엄, **Pan 제스처로 터치한 위치 추적(Follow)**
  - `status === AWAY`일 때: 물고기 숨김, 바닥 중앙에 **작은 편지(봉투) 아이콘** Path로 표시
  - `react-native-gesture-handler` 설치, `GestureHandlerRootView`로 앱 루트 래핑

### Step 4 ✅ 완료
- **명상 타이머 (Hold to Feed)** — `src/components/TankCanvas.tsx`
  - Pan 제스처로 화면 누르는 동안 Skia **원형 프로그레스** 게이지 상승 (Path stroke + start/end trim)
  - NORMAL: **60초**, AWAY: **120초** 유지 시 성공 시 `feed()` 호출
  - 손 떼면 게이지 0으로 초기화, 성공 시 target 초기화 및 `setIsHolding(false)`
  - `isHolding` 상태로 누르고 있을 때만 원형 링 표시

### Step 5
- **오감 피드백**
  - `expo-haptics`: 명상 중 10초마다 짧은 진동(Selection), 완료 시 강한 진동(NotificationSuccess)
  - `expo-av`: 명상 중 잔잔한 물소리(ASMR) 루프, 완료 시 맑은 종소리
  - **사운드**: 터치 시점 지연 방지를 위해 **미리 로드(Pre-load)** 권장
  - 모든 로직을 **`useMeditationFeedback`** 커스텀 훅으로 관리

### Step 6
- **Lottie + 생산성 리마인더**
  - `lottie-react-native`: 명상 성공 시 물고기 위 **반짝이는 효과** + **말풍선**
  - 말풍선: "오늘의 목표는 무엇인가요?", "지금 바로 해야 할 일은?" 등 **랜덤 생산성 질문**
  - AWAY 시 편지 클릭 → 물고기가 떠난 이유·다시 불러오는 법 안내 **감성 메시지 창**

### Step 7
- **상점 시스템**
  - 명상 성공 시 **Point** 재화 → Zustand 스토어
  - 포인트로 **물고기 색상** 변경, **수조 배경 테마** 변경 가능한 상점 모달
  - 선택한 스킨이 Skia 물고기·수조 렌더링에 **실시간 반영**

---

## 4. 아키텍처 요약

- **상태**: Zustand 스토어에서 생존 상태(status, lastFedTime, streak), 포인트, 상점 스킨 등 관리
- **영속화**: AsyncStorage로 생존 관련 상태만 저장 (재시작 후 복원)
- **렌더링**: 메인 화면은 Skia Canvas 한 장 위에 수조 배경 + 물고기 + (AWAY 시 편지 아이콘) 그리기
- **명상 플로우**: GestureDetector → 게이지 진행 → 성공 시 feed 이벤트 → 스토어 업데이트(lastFedTime, streak, 포인트) + 사운드/진동/Lottie
- **다국어**: UI 텍스트 추가/변경 시 지원하는 **모든 언어 파일**에 동기화 (규칙 참고)

---

## 5. 참고 사항

- **Babel**: `react-native-reanimated/plugin`이 `babel.config.js`에 **마지막**에 등록되어 있음
- **Lottie**: LottieFiles에서 'Sparkle', 'Bubble' 등 무료 JSON 미리 준비 권장
- **커밋/설명**: 한글로 작성

---

## 6. 현재 구현된 파일 (참고)

| 경로 | 설명 |
|------|------|
| `docs/DEVELOPMENT_PLAN.md` | 이 문서 |
| `src/constants/theme.ts` | Colors, FontSize, Spacing 등 |
| `src/components/TankCanvas.tsx` | Skia 수조 배경 그라데이션 |
| `src/store/fishStore.ts` | 생존 상태(NORMAL/AWAY), lastFedTime, streak, checkStatus, feed, AsyncStorage persist |
| `App.tsx` | GestureHandlerRootView, TankCanvas, useFishStore 구독 |
| `src/components/TankCanvas.tsx` | 수조 배경 + 물고기(꼬리 흔들림, 터치 추적) + AWAY 시 편지 아이콘 |

이 문서를 기준으로 Step 5부터 순서대로 구현하면 됨.
