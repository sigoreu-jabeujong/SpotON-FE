/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_MOCK?: string
  /** 목업 모드에서 실제 서버로 부를 API 경로 (쉼표 목록, 예: "/geocode,/stores/history") */
  readonly VITE_REAL_API_PATHS?: string
  /** 카카오맵 JavaScript 키 (브라우저 공개용, 허용 도메인 등록 필수) */
  readonly VITE_KAKAO_JS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
