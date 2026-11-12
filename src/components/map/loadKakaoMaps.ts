import type { KakaoMapsNamespace } from './kakaoTypes'

/**
 * 카카오맵 SDK를 한 번만 동적으로 불러온다 (autoload=false → kakao.maps.load 후 사용).
 * 키는 브라우저 공개용 JavaScript 키(VITE_KAKAO_JS_KEY)이며, 카카오 개발자 콘솔에
 * 허용 도메인을 등록해야 동작한다 (CLAUDE.md 키 규칙 예외, 07 데이터 활용 명세서 8.4).
 */
const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'
const LOAD_TIMEOUT_MS = 10000

let loading: Promise<KakaoMapsNamespace> | null = null

export function loadKakaoMaps(): Promise<KakaoMapsNamespace> {
  if (window.kakao?.maps?.LatLng) return Promise.resolve(window.kakao.maps)
  if (loading) return loading

  const key = import.meta.env.VITE_KAKAO_JS_KEY
  if (!key) return Promise.reject(new Error('KAKAO_KEY_MISSING'))

  loading = new Promise<KakaoMapsNamespace>((resolve, reject) => {
    const fail = (reason: string) => {
      loading = null // 다음에 다시 시도할 수 있게
      reject(new Error(reason))
    }
    const timer = window.setTimeout(() => fail('KAKAO_LOAD_TIMEOUT'), LOAD_TIMEOUT_MS)

    const script = document.createElement('script')
    // libraries=clusterer: 마커가 많을 때 묶어 그리는 무료 SDK 라이브러리 (새 npm 패키지 아님)
    script.src = `${SDK_URL}?appkey=${encodeURIComponent(key)}&autoload=false&libraries=clusterer`
    script.async = true
    script.onerror = () => {
      window.clearTimeout(timer)
      script.remove()
      fail('KAKAO_SCRIPT_ERROR')
    }
    script.onload = () => {
      const maps = window.kakao?.maps
      if (!maps) {
        window.clearTimeout(timer)
        fail('KAKAO_SDK_MISSING')
        return
      }
      // 허용 도메인이 아니면 load 콜백이 오지 않을 수 있어 시간 제한으로 실패 처리
      maps.load(() => {
        window.clearTimeout(timer)
        resolve(maps)
      })
    }
    document.head.appendChild(script)
  })
  return loading
}
