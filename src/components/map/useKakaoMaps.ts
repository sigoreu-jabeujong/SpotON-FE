import { useEffect, useState } from 'react'
import type { KakaoMapsNamespace } from './kakaoTypes'
import { loadKakaoMaps } from './loadKakaoMaps'

type State =
  | { status: 'loading'; maps: null }
  | { status: 'ready'; maps: KakaoMapsNamespace }
  | { status: 'error'; maps: null; reason: string }

/** 카카오맵 SDK 준비 상태. 키가 없거나 불러오기에 실패하면 status: 'error' */
export function useKakaoMaps(): State {
  const [state, setState] = useState<State>(() =>
    window.kakao?.maps?.LatLng
      ? { status: 'ready', maps: window.kakao.maps }
      : { status: 'loading', maps: null },
  )

  useEffect(() => {
    if (state.status !== 'loading') return
    let alive = true
    loadKakaoMaps().then(
      (maps) => alive && setState({ status: 'ready', maps }),
      (e: unknown) =>
        alive &&
        setState({
          status: 'error',
          maps: null,
          reason: e instanceof Error ? e.message : 'KAKAO_UNKNOWN',
        }),
    )
    return () => {
      alive = false
    }
  }, [state.status])

  return state
}
