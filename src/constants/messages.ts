/** 화면에 보이는 안내·오류·면책 문구 (한곳에서 관리) */
export const MESSAGES = {
  /** ① 랜딩 */
  landing: {
    slogan: 'Is your spot on? — 내 자리, 딱 맞는 자리일까요?',
    titleLine1: '창업 전,',
    titleLine2: '그 자리의 과거를 확인하세요',
    description: '주소를 입력하고 입지 진단을 시작해 보세요.',
    start: '진단 시작하기',
    scope: '현재 서울특별시 카페·음식점(한식·중식·일식·양식)을 진단할 수 있어요',
    mapAlt: '전국 지도 그림',
  },
  /** ② 주소·업종 입력 (주소 검색 API 오류 문구는 ERROR_MESSAGES 사용) */
  input: {
    eyebrow: 'DATA-BASED INSIGHT',
    introTitleLine1: '좋은 자리는,',
    introTitleLine2: '데이터로 보입니다.',
    introDescription:
      '데이터를 바탕으로 과거 점포 이력과 주변 상권을 분석해, 더 나은 창업 결정을 돕습니다.',
    features: ['객관적인 데이터 분석', '한눈에 보는 상권 정보', '창업 전 체크리스트 제공'],
    step: 'STEP 01',
    cardTitle: '진단할 주소와 업종을 선택해 주세요',
    cardDescription: '주소와 업종을 입력하면 과거 점포 이력부터 주변 상권까지 분석할 수 있어요.',
    addressLabel: '진단 위치 입력',
    addressPlaceholder: '도로명 주소 또는 지번 주소를 입력하세요',
    addressExample: '예) 서울특별시 강남구 강남대로 396',
    searchButton: '주소 검색',
    categoryLabel: '업종 선택',
    required: '*필수 입력 항목입니다.',
    submit: '이 자리 진단하기',
    searching: '주소를 찾는 중이에요',
    candidatesTitle: '주소 후보가 여러 개예요. 진단할 주소를 골라 주세요.',
    candidateJibun: '지번',
    scope: '현재 서울특별시 카페·음식점(한식·중식·일식·양식)을 진단할 수 있어요',
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
  /** 결과 화면 공통 틀 */
  layout: {
    eyebrow: 'DATA - BASED INSIGHT',
    ageNotice: '만 18세 이상 예비창업자를 대상으로 해요.',
    baselinePending: '데이터 기준일은 결과를 불러오면 표시돼요.',
    skipToContent: '본문 바로가기',
    logoLabel: 'Spot:ON 처음 화면으로',
  },
  /** 결과 화면별 머리 제목·설명 */
  resultPages: {
    analysis: {
      title: '창업 전, 이 자리를 더 자세히 살펴보세요.',
      description: '과거 점포 이력과 주변 상권 정보를 한눈에 확인해 보세요.',
    },
    summary: {
      title: '종합 진단 결과',
      description: '서울시 공식 지표와 참고지표, AI 해석으로 계약 전에 살펴볼 점을 확인해 보세요.',
    },
    share: {
      title: '결과 저장 및 상담',
      description: '진단 결과를 저장하고 창업에 필요한 상담·지원 정보를 확인해 보세요.',
    },
  },
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
