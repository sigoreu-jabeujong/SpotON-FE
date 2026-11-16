import type { PopulationQuality, PopulationReference, PublicNumber } from './population'

export type AiPopulationMetric = Omit<PublicNumber, 'value' | 'unit'> & {
  unit: 'pct_of_public_subset' | 'ratio'
}
export type AiPopulationReference = Pick<
  PopulationReference,
  'status' | 'reason' | 'analysis_date' | 'observation_date'
> & {
  calculation_method: 'fixed_public_component_24h'
  day_hours: '06-17'
  night_hours: '00-05,18-23'
  ratio_definition: 'pooled_day_sum_over_pooled_night_sum'
  population_filter_applied: false
  source_validation_performed: false
  population_total_validated: false
  sources: {
    source: 'local' | 'long' | 'short'
    status: 'partial' | 'no_data' | 'not_supported'
    reason: string
    metrics: Record<
      'day_share_pct' | 'night_share_pct' | 'day_night_ratio',
      AiPopulationMetric
    > | null
    quality: Pick<
      PopulationQuality,
      | 'selected_grid_count'
      | 'used_grid_count'
      | 'grids_without_rows'
      | 'candidate_component_count'
      | 'used_component_count'
      | 'excluded_component_count'
      | 'excluded_by_hour_class'
    >
    limitations: string[]
  }[]
}
