import type { AnalysisHistoryResponse } from '../api/storeAdapters'
import type { AnalysisStore } from './analysis'

export type LocationHistoryParams = {
  building_key: string
  address: string
  lat: number
  lng: number
  floor_unit?: string
  scope: 'address' | 'floor' | 'unit'
  identity_requirement: 'address_scope' | 'verified_building'
  category?: 'cafe' | 'restaurant'
}
export type LocationHistoryMeta = {
  selection: {
    building_key?: string
    road_key?: string | null
    scope: 'address' | 'floor' | 'unit'
    identity_requirement: 'address_scope' | 'verified_building'
    floor: string | null
    unit: string | null
  }
  result_status: 'matched' | 'no_data' | 'pending_identity'
  location_coverage: 'complete' | 'partial' | 'not_evaluated'
  open_count: number
  closed_count: number
  other_count: number
  unresolved_count: number
  address_conflict_count?: number
  address_unresolved_count?: number
  detail_unresolved_count?: number
  candidate_count?: number
  excluded_counts?: { floor: number; unit: number }
  dated_closure_count: number
  undated_closure_count: number
  current_vacancy: 'not_verified'
}
export type LocationHistoryResponse = Omit<AnalysisHistoryResponse, 'message' | 'stores'> & {
  stores: (AnalysisStore & {
    history_scope: 'address' | 'floor' | 'unit'
    match_evidence: 'road' | 'jibun' | 'both'
  })[]
} & Omit<LocationHistoryMeta, 'unresolved_count'> & {
    address_conflict_count: number
    address_unresolved_count: number
    detail_unresolved_count: number
    candidate_count: number
    excluded_counts: { floor: number; unit: number }
  }
