import type { CommonQueryParams } from './api'
import type { RiskInterpretation } from './risk'

export type ReportBaseline = {
  risk: string
  activity: string
  location: string
  grid: string
  address_history: string | null
}
export type ReportAddressHistory = {
  context: string
  floor_unit?: string
  category: 'cafe' | 'restaurant'
}
export type ReportRequest = {
  query: CommonQueryParams
  baseline: ReportBaseline
  time_mode: 'latest_reference' | 'analysis_period'
  address_history?: ReportAddressHistory
}
export type ReportText = { text: string; evidence_ids: string[]; group_id: string | null }
export type ReportSection = {
  status: 'ready' | 'unavailable'
  items: ReportText[]
  reason: 'provider_error' | 'verification_failed' | 'timeout' | 'rate_limited' | null
  verification: { passed: true } | null
  group_count: number
  group_ids: string[]
}
export type ReportMetric = {
  id: string
  group: string
  label: string
  area_label: string | null
  value: string | null
  display: string
  unit: string
  status: string
  reason: string | null
  source_ids: string[]
  period: string
  spatial_scope: string
  population_scope: string
  filter_scope: string
  denominator: string | null
  exact_zero: boolean | null
  rounded: boolean | null
}
export type AiSectionsReport = {
  schema_version: 'ai-sections-v1'
  label: 'AI 해석'
  status: 'complete' | 'partial'
  advantages: ReportSection
  cautions: ReportSection
  summary: ReportSection
  limitations: ReportText[]
  metrics: ReportMetric[]
  checklist: RiskInterpretation['checklist']
  generated_at: string
  report_context_hash: string
  baseline: ReportBaseline
}
