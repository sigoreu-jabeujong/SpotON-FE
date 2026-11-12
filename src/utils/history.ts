/**
 * 점포 이력 표·출력용 진단서가 함께 쓰는 정렬·결측 표시 규칙 (두 화면이 같은 기준을 쓰도록 한 곳에).
 * ⚠️ 날짜·기간을 만들거나 계산하지 않는다. 서버 값이 없으면 "정보 없음"·사유 문구만 돌려준다.
 */
import { MESSAGES } from '../constants/messages'
import type { HistoryStore } from '../types/stores'
import { formatDate, formatOperatingMonths } from './format'

const T = MESSAGES.history

/**
 * 최근 개업 순 (표시 순서만 바꿈). 개업일 미확인은 맨 뒤, 같은 날짜는 source → license_no 순으로 고정.
 * API·React Query 캐시 배열은 건드리지 않고 복사본을 정렬한다.
 */
export function sortHistoryRecentFirst(stores: readonly HistoryStore[]): HistoryStore[] {
  return [...stores].sort((a, b) => {
    if (a.open_date !== b.open_date) {
      if (a.open_date === null) return 1
      if (b.open_date === null) return -1
      return a.open_date < b.open_date ? 1 : -1
    }
    if (a.source !== b.source) return a.source < b.source ? -1 : 1
    if (a.license_no !== b.license_no) return a.license_no < b.license_no ? -1 : 1
    return 0
  })
}

/** 표시 글자 + 결측 여부 (결측이면 화면에서 흐린 글씨로) */
export type HistoryCellText = { text: string; missing: boolean }

const value = (text: string): HistoryCellText => ({ text, missing: false })
const missing = (text: string): HistoryCellText => ({ text, missing: true })

/** 상호 — 없으면 "정보 없음" */
export function historyName(s: HistoryStore): HistoryCellText {
  return s.name ? value(s.name) : missing(T.missingValue)
}

/** 개업일 — 없으면 원본 없음("정보 없음")과 무효("개업일 확인 필요")를 구분 */
export function historyOpenDate(s: HistoryStore): HistoryCellText {
  const date = formatDate(s.open_date)
  if (date) return value(date)
  return missing(
    s.operating_period_reason === 'invalid_open_date' ? T.openDateCheck : T.missingValue,
  )
}

/**
 * 폐업일
 * - 날짜가 있으면 날짜
 * - 영업 중·기타(휴업 등)라 폐업일이 없으면 null → 화면은 "—"(+ 화면 읽기용 "폐업일 없음")
 * - 폐업인데 날짜가 없으면 상태는 폐업 그대로 두고 사유로 구분
 */
export function historyCloseDate(s: HistoryStore): HistoryCellText | null {
  const date = formatDate(s.close_date)
  if (date) return value(date)
  if (s.store_status !== 'closed') return null
  switch (s.operating_period_reason) {
    case 'missing_close_date':
      return missing(T.closeDateMissing)
    case 'invalid_date_order':
      return missing(T.dateOrderCheck)
    default:
      // invalid_close_date 또는 사유가 폐업일과 무관한 경우 — 원자료가 없었다고 단정하지 않는다
      return missing(T.closeDateCheck)
  }
}

/**
 * 영업 기간 — 서버 operating_months를 "n년 m개월"로 (0은 실제 "0개월").
 * null(미산정)이면 "정보 없음" + 사유 문구.
 */
export function historyPeriod(s: HistoryStore): HistoryCellText & { reason: string | null } {
  const period = formatOperatingMonths(s.operating_months)
  if (period) return { ...value(period), reason: null }
  const reason = s.operating_period_reason ? T.periodReasons[s.operating_period_reason] : null
  return { ...missing(T.missingValue), reason }
}
