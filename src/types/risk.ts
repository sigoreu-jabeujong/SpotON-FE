import type { Category } from '../constants/diagnosis'
import type { DataStatus, IndicatorType } from '../constants/labels'
import type { ApiSpace, CommonQueryParams } from './api'

/** /risk 선택 지표 (조건부). LQ는 범위에서 제외 */
export type RiskInclude = 'market_change' | 'day_night_ratio'

/**
 * 상권 판정: 상권 안 / 상권 밖 / 확인 중(unverified).
 * 지금 BE는 공식 상권 적용 기준(경계 버전·기간)을 확인 중이라 항상 unverified를 준다 —
 * 이때는 상권 안·밖으로 확정하지 않는다 (상권 밖으로 바꿔 표시 금지).
 */
export type MarketStatus = 'in_market' | 'outside' | 'unverified'

export type MarketRef = { market_code: string; market_name: string }

/**
 * 지정 경계 파일의 형상에 대한 공간 후보 (서버가 경계 버전을 명시한 경우만).
 * ⚠️ 현재·과거 상권을 확정한 값이 아니다 — 확정 상권명이나 공식 수치로 쓰지 않는다 (화면에는 표시하지 않음).
 */
export type SpatialCandidate = {
  spatial_status: 'in_market' | 'outside' | 'ambiguous'
  primary?: MarketRef | null
  candidates?: MarketRef[]
  also_in?: MarketRef[]
  nearby_markets?: MarketRef[]
}

export type MarketJudgement = {
  status: MarketStatus
  /** unverified·outside면 null */
  market_code: string | null
  market_name: string | null
  market_type: string | null
  /** 함께 속한 관광특구 (unverified면 빈 배열) */
  also_in: MarketRef[]
  /** outside일 때 반경에 걸친 상권 (unverified면 빈 배열) */
  nearby_markets: MarketRef[]
  /** 미확인 사유 코드 (예: boundary_period_not_verified, boundary_version_not_selected) */
  reason?: string | null
  spatial_candidate?: SpatialCandidate | null
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
  /** 서울 비교가 없을 때 사유 코드 (예: not_applicable — 동종업체 수는 서울 비교 대상 아님) */
  seoul_avg_reason?: string | null
  /** 서울 비교의 분자·분모 (같은 필터·좌표 확보 기록 기준, FE에서 역산하지 않음) */
  seoul_numerator?: number | null
  seoul_denominator?: number | null
  /** 표본 부족·0분모면 null (denominator는 실제 표본 수 유지) */
  numerator?: number | null
  denominator?: number | null
  space?: ApiSpace | null
  /** 기간. 참고지표는 "(L, U]" (시작일 제외·종료일 포함) */
  period?: string | null
  /** 출처 번호 배열 (예: ["R5", "R6"]) — 지표마다 따로 표시 */
  source?: string[] | null
  source_url?: string | null
  status: Exclude<DataStatus, 'link_only'>
  /** 판단 보류·자료 없음 사유 코드 (예: insufficient_sample, zero_denominator) — 화면은 indicatorReasonText로 */
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
  source?: string[] | null
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
  source?: string[] | null
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

/**
 * POST /risk/interpret 본문 — **원래 Risk GET 조회 조건만** (query-only).
 * 서버가 Risk를 다시 계산하므로 Risk 응답(market·indicators·flags)·화면 수치·주소·건물 키·층은 보내지 않는다.
 * 응답 query(radius_m·일 단위 as_of·filters)를 그대로 보내면 422가 된다.
 * - radius(300/500/1000), as_of는 YYYY-MM이고 최신 조회면 생략 (오늘 월을 넣지 않음)
 * - unknown 플래그는 include_unknown_area·include_unknown_franchise 두 개 (legacy include_unknown과 섞지 않음)
 * - include는 Risk GET에 넣었을 때만 같은 값으로 (지금 FE는 Risk GET에 include를 쓰지 않음)
 */
export type RiskInterpretQuery = CommonQueryParams & { include?: RiskInclude[] }

/**
 * 선택 이력 문맥 (BE #98) — 결과 화면 URL의 bk·floor 그대로. 건물 키가 없으면 history를 통째로 생략.
 * 층이 없으면 null (빈 문자열·다른 필드는 422). 요청 좌표에서 300m보다 먼 건물 키도 422
 */
export type RiskInterpretHistory = {
  building_key: string
  floor_unit: string | null
}

export type RiskInterpretRequest = {
  /** 원래 조회 조건만 — 주소·건물 키·층·화면 수치는 여기에 넣지 않는다 */
  query: RiskInterpretQuery
  history?: RiskInterpretHistory
}

/**
 * AI 해석 근거 ID — Risk 지표 ID + 상권 활동 참고 계산 ID (BE #96: official_values 끝 문장에만)
 * - recent_open_close: 최근 구간 개업·폐업 기록
 * - avg_operating_months: 기준일에 영업 중인 기록의 개업 후 경과 개월 평균 (점포 수명·생존 기간 아님)
 */
export type ActivityEvidenceId = 'recent_open_close' | 'avg_operating_months'
/** BE #98 이력 문맥 근거: 건물 전체 건수 / 같은 자리 영업·폐업과 기간 범위 (최신 자료 기준·지원 업종 전체) */
export type HistoryEvidenceId = 'building_history' | 'same_spot_history'
export type EvidenceId = IndicatorId | ActivityEvidenceId | HistoryEvidenceId

export type InterpretItem = { text: string; indicator_ids: EvidenceId[] }
export type InterpretSourcedItem = InterpretItem & { sources: string[] }

/** POST /api/risk/interpret 응답 data (화면 표시 순서) */
export type RiskInterpretation = {
  /** 항상 "AI 해석" */
  label: string
  /** 해석 방식 — 서버가 검증된 문장을 만들고 모델은 순서·체크리스트만 고른다 (server_sentences_model_ordering) */
  method?: string
  official_values: InterpretItem[]
  favorable: InterpretSourcedItem[]
  unfavorable: InterpretSourcedItem[]
  missing_data: { text: string; reason: string }[]
  checklist: { item: string; why: string }[]
  /** 선택 형식·문장 안전성 검사 통과 표시 — 사실 정확도·신뢰도 점수가 아니다 (화면에 점수로 보여주지 않음) */
  verification: {
    passed: boolean
    /** 보이는 문장의 숫자 출현 횟수 (점수 아님) */
    checked_numbers: number
    mismatches: unknown[]
    /** 이번 요청에서 검증 실패 후 1회 다시 만들었는지 (과거 재시도 이력 아님) */
    regenerated: boolean
  }
  model: string
  /** 이번 응답의 서버 문장 조립 시각(UTC) — 새 모델 호출 시각이 아니다 */
  generated_at: string
}
