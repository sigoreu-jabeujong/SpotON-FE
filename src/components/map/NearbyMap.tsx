import { MapPinOff } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CURRENT_STATUS_LABEL, SUB_CATEGORY_LABEL } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type { NearbyMarker } from '../../types/stores'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { storeFranchise, storeName, storePeriodLine } from '../../utils/storeDisplay'
import { storeKey } from '../../utils/storeKey'
import LoadingState from '../common/LoadingState'
import { CLUSTER_MIN_GROUPS, findGroupOf, groupMarkers, type MarkerGroup } from './groupMarkers'
import type {
  KakaoCircle,
  KakaoCustomOverlay,
  KakaoMap,
  KakaoMarker,
  KakaoMarkerClusterer,
} from './kakaoTypes'
import { MARKER_COLOR, MIXED_COLOR } from './markerStyle'
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

/** 선택 시 마커를 화면 중심보다 이만큼(px) 아래에 두어 위쪽 정보창이 지도 안에 들어오게 */
const INFO_PAN_OFFSET_PX = 120

/** 클러스터 원 모양 (상태 색이 아닌 중립 파랑, 숫자 = 묶인 마커 수) */
const CLUSTER_STYLE: Partial<CSSStyleDeclaration> = {
  width: '38px',
  height: '38px',
  lineHeight: '34px',
  borderRadius: '19px',
  background: 'rgba(13, 80, 215, 0.85)',
  border: '2px solid #ffffff',
  color: '#ffffff',
  textAlign: 'center',
  fontWeight: '700',
  fontSize: '13px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
}

