/**
 * 화면 표시용 형식 변환 (docs/display-rules.md 3·4장)
 * ⚠️ 지표를 계산하지 않는다. 서버가 준 값의 모양만 바꾼다.
 * 값이 없으면(null) 0이나 빈 숫자를 만들지 않고 null을 돌려준다 → 화면은 상태·사유를 표시한다.
 */
import type { ApiMeta } from '../types/api'

type Maybe<T> = T | null | undefined

/** YYYY-MM-DD → YYYY.MM.DD (YYYY-MM → YYYY.MM) */
export function formatDate(value: Maybe<string>): string | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value)
  if (!m) return value
  return m[3] ? `${m[1]}.${m[2]}.${m[3]}` : `${m[1]}.${m[2]}`
}

/** operating_months(정수, 개월) → "n년 m개월" (0년이면 "m개월", 0개월이면 "n년") */
export function formatOperatingMonths(months: Maybe<number>): string | null {
  if (months === null || months === undefined || !Number.isFinite(months)) return null
  const total = Math.max(0, Math.trunc(months))
  const years = Math.floor(total / 12)
  const rest = total % 12
  if (years === 0) return `${rest}개월`
  if (rest === 0) return `${years}년`
  return `${years}년 ${rest}개월`
}

/**
 * 비율 → "17.4%". 참고지표는 소수 첫째 자리(기본), 서울시 공식 폐업률은 digits: 0 (공표값 정수)
 */
export function formatPercent(value: Maybe<number>, digits = 1): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return `${value.toFixed(digits)}%`
}

const countFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 })

/** 점포 수 등 정수 → 천 단위 쉼표 ("1,234"). unit을 주면 뒤에 붙인다 ("38곳") */
export function formatCount(value: Maybe<number>, unit = ''): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return `${countFormatter.format(value)}${unit}`
}

/** 공간 단위 → 화면 이름 (radius_500m → "반경 500m", market → "상권", grid → "250m 격자") */
export function formatSpace(space: Maybe<string>): string | null {
  if (!space) return null
  const radius = /^radius_(\d+)m$/.exec(space)
  if (radius) return `반경 ${countFormatter.format(Number(radius[1]))}m`
  const names: Record<string, string> = {
    point: '주소 지점',
    market: '상권',
    grid: '250m 격자',
    seoul: '서울 전체',
  }
  return names[space] ?? space
}

/** meta → "데이터 기준일 YYYY.MM.DD (수집 YYYY.MM.DD)". 기준일이 없으면 null */
export function formatDataBaseline(meta: Maybe<ApiMeta>): string | null {
  const updated = formatDate(meta?.data_updated_at)
  if (!updated) return null
  const collected = formatDate(meta?.collected_at)
  return collected ? `데이터 기준일 ${updated} (수집 ${collected})` : `데이터 기준일 ${updated}`
}

/** 1평 = 3.305785㎡ (단위 환산, 표시용) */
const M2_PER_PYEONG = 3.305785

/** 신고 면적 ㎡ → "48.2㎡ (약 14.6평)". 값이 없으면 null (화면은 "정보 없음") */
export function formatArea(m2: Maybe<number>): string | null {
  if (m2 === null || m2 === undefined || !Number.isFinite(m2)) return null
  return `${m2.toFixed(1)}㎡ (약 ${(m2 / M2_PER_PYEONG).toFixed(1)}평)`
}

/** "YYYY-MM" 또는 "YYYY-MM-DD" → "2023년 10월" */
export function formatYearMonthKo(value: Maybe<string>): string | null {
  const m = value ? /^(\d{4})-(\d{2})/.exec(value) : null
  return m ? `${m[1]}년 ${Number(m[2])}월` : null
}

/** "YYYY-MM-DD"에 n일을 더한 날짜 (UTC 기준 달력 계산 — 시간대 영향 없음) */
function shiftIsoDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${t.getUTCFullYear()}.${pad(t.getUTCMonth() + 1)}.${pad(t.getUTCDate())}`
}

/**
 * 서버 기간 문자열을 사람이 읽는 모양으로 (값을 계산하지 않고 표기만 바꿈)
 * - BE 구간 표기 "(2025-11-08, 2026-11-08]" (시작일 제외·종료일 포함) → "2025.11.09 ~ 2026.11.08"
 *   제외 경계 "("는 다음 날, ")"는 전날로 바꿔 양 끝을 포함한 날짜로 보여준다 (docs/decisions.md)
 * - "2025-11~2026-10" → "2025.11 ~ 2026.10", "2026-Q2" → "2026년 2분기"
 */
export function formatPeriod(value: Maybe<string>): string | null {
  if (!value) return null
  const quarter = /^(\d{4})-Q([1-4])$/.exec(value.trim())
  if (quarter) return `${quarter[1]}년 ${quarter[2]}분기`
  const interval = /^([([])\s*(\d{4}-\d{2}-\d{2})\s*,\s*(\d{4}-\d{2}-\d{2})\s*([)\]])$/.exec(
    value.trim(),
  )
  if (interval) {
    const [, open, start, end, close] = interval
    return `${shiftIsoDate(start, open === '(' ? 1 : 0)} ~ ${shiftIsoDate(end, close === ')' ? -1 : 0)}`
  }
  return value
    .split('~')
    .map((part) => part.trim().replace(/-/g, '.'))
    .join(' ~ ')
}

/** 원 단위 금액 → "약 15.2억 원" / "약 3,840만 원" (단위 환산만, 합산하지 않음) */
export function formatKrwApprox(won: Maybe<number>): string | null {
  if (won === null || won === undefined || !Number.isFinite(won)) return null
  if (won >= 1e8) return `약 ${(won / 1e8).toFixed(1)}억 원`
  return `약 ${countFormatter.format(Math.round(won / 1e4))}만 원`
}

/** ISO 시각 "2026-11-09T14:02:11+09:00" → "2026.11.09 14:02" (서버가 준 시각 글자 그대로, 시간대 변환 없음) */
export function formatDateTime(value: Maybe<string>): string | null {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value) : null
  return m ? `${m[1]}.${m[2]}.${m[3]} ${m[4]}:${m[5]}` : (value ?? null)
}
