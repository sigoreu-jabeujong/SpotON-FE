/**
 * 카카오맵 JavaScript SDK 타입 — Spot:ON이 쓰는 부분만 직접 선언한다.
 * (외부 타입 패키지를 추가하지 않고 any 없이 쓰기 위함. 필요한 API가 늘면 여기에 추가)
 * 공식 문서: https://apis.map.kakao.com/web/documentation/
 */

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void
  panTo(latlng: KakaoLatLng): void
  setBounds(bounds: KakaoLatLngBounds, paddingTop?: number): void
  relayout(): void
  getLevel(): number
  setLevel(level: number): void
  addControl(control: KakaoZoomControl, position: number): void
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void
  setPosition(latlng: KakaoLatLng): void
  setZIndex(z: number): void
}

export interface KakaoCircle {
  setMap(map: KakaoMap | null): void
  setPosition(latlng: KakaoLatLng): void
  setRadius(meters: number): void
  getBounds(): KakaoLatLngBounds
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void
  setPosition(latlng: KakaoLatLng): void
  setContent(content: HTMLElement | string): void
  setZIndex(z: number): void
}

/** 확대·축소 버튼 (빈 객체 표식) */
export type KakaoZoomControl = { readonly __kakaoZoomControl: unique symbol }

export interface KakaoMapsNamespace {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => KakaoLatLngBounds
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number; draggable?: boolean },
  ) => KakaoMap
  Marker: new (options: {
    position: KakaoLatLng
    map?: KakaoMap
    title?: string
    zIndex?: number
  }) => KakaoMarker
  Circle: new (options: {
    center: KakaoLatLng
    radius: number
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: 'solid' | 'shortdash' | 'dash' | 'longdash'
    fillColor?: string
    fillOpacity?: number
    map?: KakaoMap
  }) => KakaoCircle
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: HTMLElement | string
    map?: KakaoMap
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
    clickable?: boolean
  }) => KakaoCustomOverlay
  ZoomControl: new () => KakaoZoomControl
  ControlPosition: { RIGHT: number; TOPRIGHT: number; BOTTOMRIGHT: number }
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsNamespace }
  }
}
