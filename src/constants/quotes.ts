/**
 * 금붕어 멘트 시스템
 * 상황별 랜덤 메시지 출력
 */

/** 명상 성공 시 금붕어가 하는 말 */
export const SUCCESS_QUOTES = [
  '오늘의 목표는 무엇인가요?',
  '지금 바로 해야 할 일은?',
  '오늘 하나만 끝낸다면 무엇으로 할까요?',
  '지금 가장 중요한 일 한 가지는?',
  '오늘 나를 위해 할 수 있는 일은?',
  '잘했어요! 이제 진짜 중요한 일을 해볼까요?',
  '1분이면 충분해요. 다음 1분도 해볼래요?',
  '당신의 집중력, 금붕어보다 길어졌어요!',
  '폰 대신 하고 싶은 거 있었죠?',
  '지금 이 순간에 집중하고 있네요.',
  '숨을 깊이 쉬어봐요. 마음이 가벼워질 거예요.',
  '오늘 하루도 잘 보내고 있어요.',
  '작은 성공이 모여 큰 변화가 돼요.',
  '당신이 여기 있어서 기뻐요!',
  '지금 해야 할 가장 작은 한 걸음은?',
  '잠깐 멈춘 것만으로도 대단해요.',
  '오늘의 감사한 것 하나를 떠올려 봐요.',
  '이 앱을 켠 건 좋은 선택이었어요.',
  '5분만 집중하면 흐름을 탈 수 있어요.',
  '지금 느끼는 감정을 한 단어로 표현해 봐요.',
] as const;

/** 뽀모도로 성공 시 특별 칭찬 멘트 */
export const POMODORO_SUCCESS_QUOTES = [
  '대단해요! 진짜 집중했네요!',
  '이 정도면 집중력 챔피언이에요!',
  '금붕어도 감동받았어요...',
  '놀라워요! 이 시간 동안 정말 대단했어요.',
  '당신의 집중력, 경이롭습니다.',
  '이렇게 긴 시간을... 존경해요.',
  '먹이를 잔뜩 받았어요! 감사합니다!',
  '오늘의 당신, 최고예요!',
  '이 순간을 기억해 둘게요.',
  '같이 있어줘서 고마워요.',
] as const;

/** AWAY 상태 — 금붕어가 떠나며 남기는 쪽지 */
export const AWAY_QUOTES = [
  '자리를 비울게요.',
  '조금만 더 일찍 와줬으면...',
  '기다리다 지쳤어요.',
  '다시 만날 수 있을까요?',
  '여기 혼자 있기 외로워요.',
  '잠깐이라도 들러줬으면 좋겠어요.',
  '오래 기다렸어요...',
  '날 잊은 건 아니죠?',
] as const;

/** 실패 시 (명상 중도 포기) 금붕어 반응 */
export const FAIL_QUOTES = [
  '앗, 놀랐잖아요!',
  '조금만 더 있어줬으면 됐는데...',
  '괜찮아요, 다시 해봐요.',
  '아쉽지만... 다음에 다시!',
  '금붕어도 서운해요.',
  '1분이 그렇게 어려운가요?',
  '...이런.',
  '기다리고 있을게요.',
] as const;

function getRandomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomSuccessQuote(): string {
  return getRandomFrom(SUCCESS_QUOTES);
}

export function getRandomPomodoroQuote(): string {
  return getRandomFrom(POMODORO_SUCCESS_QUOTES);
}

export function getRandomAwayQuote(): string {
  return getRandomFrom(AWAY_QUOTES);
}

export function getRandomFailQuote(): string {
  return getRandomFrom(FAIL_QUOTES);
}
