# Mindful Tank v2.0 — 개발 문서

## 1. 프로젝트 개요

**프로젝트명**: Mindful Tank (홀쿠아)
**목적**: 둠스크롤링/ADHD성 집중력 저하를 해결하는 정서적 도파민 차단 앱
**핵심 가치**: 금붕어와의 정서적 유대감을 통해 스스로 스마트폰을 내려놓게 만듦
**비주얼**: 16-bit 레트로 픽셀아트 (인세인 아쿠아리움 감성)
**플랫폼**: iOS, Android, Web

---

## 2. 핵심 기능

### 2.1 1분 명상 모드 (Mindful Pause)
- **진입**: 수족관 화면 중앙을 꾹 누름 (Long Press)
- **진행**: 60초 카운트다운, 금붕어가 터치 지점으로 다가와 맴돔, 백색소음 재생
- **성공**: 강한 진동 + 먹이 투하 애니메이션 + 금붕어 랜덤 메시지
- **실패**: 금붕어가 놀라 사라짐, 바닥에 쪽지 "자리를 비울게요"

### 2.2 금붕어 뽀모도로 (Dot-moro)
- **설정**: 집중 시간 선택 (20분~4시간)
- **활성화**: 방해금지 모드 연동 안내 + 사운드 토글
- **유지**: 10초 후 OLED 번인 방지 (밝기 저하 + 픽셀 시프팅)
- **성공**: 대량 먹이 보상 + 특별 칭찬 멘트
- **실패**: 앱 이탈 5초 유예 후 금붕어 가출 + 쪽지

### 2.3 쪽지 시스템
- 실패 시 금붕어 대신 바닥에 도트 쪽지 아이콘
- 새 명상/뽀모도로 성공 전까지 영구 유지 → 심리적 부채감

### 2.4 상점 시스템
- 명상 성공: 10P, 뽀모도로 성공: 시간 비례 포인트
- 물고기 스킨 (픽셀아트), 수조 배경 테마 구매

---

## 3. 기술 스택

| 구분 | 기술 | 용도 |
|------|------|------|
| Framework | Expo ~54 (Managed) | 빌드, 네이티브 API |
| Graphics | @shopify/react-native-skia | 픽셀아트 스프라이트 렌더링 |
| Animation | react-native-reanimated 4 | UI 스레드 60fps 물고기 움직임 |
| Gesture | react-native-gesture-handler | Long Press, Pan |
| State | Zustand 5 | 상태관리 |
| Storage | react-native-mmkv | 고속 로컬 영속화 |
| Sound | expo-av | ASMR, 효과음 |
| Haptic | expo-haptics | 진동 피드백 |
| Lottie | lottie-react-native | 먹이 투하, 반짝이 효과 |
| Font | expo-font | 도트 폰트 로딩 |

---

## 4. 디렉토리 구조

```
holqua/
├── App.tsx                         # 네이티브 진입점
├── App.web.tsx                     # 웹 진입점 (Skia WASM)
├── AppContent.tsx                  # 공통 초기화 (폰트, Reanimated)
│
├── src/
│   ├── components/
│   │   ├── TankCanvas.tsx          # 메인 화면 (단일 화면 원칙)
│   │   ├── ShopModal.tsx           # 상점 모달
│   │   └── PomodoroPanel.tsx       # 뽀모도로 타이머 설정 UI [신규]
│   │
│   ├── store/
│   │   └── fishStore.ts            # Zustand + MMKV (생존, 포인트, 뽀모도로)
│   │
│   ├── hooks/
│   │   ├── useMeditationFeedback.ts  # 명상/뽀모도로 사운드+진동
│   │   ├── usePomodoroTimer.ts       # 뽀모도로 타이머 엔진 [신규]
│   │   ├── useBurnInGuard.ts         # OLED 번인 방지 [신규]
│   │   └── useFocusMode.ts          # 방해금지 모드 안내 [신규]
│   │
│   ├── constants/
│   │   ├── theme.ts                # 다크 컬러 스키마 + 도트 폰트
│   │   ├── shop.ts                 # 상품 데이터 (픽셀아트 스킨)
│   │   └── quotes.ts              # 금붕어 멘트 50종+ [신규]
│   │
│   └── engine/                     # 게임 로직 (향후)
│
├── assets/
│   ├── sprites/                    # 픽셀아트 스프라이트 [신규]
│   │   ├── fish-default.png
│   │   ├── fish-gold.png
│   │   ├── bg-default.png
│   │   └── bg-sunset.png
│   ├── fonts/                      # 도트 폰트 [신규]
│   │   └── DungGeunMo.ttf
│   ├── sounds/
│   │   ├── water.mp3
│   │   ├── bell.mp3
│   │   ├── fail.mp3                # [신규]
│   │   └── pomodoro-done.mp3       # [신규]
│   └── lottie/
│       ├── sparkle.json
│       └── food-drop.json          # [신규]
│
└── docs/
    ├── DEVELOPMENT_PLAN.md         # 개발 계획 (Phase 1~4)
    ├── DEVELOPMENT_DOC.md          # 이 문서
    ├── PRD.md                      # 기획서 원본
    └── QUESTIONS.md                # 미결 질문/결정사항
```

