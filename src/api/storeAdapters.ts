import type { AnalysisStore } from '../types/analysis'
import type {
  HistoryStore,
  NearbyMarker,
  NearbyStores,
  StoreHistory,
  StoreSnapshot,
  SnapshotStore,
} from '../types/stores'
import { ApiRequestError } from './client'
import { API_MESSAGES } from '../constants/apiMessages'

export type AnalysisHistoryResponse = Omit<StoreHistory, 'stores'> & { stores: AnalysisStore[] }
export type AnalysisNearbyResponse = Omit<NearbyStores, 'markers'> & { markers: AnalysisStore[] }
export type AnalysisSnapshotResponse = Omit<StoreSnapshot, 'stores'> & { stores: AnalysisStore[] }

const invalid = () => {
  throw new ApiRequestError('INVALID_RESPONSE', API_MESSAGES.storeResponse, null)
}
const nullableText = (value: unknown) => value === null || typeof value === 'string'
const nullableNumber = (value: unknown) =>
  value === null || (typeof value === 'number' && Number.isFinite(value))

function checked(s: AnalysisStore): AnalysisStore {
  if (
    !s ||
    !['general_restaurant', 'rest_cafe'].includes(s.source) ||
    typeof s.license_no !== 'string' ||
    !s.license_no ||
    !['open', 'closed', 'other'].includes(s.current_status) ||
    !['cafe', 'restaurant'].includes(s.category) ||
    !['cafe', 'korean', 'chinese', 'japanese', 'western'].includes(s.sub_category) ||
    (s.operating_period_status === 'fact'
      ? s.operating_months === null || s.operating_period_reason !== null
      : s.operating_months !== null ||
        ![
          'missing_open_date',
          'invalid_open_date',
          'missing_close_date',
          'invalid_close_date',
          'missing_source_date',
          'invalid_date_order',
          'other_status',
        ].includes(s.operating_period_reason ?? '')) ||
    !['fact', 'no_data'].includes(s.operating_period_status) ||
    !nullableText(s.name) ||
    !nullableText(s.open_date) ||
    !nullableText(s.close_date) ||
    !nullableNumber(s.operating_months) ||
    (s.operating_months !== null &&
      (!Number.isInteger(s.operating_months) || s.operating_months < 0)) ||
    ![s.lat ?? null, s.lng ?? null, s.distance_m ?? null, s.area_m2 ?? null].every(
      nullableNumber,
    ) ||
    (s.location_match != null &&
      !['same_spot', 'same_building', 'unverified'].includes(s.location_match))
  )
    invalid()
  return s
}

export function adaptAnalysisHistory(data: AnalysisHistoryResponse): StoreHistory {
  if (!Array.isArray(data.stores) || data.total !== data.stores.length) invalid()
  const stores: HistoryStore[] = data.stores.map((raw) => {
    const s = checked(raw)
    return {
      ...s,
      store_status: s.current_status,
      floor_unit: s.floor_unit ?? null,
      location_match: s.location_match ?? null,
    }
  })
  return { ...data, stores }
}

function spatial(raw: AnalysisStore): NearbyMarker {
  const s = checked(raw)
  return {
    ...s,
    lat: s.lat ?? null,
    lng: s.lng ?? null,
    distance_m: s.distance_m ?? null,
    area_m2: s.area_m2 ?? null,
  }
}

export function adaptAnalysisNearby(data: AnalysisNearbyResponse): NearbyStores {
  if (!Array.isArray(data.markers) || data.count !== data.markers.length) invalid()
  return { ...data, markers: data.markers.map(spatial) }
}

export function adaptAnalysisSnapshot(data: AnalysisSnapshotResponse): StoreSnapshot {
  if (
    !Array.isArray(data.stores) ||
    data.total_at_as_of !== data.stores.length ||
    data.total_at_as_of !== data.still_open + data.closed_since + data.other
  )
    invalid()
  const stores: SnapshotStore[] = data.stores.map(spatial)
  return { ...data, stores }
}
