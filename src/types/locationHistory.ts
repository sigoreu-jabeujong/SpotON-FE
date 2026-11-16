import type { ChainHistoryResponse } from '../api/storeAdapters'

export type LocationHistoryParams = {
  building_key: string
  floor_unit: string
  scope: 'floor' | 'unit'
  identity_requirement: 'address_scope' | 'verified_building'
  category?: 'cafe' | 'restaurant'
}
export type LocationHistoryMeta = {
  selection: {
    scope: 'floor' | 'unit'
    identity_requirement: 'address_scope' | 'verified_building'
    floor: string
    unit: string | null
  }
  result_status: 'matched' | 'no_data' | 'pending_identity'
  location_coverage: 'complete' | 'partial' | 'not_evaluated'
  unresolved_closed_count: number
  dated_closure_count: number
  undated_closure_count: number
  current_vacancy: 'not_verified'
}
export type LocationHistoryResponse = Omit<ChainHistoryResponse, 'message'> & LocationHistoryMeta
