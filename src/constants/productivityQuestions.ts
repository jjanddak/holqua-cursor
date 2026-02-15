/**
 * 명상 성공 시 말풍선에 표시할 랜덤 생산성 질문
 */

export const PRODUCTIVITY_QUESTIONS = [
  '오늘의 목표는 무엇인가요?',
  '지금 바로 해야 할 일은?',
  '오늘 하나만 끝낸다면 무엇으로 할까요?',
  '지금 가장 중요한 일 한 가지는?',
  '오늘 나를 위해 할 수 있는 일은?',
] as const;

export function getRandomProductivityQuestion(): string {
  const i = Math.floor(Math.random() * PRODUCTIVITY_QUESTIONS.length);
  return PRODUCTIVITY_QUESTIONS[i];
}
