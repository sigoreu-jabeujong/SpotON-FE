import type { LocationRelation } from './addressDetail'
import type { BrandEvidence, BrandScope, BrandUnknown } from '../constants/diagnosis'
import type {
  LocationMatch,
  OperatingPeriodReason,
  StoreSource,
  StoreStatus,
  ApiSubCategory,
} from './stores'
import type { Category } from '../constants/diagnosis'

export type BrandFilters = {
  brand_scope: BrandScope
  brand_unknown: BrandUnknown
  brand_evidence: BrandEvidence
  brand_time_basis: 'observed_record'
  operation_type: 'any'
  area: string
  include_unknown_area: boolean
  sub_category: ApiSubCategory[]
}

export type BrandClassification = {
  status: 'pending' | 'estimate'
  generation: string | null
  source_drift: boolean
  published_at?: string | null
  policy?: string
  source?: {
    catalog_year?: number | null
    semas_month?: string | null
    semas_observed_at?: string | null
  } | null
  historical_membership?: 'not_verified'
  capabilities?: {
    estimated_chain: boolean
    confirmed_chain: boolean
    confirmed_non_chain: boolean
    operation_type: boolean
    historical_membership: boolean
  }
}

export type StoreBrand = {
  status: 'estimated' | 'unknown' | 'conflict'
  brand_key: string | null
  name: string | null
  basis: string | null
  reason: string | null
  reference_year: number | null
  reference_month: string | null
  time_basis: 'observed_record'
  historical_membership: 'not_verified'
}

/** Matches ChainStore: nullable locations/dates never become invented values. */
export type ChainStore = {
  source: StoreSource
  license_no: string
  name: string | null
  category: Category
  sub_category: ApiSubCategory
  open_date: string | null
  close_date: string | null
  operating_months: number | null
  operating_period_status: 'fact' | 'no_data'
  operating_period_reason: OperatingPeriodReason | null
  current_status: StoreStatus
  lat?: number | null
  lng?: number | null
  distance_m?: number | null
  area_m2?: number | null
  floor_unit?: string | null
  location_match?: LocationMatch | null
  location_relation?: LocationRelation | null
  brand: StoreBrand
  operation: { type: 'unknown'; basis: null }
}
