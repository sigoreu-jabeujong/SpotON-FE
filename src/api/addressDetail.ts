import type { AddressDetail } from '../types/addressDetail'
import { apiPost } from './client'

export async function normalizeAddressDetail(
  detail: string,
  signal?: AbortSignal,
): Promise<AddressDetail> {
  const { data } = await apiPost<AddressDetail>('/address-detail', { detail }, { signal })
  if (
    !data ||
    !['parsed', 'empty', 'unverified'].includes(data.status) ||
    ![null, 'empty', 'no_detail', 'ambiguous', 'invalid'].includes(data.reason) ||
    (data.status === 'parsed'
      ? typeof data.floor_unit !== 'string' || !data.floor_unit
      : data.floor_unit !== null)
  )
    throw new Error('invalid_address_detail')
  return data
}
