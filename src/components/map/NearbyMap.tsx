import { MapPinOff } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CURRENT_STATUS_LABEL, SUB_CATEGORY_LABEL } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { NearbyMarker } from '../../types/stores'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { storeFranchise, storeName, storePeriodLine } from '../../utils/storeDisplay'
import { storeKey } from '../../utils/storeKey'
import LoadingState from '../common/LoadingState'
import type { KakaoCircle, KakaoCustomOverlay, KakaoMap, KakaoMarker } from './kakaoTypes'
import { MARKER_COLOR } from './markerStyle'
import { useKakaoMaps } from './useKakaoMaps'

const T = MESSAGES.nearby

type Props = {
  center: { lat: number; lng: number }
  /** 반경(m) — 서버 radius_m */
  radiusM: number
  markers: NearbyMarker[]
  /** 지도 위 배지 문구 (예: "반경 500m · 기준일 2026.10.31") */
  badge: string
  /** 과거 시점 배지 (예: "2023년 10월 기준"). 있으면 지도 위에 주황색으로 눈에 띄게 표시 */
  pastBadge?: string | null
  /** 강조할 점포 식별값 storeKey(source, license_no) — 표에서 고른 점포 */
  selectedId: string | null
  onSelect: (id: string | null) => void
}

/** 카카오 지도: 진단 위치 마커 + 반경 원 + 현재 상태별 점포 마커 + 정보창 */
export default function NearbyMap({
  center,
  radiusM,
  markers,
  badge,
  pastBadge,
  selectedId,
  onSelect,
}: Props) {
  const sdk = useKakaoMaps()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap | null>(null)
  const circleRef = useRef<KakaoCircle | null>(null)
  const centerMarkerRef = useRef<KakaoMarker | null>(null)
  const centerLabelRef = useRef<KakaoCustomOverlay | null>(null)
  const overlaysRef = useRef(new Map<string, { overlay: KakaoCustomOverlay; el: HTMLElement }>())
  const infoRef = useRef<KakaoCustomOverlay | null>(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // 1) 지도·반경 원·진단 위치 마커 만들기 (SDK 준비 후 한 번)
  useEffect(() => {
    if (sdk.status !== 'ready' || !containerRef.current || mapRef.current) return
    const maps = sdk.maps
    const pos = new maps.LatLng(center.lat, center.lng)
    const map = new maps.Map(containerRef.current, { center: pos, level: 4 })
    map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT)
    mapRef.current = map
    circleRef.current = new maps.Circle({
      center: pos,
      radius: radiusM,
      strokeWeight: 2,
      strokeColor: '#3376fd',
      strokeOpacity: 0.8,
      strokeStyle: 'shortdash',
      fillColor: '#3376fd',
      fillOpacity: 0.08,
      map,
    })
    centerMarkerRef.current = new maps.Marker({
      position: pos,
      map,
      title: T.myLocation,
      zIndex: 30,
    })
    centerLabelRef.current = new maps.CustomOverlay({
      position: pos,
      content: makeCenterLabel(),
      yAnchor: 2.9,
      zIndex: 31,
      map,
    })
    const overlays = overlaysRef.current
    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null))
      overlays.clear()
      infoRef.current?.setMap(null)
      circleRef.current?.setMap(null)
      centerMarkerRef.current?.setMap(null)
      centerLabelRef.current?.setMap(null)
      mapRef.current = null
    }
    // 지도는 한 번만 만들고, 위치·반경 변경은 아래 효과에서 반영한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk.status])

  // 2) 위치·반경이 바뀌면 원·마커를 옮기고 원이 다 보이게 맞춘다
  useEffect(() => {
    if (sdk.status !== 'ready' || !mapRef.current || !circleRef.current) return
    const pos = new sdk.maps.LatLng(center.lat, center.lng)
    circleRef.current.setPosition(pos)
    circleRef.current.setRadius(radiusM)
    centerMarkerRef.current?.setPosition(pos)
    centerLabelRef.current?.setPosition(pos)
    mapRef.current.setBounds(circleRef.current.getBounds())
  }, [sdk, center.lat, center.lng, radiusM])

  // 3) 점포 마커 다시 그리기 — 키·클릭 인자는 원천+관리번호 (관리번호만 같은 다른 원천 점포와 섞이지 않게)
  useEffect(() => {
    if (sdk.status !== 'ready' || !mapRef.current) return
    const map = mapRef.current
    const overlays = overlaysRef.current
    overlays.forEach(({ overlay }) => overlay.setMap(null))
    overlays.clear()
    for (const m of markers) {
      const id = storeKey(m.source, m.license_no)
      const el = makeMarkerElement(m)
      el.addEventListener('click', () => onSelectRef.current(id))
      const overlay = new sdk.maps.CustomOverlay({
        position: new sdk.maps.LatLng(m.lat, m.lng),
        content: el,
        clickable: true,
        zIndex: 10,
        map,
      })
      overlays.set(id, { overlay, el })
    }
    // 반경·필터·시점이 바뀌거나 지도가 사라지면 이전 마커를 지도에서 내린다
    return () => {
      overlays.forEach(({ overlay }) => overlay.setMap(null))
      overlays.clear()
    }
  }, [sdk, markers])

  // 4) 선택한 점포 강조 + 정보창
  useEffect(() => {
    if (sdk.status !== 'ready' || !mapRef.current) return
    overlaysRef.current.forEach(({ overlay, el }, id) => {
      const on = id === selectedId
      el.dataset.selected = on ? 'true' : 'false'
      overlay.setZIndex(on ? 20 : 10)
    })
    infoRef.current?.setMap(null)
    infoRef.current = null
    const store = markers.find((m) => storeKey(m.source, m.license_no) === selectedId)
    if (!store) return
    const pos = new sdk.maps.LatLng(store.lat, store.lng)
    infoRef.current = new sdk.maps.CustomOverlay({
      position: pos,
      content: makeInfoElement(store, () => onSelectRef.current(null)),
      yAnchor: 1.15,
      clickable: true,
      zIndex: 40,
      map: mapRef.current,
    })
    mapRef.current.panTo(pos)
  }, [sdk, selectedId, markers])

  return (
    <div className="relative h-[420px] overflow-hidden rounded-card border border-gray-300 bg-gray-100">
      {sdk.status === 'error' ? (
        <div
          role="alert"
          className="flex h-full flex-col items-center justify-center gap-2 text-center text-body text-gray-600"
        >
          <MapPinOff className="size-7 text-gray-300" aria-hidden="true" />
          {T.mapFailed}
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            role="region"
            aria-label={T.mapRegion}
            className="h-full w-full"
          />
          {sdk.status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingState message={T.mapLoading} />
            </div>
          )}
          <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-gray-0 px-3 py-1.5 text-caption font-semibold text-gray-900 shadow-card">
              {T.mapTitle}
              <span className="ml-2 font-normal text-blue-700">{badge}</span>
            </p>
            {pastBadge && (
              <p className="rounded-full bg-orange-500 px-3 py-1.5 text-caption font-bold text-white shadow-card">
                {pastBadge}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* ───────── 지도 위에 올리는 DOM 요소 (textContent로만 채워 안전하게) ───────── */

function makeCenterLabel(): HTMLElement {
  const el = document.createElement('div')
  el.className =
    'rounded-full bg-blue-700 px-2.5 py-1 text-micro font-bold text-white shadow-card whitespace-nowrap'
  el.textContent = T.myLocation
  return el
}

function makeMarkerElement(m: NearbyMarker): HTMLElement {
  const el = document.createElement('div')
  const color = MARKER_COLOR[m.current_status]
  // 상호가 없으면 "정보 없음" (문자열 "null"·빈 title이 나오지 않게)
  el.title = `${storeName(m).text} · ${CURRENT_STATUS_LABEL[m.current_status]}`
  el.className = cn(
    'size-3.5 cursor-pointer rounded-full border-2 border-white shadow transition-transform',
    'data-[selected=true]:scale-150 data-[selected=true]:ring-4',
    color.dot,
    color.ring,
  )
  return el
}

function makeInfoElement(m: NearbyMarker, onClose: () => void): HTMLElement {
  const box = document.createElement('div')
  box.className =
    'relative w-60 rounded-control bg-gray-0 p-3 text-left text-caption text-gray-900 shadow-card ring-1 ring-gray-300'
  const title = document.createElement('p')
  title.className = 'pr-6 text-body font-bold'
  title.textContent = storeName(m).text
  box.appendChild(title)

  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'absolute top-2 right-2 rounded px-1.5 text-gray-600 hover:bg-gray-100'
  close.setAttribute('aria-label', T.infoClose)
  close.textContent = '×'
  close.addEventListener('click', onClose)
  box.appendChild(close)

  const rows: [string, string][] = [
    [T.info.category, SUB_CATEGORY_LABEL[m.sub_category]],
    [T.info.openDate, formatDate(m.open_date) ?? '—'],
    // 0은 "0개월", 미산정은 "정보 없음 (사유)"
    [T.info.period, storePeriodLine(m)],
    [T.info.status, CURRENT_STATUS_LABEL[m.current_status]],
    // 표와 같은 근거 문구 (예: 프랜차이즈(추정) · 2025년 브랜드 목록과 상호 일치 · 실제 계약·과거 소속 아님)
    [T.info.franchise, franchiseLine(m)],
  ]
  const dl = document.createElement('dl')
  dl.className = 'mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5'
  for (const [k, v] of rows) {
    const dt = document.createElement('dt')
    dt.className = 'text-gray-600'
    dt.textContent = k
    const dd = document.createElement('dd')
    dd.textContent = v
    dl.append(dt, dd)
  }
  box.appendChild(dl)
  return box
}

function franchiseLine(m: NearbyMarker): string {
  const f = storeFranchise(m)
  return f.help ? `${f.label} (${f.help})` : f.label
}
