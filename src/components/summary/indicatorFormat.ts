import type { IndicatorId, MetricIndicator } from '../../types/risk'
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
