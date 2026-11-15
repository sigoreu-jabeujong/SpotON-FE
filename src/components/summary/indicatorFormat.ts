import type { IndicatorId, MetricIndicator } from '../../types/risk'
import { MESSAGES } from '../../constants/messages'
import { formatCount, formatPercent } from '../../utils/format'

/**
 * 지표 값 → 화면 글자 (형식 변환만, 계산하지 않음). 값이 없으면 null → 화면은 상태 라벨·사유를 보여준다.
 * 공식 폐업률은 공표값 정수(%), 참고지표 비율은 소수 첫째 자리(%)
 */
export function formatIndicatorValue(ind: Pick<MetricIndicator, 'value' | 'unit' | 'type'>) {
  const { value, unit } = ind
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (unit === '%') return formatPercent(value, ind.type === 'official' ? 0 : 1)
  if (unit === '개') return formatCount(value, '곳')
  if (unit === '배') return `${value}배`
  return String(value)
}

/** 같은 단위(%)의 서울 평균 → 화면 글자 */
export function formatSeoulAvg(ind: Pick<MetricIndicator, 'seoul_avg' | 'unit'>) {
  if (ind.seoul_avg === null || ind.seoul_avg === undefined) return null
  return ind.unit === '%' ? formatPercent(ind.seoul_avg, 1) : String(ind.seoul_avg)
}

/** 지표 카드의 HTML id (AI 해석 근거 칩 → 카드로 스크롤) */
export function indicatorAnchorId(id: IndicatorId): string {
  return `indicator-${id}`
}

/**
 * 지표 카드 배치 (6칸 그리드 기준 칸 수) — 마지막 줄 빈칸이 어색하지 않게 개수에 맞춰 나눈다.
 * 3개 이하: 한 줄 / 4개: 2+2 / 5개: 3+2 / 그 밖: 3개씩 (남는 1개는 한 줄 전체)
 * Tailwind가 찾을 수 있게 클래스 이름을 그대로 적는다.
 */
export function indicatorGridSpan(index: number, count: number): string {
  if (count === 1) return 'col-span-6'
  if (count === 2 || count === 4) return 'col-span-3'
  if (count === 5 && index >= 3) return 'col-span-3'
  if (count % 3 === 1 && index === count - 1) return 'col-span-6'
  if (count % 3 === 2 && index >= count - 2) return 'col-span-3'
  return 'col-span-2'
}

/**
 * 지표·상권 사유 코드 → 화면 문구. BE는 사유를 코드로 준다 (예: insufficient_sample).
 * 모르는 영문 코드는 그대로 보여주지 않고 일반 문구로, 이미 문장(한글)이면 그대로 쓴다.
 */
export function indicatorReasonText(reason: string | null | undefined): string | null {
  if (!reason) return null
  const known = MESSAGES.summary.reasonCodes[reason]
  if (known) return known
  return /^[a-z0-9_]+$/.test(reason) ? MESSAGES.summary.reasonUnknown : reason
}
