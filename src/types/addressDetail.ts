export type AddressDetail = {
  floor_unit: string | null
  status: 'parsed' | 'empty' | 'unverified'
  reason: 'empty' | 'no_detail' | 'ambiguous' | 'invalid' | null
}
export type LocationRelation = {
  building: 'matched_address_scope'
  basis: 'canonical_jibun_key'
  floor: 'match' | 'different' | 'unknown'
  unit: 'match' | 'different' | 'unknown'
  relation_level: 'same_spot' | 'same_floor' | 'same_building_scope' | 'unverified'
}