/**
 * 카카오 지도: 진단 위치 마커 + 반경 원 + 점포 마커 + 정보창
 * - 같은 좌표 점포는 마커 1개(숫자 배지)로 묶고, 누르면 정보창에 점포 목록 (groupMarkers)
 * - 묶음이 많으면(CLUSTER_MIN_GROUPS 초과) 카카오 clusterer로 가까운 마커를 합쳐 그린다 (보이는 방식만)
 * - 점포 식별은 storeKey(source, license_no) — 표 선택과 같은 값
 */
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
  const overlaysRef = useRef<KakaoCustomOverlay[]>([])
  const clustererRef = useRef<KakaoMarkerClusterer | null>(null)
  const highlightRef = useRef<KakaoCustomOverlay | null>(null)
  const infoRef = useRef<KakaoCustomOverlay | null>(null)
  const onSelectRef = useRef(onSelect)

  const groups = useMemo(() => groupMarkers(markers), [markers])

  // 지도에서 묶음 마커를 눌러 연 목록 (점포를 아직 고르지 않은 상태). 점포 목록이 바뀌면 닫는다
  const [openGroup, setOpenGroup] = useState<{ groups: MarkerGroup[]; key: string } | null>(null)
  const openGroupKey = openGroup?.groups === groups ? openGroup.key : null
  // 선택한 점포가 있으면 그 점포의 묶음, 없으면 지도에서 연 묶음
  const activeGroup =
    findGroupOf(groups, selectedId) ?? groups.find((g) => g.key === openGroupKey) ?? null

  const onGroupClickRef = useRef<(g: MarkerGroup) => void>(() => {})
  useEffect(() => {
    onSelectRef.current = onSelect
    onGroupClickRef.current = (g) => {
      if (g.stores.length === 1) {
        setOpenGroup(null)
        onSelect(storeKey(g.stores[0].source, g.stores[0].license_no))
      } else {
        // 여러 점포 → 목록부터 (다른 묶음의 선택은 푼다)
        onSelect(null)
        setOpenGroup({ groups, key: g.key })
      }
    }
  }, [onSelect, groups])

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
    // SDK가 넣는 카카오 로고 링크·마커 영역에는 이름이 없어 화면 읽기 프로그램용 이름을 붙인다 (SDK 동작은 그대로)
    const container = containerRef.current
    const labelLinks = () => {
      container.querySelectorAll('a:not([aria-label])').forEach((a) => {
        if (!a.textContent?.trim()) a.setAttribute('aria-label', T.kakaoLogo)
      })
      // 진단 위치 마커의 이미지 맵 영역(<area alt="">)도 title을 대체 텍스트로
      container.querySelectorAll('area').forEach((area) => {
        const title = area.getAttribute('title')
        if (title && !area.getAttribute('alt')) area.setAttribute('alt', title)
      })
    }
    labelLinks()
    const observer = new MutationObserver(labelLinks)
    observer.observe(container, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      clustererRef.current?.clear()
      clustererRef.current?.setMap(null)
      clustererRef.current = null
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
      highlightRef.current?.setMap(null)
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

  // 3) 점포 마커(묶음) 다시 그리기 — 많으면 clusterer에 넣어 화면에 보이는 묶음만 그린다
  useEffect(() => {
    if (sdk.status !== 'ready' || !mapRef.current) return
    const maps = sdk.maps
    const map = mapRef.current
    const useCluster = groups.length > CLUSTER_MIN_GROUPS && !!maps.MarkerClusterer
    const overlays = groups.map((g) => {
      const el = makeMarkerElement(g)
      el.addEventListener('click', () => onGroupClickRef.current(g))
      return new maps.CustomOverlay({
        position: new maps.LatLng(g.lat, g.lng),
        content: el,
        clickable: true,
        zIndex: 10,
        ...(useCluster ? {} : { map }),
      })
    })
    overlaysRef.current = overlays
    if (useCluster && maps.MarkerClusterer) {
      const clusterer = new maps.MarkerClusterer({
        map,
        averageCenter: true,
        gridSize: 60,
        minClusterSize: 2,
        styles: [CLUSTER_STYLE],
      })
      clusterer.addMarkers(overlays)
      clustererRef.current = clusterer
    }
    // 반경·필터·시점이 바뀌거나 지도가 사라지면 이전 마커·묶음을 지도에서 내린다
    return () => {
      clustererRef.current?.clear()
      clustererRef.current?.setMap(null)
      clustererRef.current = null
      overlays.forEach((o) => o.setMap(null))
      overlaysRef.current = []
    }
  }, [sdk, groups])

  // 4) 선택 강조 + 정보창 — 강조 마커는 클러스터 밖에 따로 그려 묶여 있어도 보이게 한다
  const activeKey = activeGroup?.key ?? null
  useEffect(() => {
    if (sdk.status !== 'ready' || !mapRef.current) return
    const group = groups.find((g) => g.key === activeKey)
    if (!group) return
    const maps = sdk.maps
    const pos = new maps.LatLng(group.lat, group.lng)
    const highlight = new maps.CustomOverlay({
      position: pos,
      content: makeMarkerElement(group, true),
      zIndex: 20,
      map: mapRef.current,
    })
    const selected = group.stores.find((s) => storeKey(s.source, s.license_no) === selectedId)
    const close = () => {
      setOpenGroup(null)
      onSelectRef.current(null)
    }
    const info = new maps.CustomOverlay({
      position: pos,
      content:
        group.stores.length === 1 && selected
          ? makeInfoElement(selected, close)
          : makeGroupInfoElement(group, selectedId, (id) => onSelectRef.current(id), close),
      yAnchor: 1.12,
      clickable: true,
      zIndex: 40,
      map: mapRef.current,
    })
    highlightRef.current = highlight
    infoRef.current = info
    // 정보창이 마커 위로 길게 열리므로, 마커가 지도 아래쪽에 오도록 화면 중심을 위로 옮겨 잘리지 않게 한다
    // (보기 위치만 옮김 — 점포 좌표는 그대로)
    const proj = mapRef.current.getProjection()
    const p = proj.pointFromCoords(pos)
    mapRef.current.panTo(proj.coordsFromPoint(new maps.Point(p.x, p.y - INFO_PAN_OFFSET_PX)))
    // 키보드: Esc로 정보창 닫기 (표에서 고른 뒤에도 바로 닫을 수 있게)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      highlight.setMap(null)
      info.setMap(null)
      highlightRef.current = null
      infoRef.current = null
    }
  }, [sdk, groups, activeKey, selectedId])

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
            aria-describedby="nearby-map-hint"
            className="h-full w-full"
          />
          <p id="nearby-map-hint" className="sr-only">
            {T.mapKeyboardHint}
          </p>
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

/**
 * 점포 마커 — 1곳이면 기존 점, 여러 곳이면 숫자 배지가 있는 조금 큰 원.
 * 색은 최신 데이터 기준 상태 (묶음 안 상태가 섞이면 회색 "상태 섞임").
 */