---

## 5. 상태 구조 (Zustand)

```typescript
interface FishState {
  // === 생존 ===
  status: 'NORMAL' | 'AWAY'
  lastFedTime: number
  streak: number

  // === 경제 ===
  points: number
  fishSkinId: string
  tankThemeId: string
  purchasedFishSkins: string[]
  purchasedTankThemes: string[]

  // === 뽀모도로 [신규] ===
  pomodoroActive: boolean
  pomodoroStartTime: number
  pomodoroDurationMs: number        // 20분~4시간
  pomodoroSoundEnabled: boolean

  // === 설정 [신규] ===
  ambientSoundEnabled: boolean

  // === 액션 ===
  checkStatus: () => void
  feed: (bonusPoints?: number) => void
  startPomodoro: (durationMs: number) => void
  endPomodoro: (success: boolean) => void
  purchaseFishSkin: (id: string, cost: number) => boolean
  purchaseTankTheme: (id: string, cost: number) => boolean
  setFishSkin: (id: string) => void
  setTankTheme: (id: string) => void
  toggleAmbientSound: () => void
}
```

---

## 6. 디자인 가이드라인

### 컬러 스키마 (다크 테마)
```typescript
Colors = {
  // 배경 (Deep Teal 계열 - OLED 효율)
  tankBg: '#0A2A3A',              // 깊은 바다색
  tankBgLight: '#133E52',         // 밝은 바다색

  // UI
  primary: '#4ECDC4',             // 민트 (주요 액센트)
  secondary: '#FF6B6B',           // 코랄 (경고/실패)
  surface: '#1A3A4A',             // 카드/모달 배경
  onSurface: '#E8F4F8',           // 텍스트
  onSurfaceVariant: '#7FBFCC',    // 보조 텍스트

  // 상태
  success: '#45B7A0',
  warning: '#F4A261',
  danger: '#E76F51',
}
```

### 폰트
- **도트 폰트**: 둥근모(DungGeunMo) 또는 동급 오픈소스
- **모든 UI 텍스트**에 적용 (숫자 포함)

### 비주얼 레퍼런스
- 인세인 아쿠아리움 (Insane Aquarium) 도트 감성
- 16-bit 레트로 픽셀아트
- 스프라이트시트 기반 프레임 애니메이션

---

## 7. 사용자 시나리오

### 시나리오 A: 일반 명상
```
앱 실행 → 물고기 유영 중 → 화면 꾹 누름 →
물소리 재생 + 게이지 시작 → 60초 유지 →
먹이 투하 + 종소리 + 진동 + 금붕어 멘트 →
+10P, +1 streak
```

### 시나리오 B: 명상 실패
```
화면 꾹 누름 → 30초에서 손 뗌 →
금붕어 놀라서 사라짐 (scared 스프라이트) →
바닥에 쪽지 표시 "자리를 비울게요" →
다음 성공까지 쪽지 유지
```

### 시나리오 C: 뽀모도로 성공
```
타이머 45분 설정 → 시작 →
10초 후 밝기 10%로 자동 저하 →
45분 유지 (앱 이탈 없음) →
대량 먹이 + 특별 칭찬 + 대량 포인트 →
밝기 복원
```

### 시나리오 D: 뽀모도로 실패
```
타이머 20분 설정 → 시작 →
10분에 앱 이탈 → 5초 유예 카운트 →
복귀 안 함 → 금붕어 가출 →
status = 'AWAY' + 바닥에 쪽지
```

### 시나리오 E: 24시간 미접속
```
앱 재실행 → checkStatus() →
status = 'AWAY', streak = 0 →
물고기 없음 + 쪽지만 표시 →
120초 명상 성공 시 복귀
```

---

## 8. 커밋 히스토리 (v1.0)

| 커밋 | 내용 |
|------|------|
| bd44cf7 | Initial commit |
| e97c15d | Step 1: 폴더 구조 + TankCanvas |
| d747df8 | Step 2: 생존 주기 + 상태 |
| 76dc6d9 | Step 3: Skia 물고기 애니메이션 |
| 2225ad0 | Step 4: 명상 타이머 (Hold to Feed) |
| 45526ea | Step 5: 오감 피드백 |
| 4dc6b2d | Step 6: Lottie + 생산성 리마인더 |
| 378f2af | Step 7: 상점 시스템 |
| 2f16df0 | Reanimated 오류 수정 |

v2.0 커밋은 Phase 단위로 작성.
