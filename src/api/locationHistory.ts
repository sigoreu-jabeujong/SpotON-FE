import { apiGet } from './client'
import { adaptChainHistory } from './storeAdapters'
import type { LocationHistoryParams, LocationHistoryResponse } from '../types/locationHistory'

export async function getLocationHistory(params: LocationHistoryParams, signal?: AbortSignal) {
  const response = await apiGet<LocationHistoryResponse>('/v2/stores/location-history', params, {
    signal,
  })
  const raw = response.data
  const adapted = adaptChainHistory({ ...raw, message: null })
  if (
    !raw.selection ||
    raw.selection.scope !== params.scope ||
    raw.selection.floor !== params.floor_unit.split(' ')[0] ||
    (params.scope === 'unit' && raw.selection.unit !== params.floor_unit.split(' ')[1]) ||
    raw.selection.identity_requirement !== params.identity_requirement ||
    !['matched', 'no_data', 'pending_identity'].includes(raw.result_status) ||
    !['complete', 'partial', 'not_evaluated'].includes(raw.location_coverage) ||
    !Number.isInteger(raw.unresolved_count) ||
    raw.unresolved_count < 0 ||
    !Number.isInteger(raw.dated_closure_count) ||
    raw.dated_closure_count < 0 ||
    !Number.isInteger(raw.undated_closure_count) ||
    raw.undated_closure_count < 0 ||
    raw.dated_closure_count + raw.undated_closure_count !== raw.closed_count ||
    !Number.isInteger(raw.open_count) ||
    !Number.isInteger(raw.closed_count) ||
    !Number.isInteger(raw.other_count) ||
    raw.open_count !== adapted.stores.filter((s) => s.store_status === 'open').length ||
    raw.closed_count !== adapted.stores.filter((s) => s.store_status === 'closed').length ||
    raw.other_count !== adapted.stores.filter((s) => s.store_status === 'other').length ||
    raw.open_count + raw.closed_count + raw.other_count !== adapted.total ||
    (raw.result_status === 'pending_identity'
      ? raw.location_coverage !== 'not_evaluated' || raw.unresolved_count !== 0
      : raw.location_coverage === 'not_evaluated' ||
        (raw.location_coverage === 'partial') !== raw.unresolved_count > 0) ||
    (raw.result_status === 'matched') !== adapted.total > 0
  )
    throw new Error('invalid_location_history')
  return {
    ...response,
    data: {
      ...adapted,
      location: {
        selection: raw.selection,
        result_status: raw.result_status,
        location_coverage: raw.location_coverage,
        open_count: raw.open_count,
        closed_count: raw.closed_count,
        other_count: raw.other_count,
        unresolved_count: raw.unresolved_count,
        dated_closure_count: raw.dated_closure_count,
        undated_closure_count: raw.undated_closure_count,
        current_vacancy: raw.current_vacancy,
      },
    },
  }
}
