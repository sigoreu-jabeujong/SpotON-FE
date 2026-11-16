import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { apiGet } from '../../api/client'
import { normalizeAddressDetail } from '../../api/addressDetail'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import type { GeocodeResult } from '../../types/geocode'

import { addressIdentity, confirmed } from '../../utils/addressConfirmation'
export default function AddressVerification({ children }: { children: ReactNode }) {
  const { query, search, isReady } = useDiagnosisQuery()
  const location = useLocation()
  const identity = addressIdentity(search)
  const params = new URLSearchParams(location.search)
  const invalid =
    ['historyScope', 'historyIdentity'].some((key) => params.getAll(key).length > 1) ||
    (params.has('historyScope') && !['floor', 'unit'].includes(params.get('historyScope')!)) ||
    (params.has('historyIdentity') &&
      !['address_scope', 'verified_building'].includes(params.get('historyIdentity')!)) ||
    (params.has('detailMode') && params.get('detailMode') !== 'unverified') ||
    (query.detailText?.length ?? 0) > 100 ||
    ['address', 'bk', 'floor', 'detail', 'detailMode', 'lat', 'lng'].some(
      (key) => params.getAll(key).length > 1,
    ) ||
    (query.detailUnverified && !!query.floorUnit)
  const [checked, setChecked] = useState('')
  const [failed, setFailed] = useState('')
  useEffect(() => {
    if (!isReady || invalid || confirmed.has(identity)) return
    const abort = new AbortController()
    const text =
      query.floorUnit && !query.address.endsWith(query.floorUnit)
        ? `${query.address} ${query.floorUnit}`
        : query.address
    const normalize =
      query.detailText && !query.detailUnverified
        ? normalizeAddressDetail(query.detailText, abort.signal).then((data) => {
            if (data.floor_unit !== query.floorUnit) throw new Error('detail_mismatch')
          })
        : Promise.resolve()
    void normalize
      .then(() =>
        apiGet<GeocodeResult>(
          '/geocode',
          { query: text, category: query.category },
          { signal: abort.signal, timeoutMs: 60000 },
        ),
      )
      .then(({ data }) => {
        if (abort.signal.aborted) return
        const rows = data.candidates.length ? data.candidates : [data]
        const matches = rows.filter(
          (c) => c.building_key === query.buildingKey && c.lat === query.lat && c.lng === query.lng,
        )
        if (matches.length !== 1 || matches[0].floor_unit !== query.floorUnit) {
          setFailed(identity)
          return
        }
        if (confirmed.size >= 128) confirmed.clear()
        confirmed.add(identity)
        setChecked(identity)
      })
      .catch(() => {
        if (!abort.signal.aborted) setFailed(identity)
      })
    return () => abort.abort()
  }, [
    isReady,
    invalid,
    identity,
    query.address,
    query.category,
    query.floorUnit,
    query.buildingKey,
    query.lat,
    query.lng,
    query.detailText,
    query.detailUnverified,
  ])
  if (!isReady) return <>{children}</>
  if (!invalid && (confirmed.has(identity) || checked === identity)) return <>{children}</>
  return (
    <main className="p-6" role="status">
      <p>
        {invalid || failed === identity
          ? '주소·상세 위치를 다시 확인해 주세요. 이전 조건으로 자동 조회하지 않았어요.'
          : '주소와 상세 위치를 확인하고 있어요…'}
      </p>
      <Link to={{ pathname: '/diagnose', search }} className="mt-4 inline-block underline">
        주소 확인하기
      </Link>
    </main>
  )
}
