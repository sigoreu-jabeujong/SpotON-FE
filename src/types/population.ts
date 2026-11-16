import type { CommonQueryParams } from './api'

export type PopulationParams = Pick<
  CommonQueryParams,
  'lat' | 'lng' | 'radius' | 'category' | 'sub_category' | 'as_of'
>
export type PopulationSource = 'local' | 'long' | 'short'
export type PublicNumber = {
  value: string | null
  display: string | null
  exact_zero: boolean | null
  rounded: boolean | null
  unit:
    'public_source_value_sum' | 'public_source_value_hourly_mean' | 'pct_of_public_subset' | 'ratio'
  reason: 'zero_total' | 'zero_night_denominator' | null
}
export type PublicValues = {
  hourly_source_sums: PublicNumber[]
  day_source_sum: PublicNumber
  night_source_sum: PublicNumber
  day_source_mean: PublicNumber
  night_source_mean: PublicNumber
  day_share_pct: PublicNumber
  night_share_pct: PublicNumber
  day_night_ratio: PublicNumber
}
export type PopulationQuality = {
  selected_grid_count: number
  grids_with_rows: number
  grids_without_rows: number
  candidate_component_count: number
  used_component_count: number
  excluded_component_count: number
  used_grid_count: number
  observed_rows: number
  suppressed_rows: number
  missing_rows: number
  absent_hours_within_candidates: number
  excluded_by_hour_class: { day_only: number; night_only: number; both: number }
  version_unlocated_rows: number
  version_unlocated_grids: number
}
export type PopulationBlock = {
  source: PopulationSource
  status: 'partial' | 'no_data' | 'not_supported'
  reason: string
  values: PublicValues | null
  quality: PopulationQuality
  limitations: string[]
}
export type PopulationReference = {
  status: 'ready' | 'pending' | 'no_data' | 'not_supported'
  reason: string | null
  analysis_date: string
  observation_date: string | null
  method: {
    name: 'fixed_public_component_24h'
    day_hours: '06-17'
    night_hours: '00-05,18-23'
    ratio_definition: 'pooled_day_sum_over_pooled_night_sum'
  }
  scope: {
    radius_m: 300 | 500 | 1000
    category: 'cafe' | 'restaurant'
    sub_category: string[]
    as_of: string | null
    population_filter_applied: false
    timeline_basis: 'license_global_source_date_category_month_range'
    spatial_compatibility: 'unverified'
    grid_as_of: string | null
  }
  sources: PopulationBlock[]
}
