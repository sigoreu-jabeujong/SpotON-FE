import { apiGet, apiPost } from './client'
import { adaptAnalysisHistory } from './storeAdapters'
import type { LocationHistoryParams, LocationHistoryResponse } from '../types/locationHistory'

export async function getLocationHistory(params: LocationHistoryParams, signal?: AbortSignal) {
  const { data: context } = await apiPost<{
    context: string
    building_key: string
    road_key: string | null
    rule_version: string
  }>(
    '/v3/address-context',
    {
      address: params.address,
      building_key: params.building_key,
      lat: params.lat,
      lng: params.lng,
      category: params.category ?? 'restaurant',
    },
    { signal },
  )
  if (
    !context.context ||
    context.building_key !== params.building_key ||
    context.rule_version !== 'road-jibun-v1'
  )
    throw new Error('invalid_address_context')
  const response = await apiGet<LocationHistoryResponse>(
    '/v3/stores/location-history',
    {
      context: context.context,
      ...(params.floor_unit ? { floor_unit: params.floor_unit } : {}),
      ...(params.category ? { category: params.category } : {}),
    },
    { signal },
  )
  const raw = response.data
  const adapted = adaptAnalysisHistory({ ...raw, message: null })
  if (
    raw.stores.some(
      (s) =>
        s.history_scope !== params.scope || !['road', 'jibun', 'both'].includes(s.match_evidence),
    ) ||
    !raw.selection ||
    raw.selection.scope !== params.scope ||
    raw.selection.building_key !== params.building_key ||
    raw.selection.road_key !== context.road_key ||
    raw.selection.floor !== (params.floor_unit?.split(' ')[0] ?? null) ||
    raw.selection.unit !== (params.floor_unit?.split(' ')[1] ?? null) ||
    raw.selection.identity_requirement !== params.identity_requirement ||
    !['matched', 'no_data'].includes(raw.result_status) ||
    !['complete', 'partial'].includes(raw.location_coverage) ||
    ![
      raw.address_conflict_count,
      raw.address_unresolved_count,
      raw.detail_unresolved_count,
      raw.candidate_count,
      raw.excluded_counts?.floor,
      raw.excluded_counts?.unit,
    ].every((n) => Number.isInteger(n) && n >= 0) ||
    raw.candidate_count !==
      adapted.total +
        raw.address_conflict_count +
        raw.address_unresolved_count +
        raw.detail_unresolved_count +
        raw.excluded_counts.floor +
        raw.excluded_counts.unit ||
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
    (raw.location_coverage === 'partial') !==
      raw.address_conflict_count + raw.address_unresolved_count + raw.detail_unresolved_count > 0 ||
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
        unresolved_count: raw.detail_unresolved_count,
        address_conflict_count: raw.address_conflict_count,
        address_unresolved_count: raw.address_unresolved_count,
        detail_unresolved_count: raw.detail_unresolved_count,
        candidate_count: raw.candidate_count,
        excluded_counts: raw.excluded_counts,
        dated_closure_count: raw.dated_closure_count,
        undated_closure_count: raw.undated_closure_count,
        current_vacancy: raw.current_vacancy,
      },
    },
  }
}
