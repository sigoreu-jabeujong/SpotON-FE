import type { PopulationParams } from './population'

export type LocationParams = PopulationParams & {
  time_mode?: 'latest_reference' | 'analysis_period'
}
export type ReferenceStatus = 'ready' | 'partial' | 'no_data' | 'pending' | 'not_supported'
export type ReferenceNumber = {
  value: string | null
  display: string | null
  unit: string
  rounded: boolean
  exact_zero: boolean
  reason?: string | null
}
export type SalesReferenceItem = {
  store_reference?: { total_stores: string | null; reason: string | null } | null
  per_store_metric?: ReferenceNumber | null
  average_contribution?: { status: string; reason: string | null } | null
  market_code: string
  market_name: string
  industry_code: string
  industry_name: string
  spatial_relation: 'contains_point' | 'intersects_radius'
  source_quarter: string | null
  temporal_relation: 'same_period' | 'earlier_reference' | 'later_reference' | null
  metric: ReferenceNumber | null
  status: 'ready' | 'no_data'
  reason: string | null
}
export type AdminReferenceItem = {
  area_ref: string
  area_name: string
  spatial_relation: 'contains_point' | 'intersects_radius'
  observation_date: string
  source_month: string
  temporal_relation: 'same_period' | 'earlier_reference' | 'later_reference'
  population_scope: 'local'
  mean_24h: ReferenceNumber | null
  status: 'ready' | 'no_data'
  reason: string | null
  observed_hours: number
  source_hours: number
  provenance_ref: string
}
export type DayNightReferenceItem = {
  area_ref: string
  observation_date: string
  population_scope: 'local'
  mean_day: ReferenceNumber | null
  mean_night: ReferenceNumber | null
  day_night_ratio: ReferenceNumber | null
  day_share_pct: ReferenceNumber | null
  night_share_pct: ReferenceNumber | null
  status: 'ready' | 'partial' | 'no_data'
  reason: string | null
  provenance_ref: string
}
type ReferenceBlock<T> = { status: ReferenceStatus; reason: string | null; items: T[] }
export type SalesDistribution = {
  sample_count: number
  limited_reference_count: boolean
  median: ReferenceNumber
  q1: ReferenceNumber
  q3: ReferenceNumber
  iqr: ReferenceNumber
  variance: { value: string; unit: string }
}
export type LocationReference = {
  requested_as_of: string | null
  analysis_as_of: string
  time_mode: 'latest_reference' | 'analysis_period'
  sales: ReferenceBlock<SalesReferenceItem> & {
    per_store_average?: {
      status: ReferenceStatus
      primary_quarter: string | null
      temporal_relation?: 'same_period' | 'earlier_reference' | 'later_reference' | null
      metric: ReferenceNumber | null
      distribution?: SalesDistribution | null
      representative_method?: string
      total_sales: string | null
      total_store_count: string | null
      listed_item_count: number
      included_item_count: number
      excluded_counts: Record<string, number>
      groups: {
        source_quarter: string
        metric: ReferenceNumber | null
        distribution?: SalesDistribution | null
      }[]
    } | null
  }
  living_population: ReferenceBlock<AdminReferenceItem>
  day_night: ReferenceBlock<DayNightReferenceItem>
}
