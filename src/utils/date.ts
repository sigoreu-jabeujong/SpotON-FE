/**
 * 기준 시점(YYYY-MM) 선택 UI용 도우미 — 지표 계산이 아니라 화면에서 고를 달을 만드는 용도
 */

const YM = /^(\d{4})-(0[1-9]|1[0-2])$/

/** "YYYY-MM"을 n개월 앞뒤로 옮긴다 (예: shiftMonth("2026-11", -12) → "2025-11") */
export function shiftMonth(ym: string, delta: number): string | null {
  const m = YM.exec(ym)
  if (!m) return null
  const index = Number(m[1]) * 12 + (Number(m[2]) - 1) + delta
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

/** 연·월 → "YYYY-MM" */
export function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** "YYYY-MM" → { year, month } (형식이 틀리면 null) */
export function parseYearMonth(
  ym: string | null | undefined,
): { year: number; month: number } | null {
  const m = ym ? YM.exec(ym) : null
  return m ? { year: Number(m[1]), month: Number(m[2]) } : null
}

/**
 * min ≤ ym ≤ max 인지 ("YYYY-MM"은 글자 순서 = 시간 순서).
 * min이 null(유효 표본 없음)이면 고를 수 있는 과거 월이 없으므로 항상 false
 */
export function isMonthInRange(ym: string, min: string | null, max: string): boolean {
  return min !== null && ym >= min && ym <= max
}
