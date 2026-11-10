import type { Category } from '../constants/diagnosis'
import type { DataStatus, IndicatorType } from '../constants/labels'
import type { ApiSpace } from './api'

/** /risk 선택 지표 (조건부). LQ는 범위에서 제외 */
export type RiskInclude = 'market_change' | 'day_night_ratio'

/** 상권 판정: 상권 안 / 상권 밖 */
export type MarketStatus = 'in_market' | 'outside'

export type MarketRef = { market_code: string; market_name: string }

export type MarketJudgement = {
  status: MarketStatus
  market_code: string | null
  market_name: string | null
  market_type: string | null
  /** 함께 속한 관광특구 */
  also_in: MarketRef[]
  /** outside일 때 반경에 걸친 상권 */
  nearby_markets: MarketRef[]
}

/** 지표 ID (BE 작업계획서 기준, LQ 제외) */
export type IndicatorId =
  | 'official_closure_rate'
  | 'market_change'
  | 'official_risk'
  | 'closure_rate_12m'
  | 'survival_rate_1y'
  | 'survival_rate_3y'
  | 'competitor_count'
  | 'day_night_ratio'

/** official_risk를 뺀 일반 지표 */
export type MetricIndicator = {
  id: Exclude<IndicatorId, 'official_risk'>
  type: IndicatorType
  /** 등급·유형은 문자열. 산정 안 하면 null */
  value: number | string | null
  /** %, 개, 배, grade, type */
  unit?: string | null
  seoul_avg?: number | null
  seoul_avg_reason?: string | null
  numerator?: number | null
  denominator?: number | null
  space?: ApiSpace | null
  period?: string | null
  /** 출처 번호 문자열 (예: "R5,R6") */
  source?: string | null
  source_url?: string | null
  status: Exclude<DataStatus, 'link_only'>
  reason?: string | null
}

/** official_risk — PDF v1.1 형식: no_data + reason + source_url (시연 주소만 수기 인용 시 fact) */
export type OfficialRiskPdf = {
  id: 'official_risk'
  type: 'official'
  value: string | null
  unit?: string | null
  status: Exclude<DataStatus, 'link_only'>
  reason?: string | null
  source?: string | null
  source_url?: string | null
  market_name?: string | null
}

/** official_risk — BE 보완안(案, 확인 대기): link_only + link + copy_text */
export type OfficialRiskLinkOnly = {
  id: 'official_risk'
  type: 'official'
  value: null
  status: 'link_only'
  link: string
  /** "상권명 · 업종명" 복사 버튼용. 상권 밖이면 없을 수 있다 */
  copy_text?: string | null
  reason?: string | null
  source?: string | null
}

export type OfficialRiskIndicator = OfficialRiskPdf | OfficialRiskLinkOnly

export type RiskIndicator = MetricIndicator | OfficialRiskIndicator

export type RiskQuery = {
  address?: string | null
  category: Category
  radius_m: number
  as_of: string
  filters: Record<string, unknown>
}

export type RiskFlags = {
  insufficient_sample: boolean
  missing: string[]
}

/** GET /api/risk 응답 data */
export type Risk = {
  query: RiskQuery
  market: MarketJudgement
  indicators: RiskIndicator[]
  flags: RiskFlags
}

/* ───── POST /api/risk/interpret ───── */

export type RiskInterpretRequest = {
  query: RiskQuery
  market: MarketJudgement
  indicators: RiskIndicator[]
  flags: RiskFlags
  /** 이력 점포 수·12개월 개폐업 수 등 요약 (案) */
  context?: Record<string, number | string | null>
}

export type InterpretItem = { text: string; indicator_ids: IndicatorId[] }
export type InterpretSourcedItem = InterpretItem & { sources: string[] }

/** POST /api/risk/interpret 응답 data (화면 표시 순서) */
export type RiskInterpretation = {
  /** 항상 "AI 해석" */
  label: string
  official_values: InterpretItem[]
  favorable: InterpretSourcedItem[]
  unfavorable: InterpretSourcedItem[]
  missing_data: { text: string; reason: string }[]
  checklist: { item: string; why: string }[]
  verification: {
    passed: boolean
    checked_numbers: number
    mismatches: unknown[]
    regenerated: boolean
  }
  model: string
  generated_at: string
}
