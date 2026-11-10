/** 화면에 보이는 안내·오류·면책 문구 (한곳에서 관리) */
export const MESSAGES = {
  input: {
    addressRequired: '점포 주소를 입력해 주세요',
    addressNotFound: '주소를 찾을 수 없어요. 도로명 또는 지번 주소를 다시 확인해 주세요',
    outsideSeoul: '지금은 서울특별시 주소만 진단할 수 있어요',
    categoryRequired: '업종을 하나 골라 주세요',
  },
  common: {
    loading: '불러오는 중이에요',
    error: '정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요',
    empty: '조건에 맞는 결과가 없어요',
  },
  ai: {
    unavailable: 'AI 해석을 불러오지 못했어요. 계산된 지표는 그대로 확인할 수 있어요',
  },
  disclaimer:
    '이 결과는 공공데이터 기반 참고 정보이며 창업의 성공·실패를 판단하지 않아요. 개별 사업주의 역량은 반영하지 않았어요.',
} as const

/**
 * 오류 코드별 화면 안내 문구 (docs/api-contract.md 5장)
 * 서버 오류 9종 + FE 전용(TIMEOUT·NETWORK_ERROR)
 */
export const ERROR_MESSAGES = {
  INVALID_PARAM: '입력값을 다시 확인해 주세요.',
  CATEGORY_REQUIRED: '카페 또는 음식점을 선택해 주세요.',
  ADDRESS_NOT_FOUND: '주소를 찾지 못했어요. 도로명 또는 지번 주소로 다시 입력해 주세요.',
  OUT_OF_SEOUL: '현재는 서울특별시 주소만 진단할 수 있어요.',
  AS_OF_OUT_OF_RANGE: '선택한 시점은 데이터 제공 범위 밖이에요.',
  UPSTREAM_ERROR: '잠시 후 다시 시도해 주세요.',
  AI_UNAVAILABLE: 'AI 해석을 불러오지 못했어요.',
  AI_VERIFY_FAILED: 'AI 해석을 불러오지 못했어요.',
  INTERNAL_ERROR: '일시적인 오류가 발생했어요.',
  TIMEOUT: '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '서버에 연결할 수 없어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
} as const
export type ErrorCode = keyof typeof ERROR_MESSAGES

const isErrorCode = (code: string): code is ErrorCode => code in ERROR_MESSAGES

/** 오류 코드 → 안내 문구. 모르는 코드면 공통 오류 문구 */
export function getErrorMessage(code: string | null | undefined): string {
  return code && isErrorCode(code) ? ERROR_MESSAGES[code] : MESSAGES.common.error
}

/** 잡힌 오류 객체(ApiRequestError 등)에서 code를 꺼내 안내 문구를 찾는다 */
export function getErrorMessageFrom(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
  return getErrorMessage(typeof code === 'string' ? code : null)
}
