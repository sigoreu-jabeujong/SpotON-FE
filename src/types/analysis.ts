import type {
  StoreSource,
  ApiSubCategory,
  OperatingPeriodReason,
  StoreStatus,
  LocationMatch,
} from './stores'
import type { Category } from '../constants/diagnosis'
import type { LocationRelation } from './addressDetail'
export type AnalysisStore = {
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
}