function makeMarkerElement(g: MarkerGroup, selected = false): HTMLElement {
  const el = document.createElement('div')
  const color = g.status === 'mixed' ? MIXED_COLOR : MARKER_COLOR[g.status]
  const count = g.stores.length
  // 상호가 없으면 "정보 없음" (문자열 "null"·빈 title이 나오지 않게)
  el.title =
    count === 1
      ? `${storeName(g.stores[0]).text} · ${CURRENT_STATUS_LABEL[g.stores[0].current_status]}`
      : T.groupTitle(count)
  el.className = cn(
    'cursor-pointer rounded-full border-2 border-white shadow transition-transform',
    count === 1
      ? 'size-3.5'
      : 'flex size-5 items-center justify-center text-[10px] font-bold text-white',
    selected && 'scale-150 ring-4',
    color.dot,
    color.ring,
  )
  if (count > 1) el.textContent = String(count)
  if (selected) el.dataset.selected = 'true'
  return el
}

/** 정보창 상자 + 닫기 버튼 */
function makeInfoBox(title: string, onClose: () => void): HTMLElement {
  const box = document.createElement('div')
  box.className =
    'relative w-64 rounded-control bg-gray-0 p-3 text-left text-caption text-gray-900 shadow-card ring-1 ring-gray-300'
  const h = document.createElement('p')
  h.className = 'pr-6 text-body font-bold break-keep'
  h.textContent = title
  box.appendChild(h)
  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'absolute top-2 right-2 rounded px-1.5 text-gray-600 hover:bg-gray-100'
  close.setAttribute('aria-label', T.infoClose)
  close.textContent = '×'
  close.addEventListener('click', onClose)
  box.appendChild(close)
  return box
}

/** 점포 한 곳의 상세 줄 */
function makeDetailList(m: NearbyMarker): HTMLElement {
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
  return dl
}

function makeInfoElement(m: NearbyMarker, onClose: () => void): HTMLElement {
  const box = makeInfoBox(storeName(m).text, onClose)
  box.appendChild(makeDetailList(m))
  return box
}

/**
 * 같은 위치 여러 점포 — 목록(상호·상태·프랜차이즈)에서 하나를 고르면 표 선택과 같은 값(storeKey)으로 동기화.
 * 고른 점포는 목록에서 강조하고 아래에 상세를 보여준다.
 */
function makeGroupInfoElement(
  g: MarkerGroup,
  selectedId: string | null,
  onPick: (id: string) => void,
  onClose: () => void,
): HTMLElement {
  const box = makeInfoBox(T.groupTitle(g.stores.length), onClose)
  const hint = document.createElement('p')
  hint.className = 'mt-0.5 text-micro text-gray-600'
  hint.textContent = T.groupHint
  box.appendChild(hint)
  const list = document.createElement('ul')
  list.className = cn(
    'mt-2 flex flex-col gap-1 overflow-y-auto',
    selectedId ? 'max-h-24' : 'max-h-44', // 상세가 함께 열리면 목록을 줄여 지도 안에 들어오게
  )
  let selected: NearbyMarker | null = null
  for (const s of g.stores) {
    const id = storeKey(s.source, s.license_no)
    const on = id === selectedId
    if (on) selected = s
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = cn(
      'w-full rounded px-2 py-1 text-left hover:bg-blue-100',
      on && 'bg-blue-100 font-semibold text-blue-700',
    )
    if (on) b.setAttribute('aria-current', 'true')
    const name = document.createElement('span')
    name.className = 'block break-keep'
    name.textContent = storeName(s).text
    const meta = document.createElement('span')
    meta.className = 'block text-micro font-normal text-gray-600'
    meta.textContent = `${CURRENT_STATUS_LABEL[s.current_status]} · ${storeFranchise(s).label}`
    b.append(name, meta)
    b.addEventListener('click', () => onPick(id))
    li.appendChild(b)
    list.appendChild(li)
  }
  box.appendChild(list)
  if (selected) box.appendChild(makeDetailList(selected))
  return box
}

function franchiseLine(m: NearbyMarker): string {
  const f = storeFranchise(m)
  return f.help ? `${f.label} (${f.help})` : f.label
}
