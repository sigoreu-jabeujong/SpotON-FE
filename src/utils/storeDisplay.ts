/**
 * 점포 목록 결측 표시 규칙 — 이력 표·주변 점포 표·시점 조회 표·지도 정보창/마커·출력용 진단서가 함께 쓴다.
 * ⚠️ 날짜·기간을 만들거나 계산하지 않는다. 서버 값이 없으면 "정보 없음"·사유 문구만 돌려준다.
 * (문자열 "null"·빈 제목이 화면에 나오지 않게 상호는 항상 이 함수를 거친다)
 */
import { MESSAGES } from '../constants/messages'
import type { OperatingPeriodReason, StoreStatus } from '../types/stores'
import { formatDate, formatOperatingMonths } from './format'

const T = MESSAGES.store

/** 표시 글자 + 결측 여부 (결측이면 화면에서 흐린 글씨로) */
export type StoreCellText = { text: string; missing: boolean }

type WithReason = { operating_period_reason: OperatingPeriodReason | null }

const value = (text: string): StoreCellText => ({ text, missing: false })
const missing = (text: string): StoreCellText => ({ text, missing: true })

/** 상호 — 없으면 "정보 없음" */
export function storeName(s: { name: string | null }): StoreCellText {
  const name = s.name?.trim()
  return name ? value(name) : missing(T.missingValue)
}

/** 개업일 — 없으면 원본 없음("정보 없음")과 무효("개업일 확인 필요")를 구분 */
export function storeOpenDate(s: { open_date: string | null } & WithReason): StoreCellText {
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
export function storeCloseDate(
  s: { close_date: string | null } & WithReason,
  status: StoreStatus,
): StoreCellText | null {
  const date = formatDate(s.close_date)
  if (date) return value(date)
  if (status !== 'closed') return null
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
export function storePeriod(
  s: { operating_months: number | null } & WithReason,
): StoreCellText & { reason: string | null } {
  const period = formatOperatingMonths(s.operating_months)
  if (period) return { ...value(period), reason: null }
  const reason = s.operating_period_reason ? T.periodReasons[s.operating_period_reason] : null
  return { ...missing(T.missingValue), reason }
}

/** 한 줄 문구 (지도 정보창·title용): "정보 없음 (사유)" */
export function storePeriodLine(s: { operating_months: number | null } & WithReason): string {
  const p = storePeriod(s)
  return p.reason ? `${p.text} (${p.reason})` : p.text
}
