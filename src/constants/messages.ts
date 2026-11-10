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
  /** STEP 02 ① 과거 점포 이력 */
  history: {
    summary: (total: number) => `이 건물에서 확인된 음식점·카페 인허가 기록 ${total}건`,
    noFloor: '입력한 주소에 층·호실이 없어 건물 단위 이력으로 보여줘요',
    sortLabel: '최근 개업 순',
    caption: '이 건물을 거쳐 간 음식점·카페 점포 이력 (최근 개업 순)',
    columns: {
      no: '번호',
      name: '점포명',
      category: '업종',
      openDate: '개업일',
      closeDate: '폐업일',
      period: '영업 기간',
      status: '상태',
      location: '위치',
      franchise: '프랜차이즈',
    },
    noCloseDate: '폐업일 없음',
    notices: [
      '공공데이터 기반 정보로 실제 현황과 다를 수 있어요.',
      '폐업일은 행정상 신고 기록 기준이에요.',
      '프랜차이즈 여부는 공정위 가맹정보와 상호를 비교한 추정값이에요.',
    ],
    noticeTitle: '이력 확인 시 참고하세요',
    spaceBuilding: '건물 단위',
  },
  /** 진단 조건 필터 바 (STEP 02 ② 위쪽) */
  filter: {
    title: '조회 조건',
    radius: '거리 범위',
    subCategory: '세부 업종',
    subCategoryAll: '선택하지 않으면 음식점 전체',
    area: '시설 규모',
    franchise: '프랜차이즈 여부',
    includeUnknown: '정보 없음 점포 포함',
    includeUnknownHint: '면적·프랜차이즈 정보가 없는 점포도 함께 보여줘요',
    submit: '조회',
    scopeNotice: '이 조건은 지도·시점 조회·상권 활동·종합 진단에 함께 적용돼요',
    unchanged: '바뀐 조건이 없어요',
    asOf: '기준 시점',
    asOfCurrent: '현재',
    asOfYear: '연도',
    asOfMonth: '월',
    asOfYearOption: (y: number) => `${y}년`,
    asOfMonthOption: (m: number) => `${m}월`,
    asOfQuick: [
      { label: '1년 전', months: 12 },
      { label: '3년 전', months: 36 },
      { label: '5년 전', months: 60 },
    ],
    asOfBackToCurrent: '현재로 돌아가기',
    asOfRange: (min: string, max: string) => `선택할 수 있는 기간은 ${min} ~ ${max}이에요`,
    asOfLoading: '선택할 수 있는 기간을 불러오는 중이에요',
    asOfUnavailable: '선택할 수 있는 기간을 불러오지 못해 지금은 현재 기준으로만 볼 수 있어요',
    asOfOutOfRangeHint: '범위 밖',
  },
  /** STEP 02 ② 주변 점포 분석 */
  nearby: {
    pastView: (ym: string) => `${ym} 기준으로 보고 있어요`,
    pastViewHint: '지도·점포 표·시점 조회가 이 시점에 영업하던 점포를 기준으로 바뀌었어요.',
    pastBadge: (ym: string) => `${ym} 기준`,
    mapTitle: '주변 점포 분포',
    tableTitle: '점포 상세 조회',
    mapBadge: (radius: number, asOf: string | null) =>
      `반경 ${radius.toLocaleString('ko-KR')}m${asOf ? ` · 기준일 ${asOf}` : ''}`,
    total: (count: number) => `조건에 맞는 점포 ${count.toLocaleString('ko-KR')}곳`,
    excludedNoCoord: (n: number) =>
      `좌표 정보가 없어 지도에서 제외된 점포 ${n.toLocaleString('ko-KR')}곳`,
    legendTitle: '현재 상태',
    sortNearest: '가까운 순',
    caption: '반경 안 같은 업종 점포 목록. 점포명을 누르면 지도에서 위치를 보여줘요',
    columns: {
      no: '번호',
      name: '점포명',
      category: '업종',
      distance: '거리(m)',
      area: '시설 규모',
      openDate: '개업일',
      period: '영업 기간',
      status: '현재 상태',
      franchise: '프랜차이즈',
    },
    showOnMap: '지도에서 보기',
    mapRegion: '주변 점포 지도',
    mapFailed: '지도를 불러오지 못했어요. 아래 표에서 점포 정보를 확인해 주세요.',
    mapLoading: '지도를 불러오는 중이에요',
    myLocation: '진단 위치',
    infoClose: '정보창 닫기',
    info: {
      category: '업종',
      openDate: '개업일',
      period: '영업 기간',
      status: '현재 상태',
      franchise: '프랜차이즈',
    },
  },
  /** STEP 02 ② 안의 시점 조회 (F-05) */
  snapshot: {
    title: '시점 조회',
    guide: '과거 시점을 고르면 그때 영업하던 점포가 지금 어떻게 됐는지 볼 수 있어요',
    quickTitle: '빠른 선택',
    cards: {
      total: '그 시점 동일 업종 점포',
      stillOpen: '지금도 운영 중',
      closedSince: '이후 폐업',
      other: '기타(휴업 등)',
    },
    notice: '폐업은 행정상 신고 기록 기준이라 실제 영업 종료 시점과 다를 수 있어요',
    caption: (ym: string) => `${ym}에 영업하던 같은 업종 점포와 지금 상태`,
    columns: {
      no: '번호',
      name: '점포명',
      category: '업종',
      openDate: '개업일',
      closeDate: '폐업일',
      period: '영업 기간',
      status: '현재 상태',
    },
    noCloseDate: '폐업일 없음',
    emptyStores: '그 시점에 조건에 맞는 점포가 없어요',
  },
  /** STEP 02 ③ 상권 활동 분석 (F-06) */
  activity: {
    statusTitle: '점포 현황',
    competitor: '반경 안 동종업체 수',
    opened12m: '최근 12개월 개업 수',
    closed12m: '최근 12개월 폐업 수',
    avgPeriod: '평균 영업 기간',
    avgPeriodHint: '세부 업종별 서버 값 (업종끼리 합치거나 평균 내지 않아요)',
    periodLabel: (p: string) => `기간 ${p}`,
    loadingValue: '불러오는 중',
    failedValue: '불러오지 못했어요',
    trendTitle: '연도별 개업·폐업 추이',
    trendChartLabel: '연도별 개업·폐업 수 막대그래프. 같은 숫자를 아래 표에서 볼 수 있어요.',
    trendOpened: '개업',
    trendClosed: '폐업',
    trendYear: (y: number) => `${y}년`,
    trendYearHeader: '연도',
    trendShowTable: '표로 보기',
    trendHideTable: '표 숨기기',
    trendCaption: '연도별 개업·폐업 수 (데이터가 있는 연도만)',
    trendEmpty: '연도별 추이를 보여줄 데이터가 없어요',
    trendUnit: (n: number) => `${n.toLocaleString('ko-KR')}곳`,
    salesTitle: '인근 상권 추정매출',
    salesNotice: '상권 단위 추정치로, 이 자리 점포의 실제 매출이 아니에요',
    salesQuarter: (q: string) => `${q.replace('-Q', '년 ')}분기`,
    estimate: '추정치',
    livingTitle: '생활인구 (250m 격자)',
    livingNotice: '250m 격자 단위 통계적 추정치로, 실제 방문객 수가 아니에요',
    livingTotal: '생활인구 합계',
    livingDate: '기준일',
    livingGrids: '포함 격자 수',
    livingMissing: '결측 격자 수',
    missingData: '아직 확보하지 못한 자료예요',
    people: (n: number) => `${n.toLocaleString('ko-KR')}명`,
    grids: (n: number) => `${n.toLocaleString('ko-KR')}개`,
  },
  /** 메타 정보 줄 */
  meta: {
    demo: '시연 데이터',
  },
  /** 목록 공통 */
  list: {
    showMore: '더보기',
    /** 화면 읽기 프로그램용: "7건 중 5건 표시" */
    shownCount: (shown: number, total: number) => `${total}건 중 ${shown}건 표시`,
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

/**
 * AS_OF_OUT_OF_RANGE 오류면 error.detail의 min_month·max_month로
 * "선택할 수 있는 기간은 YYYY.MM ~ YYYY.MM이에요"를 만든다. 다른 오류·detail 없음이면 null
 */
export function getAsOfRangeMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null
  if (!('code' in error) || error.code !== 'AS_OF_OUT_OF_RANGE') return null
  const detail = 'detail' in error ? error.detail : null
  if (typeof detail !== 'object' || detail === null) return ERROR_MESSAGES.AS_OF_OUT_OF_RANGE
  const min = 'min_month' in detail ? detail.min_month : null
  const max = 'max_month' in detail ? detail.max_month : null
  if (typeof min !== 'string' || typeof max !== 'string') return ERROR_MESSAGES.AS_OF_OUT_OF_RANGE
  const dot = (ym: string) => ym.replace('-', '.')
  return MESSAGES.filter.asOfRange(dot(min), dot(max))
}

/** 잡힌 오류 객체(ApiRequestError 등)에서 code를 꺼내 안내 문구를 찾는다 */
export function getErrorMessageFrom(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
  return getErrorMessage(typeof code === 'string' ? code : null)
}
