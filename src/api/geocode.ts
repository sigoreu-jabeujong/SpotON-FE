import type { GeocodeParams, GeocodeResult } from '../types/geocode'
import { apiGet } from './client'

/** F-01 주소 → 좌표·건물 키 (GET /api/geocode) */
export function getGeocode(params: GeocodeParams) {
  return apiGet<GeocodeResult>('/geocode', params)
}
