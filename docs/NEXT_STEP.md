# 다음 단계: Step 7 완료

## 완료된 작업: **Step 7 — 상점 시스템** ✅

- 명상 성공 시 **Point** 재화(1회 10P) → Zustand 스토어 + AsyncStorage 영속화
- **상점** 버튼(우측 상단) → 상점 모달: 포인트 표시, 물고기 스킨(기본/골드/코랄/민트/퍼플), 수조 테마(기본/석양/심해/숲) 구매·선택
- 선택한 스킨·테마가 Skia 물고기·수조 렌더링에 **실시간 반영**

## 참고

- 전체 단계·아키텍처: `docs/DEVELOPMENT_PLAN.md`
- 스토어: `src/store/fishStore.ts` (points, fishSkinId, tankThemeId, purchasedFishSkins, purchasedTankThemes)
- 상점 상수: `src/constants/shop.ts`, UI: `src/components/ShopModal.tsx`
- Skia API: `Ellipse` → `Oval` 사용 (x, y, width, height)
