/** 화면에 보이는 안내·오류·면책 문구 (한곳에서 관리) */
const BRAND = 'Spot:ON'
const withBrand = (name: string) => `${name} | ${BRAND}`

export const MESSAGES = {
  /** 브라우저 탭 제목 (document.title) */
  titles: {
    landing: `${BRAND} — 내 자리, 딱 맞는 자리일까요?`,
    input: withBrand('주소·업종 입력'),
    analysis: withBrand('입지 정보 분석'),
    summary: withBrand('종합 진단 결과'),
    share: withBrand('결과 저장 및 상담'),
    report: withBrand('입지 진단서'),
    notFound: withBrand('페이지를 찾을 수 없어요'),
  },
  /** ① 랜딩 */
  landing: {
    slogan: 'Is your spot on? — 내 자리, 딱 맞는 자리일까요?',
    titleLine1: '창업 전,',
    titleLine2: '그 자리의 과거를 확인하세요',
    description: '주소를 입력하고 입지 진단을 시작해 보세요.',
    start: '진단 시작하기',
    scope: '현재 서울특별시 카페·음식점(한식·중식·일식·양식)을 진단할 수 있어요',
  },
  /** ① 랜딩 첫 화면 아래 소개 섹션 (홍보용 수치·성공/실패 판정 표현 쓰지 않기) */
  landingIntro: {
    scrollHint: '아래로 더 보기',
    featuresTitle: 'Spot:ON으로 확인할 수 있는 것',
    features: [
      {
        title: '주소별 과거 점포 이력',
        description:
          '같은 건물을 거쳐 간 점포의 개업·폐업과 영업 기간을 보여줘요. 층·호실이 다르면 다른 자리로 구분해요.',
      },
      {
        title: '과거 시점 조회',
        description:
          '과거 특정 연·월에 영업하던 같은 업종 점포가 최신 데이터 기준으로 어떻게 됐는지 확인할 수 있어요.',
      },
      {
        title: '서울시 공식 지표와 참고지표 구분',
        description:
          '서울시가 공표한 값은 그대로 인용하고, Spot:ON이 계산한 참고지표와 영역을 나눠 보여줘요. 점수나 등급은 만들지 않아요.',
      },
      {
        title: '근거 기반 AI 해석',
        description:
          '버튼을 눌렀을 때만 서버가 계산한 지표로 유리·불리 요인과 계약 전 확인사항을 정리해요. 문장마다 근거 지표를 함께 보여줘요.',
      },
    ],
    stepsTitle: '이렇게 이용해요',
    steps: [
      { title: '주소·업종 입력', description: '서울 주소와 카페·음식점 업종을 입력해요.' },
      {
        title: '입지 정보 분석 확인',
        description: '과거 점포 이력, 주변 점포 지도, 상권 활동을 차례로 살펴봐요.',
      },
      {
        title: '종합 진단·저장/상담',
        description:
          '공식·참고 지표와 AI 해석을 확인하고, PDF로 저장하거나 공공 창업 상담으로 이어가요.',
      },
    ],
    stepLabel: (n: number) => `${n}단계`,
    dataTitle: '이런 데이터를 사용해요',
    dataDescription:
      '공공데이터와 지도 서비스 정보를 서버에서 모아 계산하고, 출처와 기준일을 함께 보여줘요.',
    dataNotice: '공공데이터 기반 참고 정보이며 창업 성공·실패를 판단하지 않아요.',
    ctaTitle: '계약 전에, 그 자리를 한 번 더 확인해 보세요',
    ctaDescription: '주소와 업종만 입력하면 바로 볼 수 있어요.',
  },
  /** 랜딩·입력 화면 공통 하단 (결과 화면은 ResultFooter) */
  siteFooter: {
    team: '시고르자브종 · 청년 공공AX 서포터즈',
    usageTitle: '이용 안내',
    /** 이용 대상(layout.ageNotice)·면책(disclaimer)과 함께 보여주는 개인정보 안내 */
    privacy: '회원가입 없이 이용하며 개인정보를 저장하지 않아요.',
    dataTitle: '데이터 출처',
    linksTitle: '프로젝트',
    repository: '소스 코드 저장소',
    newWindow: '(새 창)',
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
    addressExample: '예) 서울특별시 마포구 양화로 45 2층',
    /** 층·호수를 함께 쓰면 geocode가 floor_unit으로 읽어 이력의 "같은 자리" 판정에 쓴다 */
    addressFloorHint: '층·호수까지 입력하면 같은 자리였는지 더 정확히 확인해요',
    searchButton: '주소 검색',
    categoryLabel: '업종 선택',
    required: '*필수 입력 항목입니다.',
    submit: '이 자리 진단하기',
    searching: '주소를 찾는 중이에요',
    candidatesTitle: '주소 후보가 여러 개예요. 진단할 주소를 골라 주세요.',
    candidateJibun: '지번',
    scope: '현재 서울특별시 카페·음식점(한식·중식·일식·양식)을 진단할 수 있어요',
  },
  /** 점포 목록 결측 표시 — 이력·주변 점포·시점 조회·지도 정보창 공통 (utils/storeDisplay) */
  store: {
    /**
     * 프랜차이즈 표시 (BE 가맹 추정 요청서 2장) — 표·지도 정보창·진단서 공통.
     * "당시 프랜차이즈였다"처럼 과거 소속·계약으로 읽히는 표현을 쓰지 않는다
     */
    franchise: {
      estimate: '프랜차이즈(추정)',
      external: '프랜차이즈',
      independent: '개인 매장',
      unknown: '정보 없음',
      estimateHelp: (year: number | null) =>
        `${year ? `${year}년 ` : ''}브랜드 목록과 상호 일치 · 실제 계약·과거 소속 아님`,
      externalHelp: '기존 분류 자료 기준',
      /** 표 아래 안내 (추정 행이 있을 때) */
      /**
       * 가맹 필터를 골랐을 때 안내 (요청서 3·5장) — 0건을 "이 조건의 점포가 없다"로 읽지 않게.
       * 개인 매장은 기존 외부 분류(false)만 고르므로 지금 자료로는 거의 0건이다
       */
      filterNoticeTitle: '프랜차이즈 분류 기준 안내',
      filterFranchise: (year: number | null) =>
        `프랜차이즈(추정) 조건은 ${year ? `${year}년 ` : ''}브랜드 목록과 상호가 같은 점포만 골라 계산해요. 실제 가맹계약이나 개업 당시 소속 기준이 아니고, 분류가 확인되지 않은 점포는 빠져요.`,
      filterIndependent:
        '개인 매장 조건은 기존 분류 자료에서 개인 매장으로 확인된 점포만 골라요. 이 자료가 적어 0곳으로 보일 수 있고, 개인 매장이 없다는 뜻은 아니에요.',
      /** 가맹 필터 + 0건일 때 빈 결과 문구 */
      emptyFranchise:
        '브랜드 목록과 상호가 일치한 점포가 없어 0곳으로 보여요. 프랜차이즈 점포가 없다는 뜻은 아니에요.',
      emptyIndependent:
        '개인 매장 분류 자료가 아직 없어 0곳으로 보여요. 이 조건의 점포가 없다는 뜻은 아니에요.',
      /** 조회 조건의 가맹 선택지 옆 짧은 도움말 */
      optionHint: {
        franchise: '브랜드 목록 상호 일치 기준 · 분류 미확인 점포 제외',
        independent: '기존 분류 자료가 있는 점포만 · 0곳으로 보일 수 있어요',
      },
      note: (year: number | null) =>
        `프랜차이즈(추정)은 ${year ? `${year}년 ` : ''}공정위 브랜드 목록과 상호가 같은 점포예요. 실제 가맹계약·직영 여부·개업 당시 소속을 확인한 값은 아니에요.`,
    },
    /** 상호·개업일·기간이 없을 때 (0이나 빈칸으로 표시하지 않음) */
    missingValue: '정보 없음',
    /** 폐업 상태인데 폐업일이 비어 있을 때 — 사유별로 구분 (null만 보고 원자료가 없었다고 단정하지 않음) */
    closeDateMissing: '폐업일 정보 없음',
    closeDateCheck: '폐업일 확인 필요',
    openDateCheck: '개업일 확인 필요',
    dateOrderCheck: '개업일·폐업일 확인 필요',
    /** 영업 기간 미산정 사유 (BE 사유 코드 → 문구) */
    periodReasons: {
      missing_open_date: '개업일 정보가 없어 기간을 확인할 수 없어요',
      invalid_open_date: '개업일 확인이 필요해요',
      missing_close_date: '폐업일 정보가 없어 기간을 확인할 수 없어요',
      invalid_close_date: '폐업일 확인이 필요해요',
      missing_source_date: '데이터 기준일 확인이 필요해요',
      invalid_date_order: '개업일과 폐업일 확인이 필요해요',
      other_status: '영업 상태 확인이 필요해요',
    },
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
      '프랜차이즈(추정)은 공정위 브랜드 목록과 상호가 같은지로 고른 값이에요. 실제 계약이나 과거 소속은 아니에요.',
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
    /** data-range min_month가 null — 고른 업종의 과거 자료가 없음 */
    asOfNoPast: '선택한 업종은 과거 시점 자료가 없어 현재 기준으로만 볼 수 있어요',
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
    /**
     * excluded_no_coord는 반경 안 수가 아니라 서울 전체 같은 조건(업종·시점·면적·가맹) 기준 (BE 제안 표현).
     * 반경 점포 수와 합치지 않는다 — 화면·진단서 같은 문구
     */
    excludedNoCoord: (n: number) =>
      `서울 전체 동일 조건 중 좌표 미확보 ${n.toLocaleString('ko-KR')}건 (지도·반경 점포 수에 포함하지 않아요)`,
    legendTitle: '최신 데이터 기준 상태',
    legendRadius: '진단 위치 반경',
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
      status: '최신 데이터 기준 상태',
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
      status: '최신 데이터 기준 상태',
      franchise: '프랜차이즈',
    },
  },
  /** STEP 02 ② 안의 시점 조회 (F-05) */
  snapshot: {
    title: '시점 조회',
    guide:
      '과거 시점을 고르면 그때 영업하던 점포가 최신 데이터 기준으로 어떻게 됐는지 볼 수 있어요',
    quickTitle: '빠른 선택',
    cards: {
      total: '그 시점 동일 업종 점포',
      stillOpen: '최신 데이터 기준 영업 중',
      closedSince: '이후 폐업',
      other: '기타(휴업 등)',
    },
    notice: '폐업은 행정상 신고 기록 기준이라 실제 영업 종료 시점과 다를 수 있어요',
    caption: (ym: string) => `${ym}에 영업하던 같은 업종 점포와 최신 데이터 기준 상태`,
    columns: {
      no: '번호',
      name: '점포명',
      category: '업종',
      openDate: '개업일',
      closeDate: '폐업일',
      period: '영업 기간',
      status: '최신 데이터 기준 상태',
      franchise: '프랜차이즈',
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
    /** BE 정의: 기준 시점에 영업하던 점포가 그 시점까지 경과한 개월의 평균 (폐업 점포 수명 아님) */
    avgPeriodHint: '기준 시점까지 경과 기간 평균',
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
    /** meta.yearly_comparison_basis = same_month_day_ytd 일 때 — 연간 전체가 아님을 안내 */
    trendYtd: (monthDay: string) =>
      `매년 1월 1일부터 ${monthDay}까지 같은 기간끼리 비교한 값이에요`,
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
    /** meta.optional_data[item].status = pending — 0이나 원천 없음이 아니라 집계 기준 확인 중 */
    pendingData: '자료 확인 중',
    /** 가맹 분류 미확인(franchise_classification pending)인데 프랜차이즈 조건을 골랐을 때 */
    franchisePendingTitle: '프랜차이즈 분류 확인 중',
    franchisePending:
      '프랜차이즈 분류를 확인하고 있어, 선택한 분류로 확인할 수 있는 정보가 없거나 적을 수 있어요. 점포가 없다는 뜻은 아니에요.',
    people: (n: number) => `${n.toLocaleString('ko-KR')}명`,
    grids: (n: number) => `${n.toLocaleString('ko-KR')}개`,
  },
  /** STEP 03 종합 진단 결과 (F-07) */
  summary: {
    marketTitle: '상권 판정',
    inMarket: (name: string, type: string | null) =>
      `이 주소는 ${name} 상권${type ? `(${type})` : ''}에 속해요`,
    alsoIn: (names: string) => `함께 속한 관광특구: ${names}`,
    outside: '서울시 지정 상권 밖 주소예요',
    /** market.status = unverified — 상권 안·밖으로 확정하지 않는다 */
    unverified: '공식 상권 적용 기준을 확인 중이에요',
    unverifiedHint:
      '이 주소가 어느 서울시 상권에 속하는지 아직 확정하지 않았어요. 상권 단위 공식 지표는 확인이 끝나면 보여드려요.',
    outsideHint:
      '상권 단위로 집계하는 서울시 공식 지표는 "자료 없음"으로 보여요. 가까운 상권 수치로 대신하지 않아요.',
    nearbyMarkets: '반경에 걸친 상권 (참고)',
    insufficient: '표본이 적어 일부 지표는 판단 보류로 보여요',
    officialTitle: '서울시 공식 지표',
    officialDescription: '서울시가 공표한 값을 그대로 인용해요. 다시 계산하지 않아요.',
    referenceTitle: 'Spot:ON 참고지표',
    referenceDescription:
      '공공데이터로 Spot:ON이 계산한 참고 값이에요. 공식 지표와 기간·공간 단위가 달라 직접 비교할 수 없어요.',
    fraction: (num: number, den: number) =>
      `${den.toLocaleString('ko-KR')}곳 중 ${num.toLocaleString('ko-KR')}곳`,
    market: (name: string) => `상권 ${name}`,
    quarter: (q: string) => q.replace(/^(\d{4})-Q(\d)$/, '$1년 $2분기'),
    seoulAvg: (v: string) => `서울 평균 ${v}`,
    officialRiskGuide: '공식 창업위험도는 서울시 상권분석서비스에서 확인할 수 있어요',
    officialRiskLink: '서울시 상권분석서비스 열기',
    officialRiskNewWindow: '(새 창)',
    officialRiskCopy: '상권명·업종 복사',
    officialRiskCopyHint: '상권분석서비스에서 이 이름으로 찾아보세요',
    copied: '복사했어요',
    copyFailed: '복사하지 못했어요. 직접 선택해 복사해 주세요',
    marketChangeRaw: '서울시 원본 유형',
    /**
     * 지표 판단 보류·자료 없음 사유 코드 → 문구 (BE fe-risk-reference-api-request.md 4장).
     * 모르는 코드는 indicatorReasonText가 일반 문구로 바꾼다 (코드를 그대로 보여주지 않음)
     */
    reasonCodes: {
      insufficient_sample: '표본이 적어 판단을 보류했어요',
      zero_denominator: '계산 대상 점포가 없어요',
      boundary_period_not_verified: '공식 상권 적용 기준을 확인 중이에요',
      boundary_version_not_selected: '공식 상권 경계를 확인 중이에요',
      population_aggregation_and_grid_time_unverified: '생활인구 집계 기준을 확인 중이에요',
      source_period_and_boundary_unverified: '매출 집계 기간과 적용 경계를 확인하고 있어요',
      /** AI 부족한 자료 — 가맹 분류 (BE 가맹 추정 요청서 5장) */
      franchise_name_match_estimate:
        '프랜차이즈 여부는 브랜드 목록과 상호 일치로 추정한 값이에요 (실제 계약·과거 소속 아님)',
      classification_unverified: '프랜차이즈 분류를 확인하고 있어요',
      not_applicable: '서울 비교 대상이 아니에요',
      outside_market: '상권 밖 주소라 상권 단위 지표가 없어요',
    } as Record<string, string>,
    reasonUnknown: '자료를 확인 중이에요',
    compareTitle: '서울 평균과 비교',
    compareDescription: '같은 정의로 계산한 서울 전체 동일 업종 값과 나란히 보여줘요.',
    compareThis: '이 자리 (반경)',
    compareSeoul: '서울 평균',
    compareHiddenTitle: '서울 평균과 비교할 수 없어요',
    compareHiddenDefault: '서울 평균 값이 아직 없어요',
    infoTitle: '진단 결과 안내',
    infoBaseline: '데이터 기준일',
    infoSource: '출처',
    infoReference: '참고용',
    infoReferenceText: '공공데이터 기반 참고 정보이며 창업의 성공·실패를 판정하지 않아요',
    infoOwner: '사업주 역량 미반영',
    infoOwnerText: '사업주의 경험·역량·운영 방식은 반영하지 않았어요',
    aiTitle: 'AI 해석',
  },
  /** STEP 04 결과 저장 및 상담 (F-09·F-10) */
  share: {
    cards: {
      pdf: { title: 'PDF 진단서 저장', desc: '인쇄 화면에서 "PDF로 저장"을 골라 주세요' },
      image: { title: '요약 이미지 저장', desc: '핵심 숫자를 담은 1080×1350 PNG' },
      consulting: { title: '공공 창업 상담센터 안내', desc: '전문가 상담을 받아 보세요' },
      support: { title: '소상공인 지원사업 안내', desc: '지원사업과 모집 공고를 확인해 보세요' },
    },
    imageMaking: '이미지를 만드는 중이에요',
    imageDone: '요약 이미지를 저장했어요',
    imageFailed: '요약 이미지를 만들지 못했어요. 다시 시도해 주세요',
    imageNeedsData: '진단 결과를 불러온 뒤 다시 눌러 주세요',
    imageFooter: 'Spot:ON · 공공데이터 기반 창업 입지 진단 (참고용)',
    imageFileName: 'spoton-summary.png',
    image: {
      heading: '입지 진단 요약',
      conditions: (category: string, radius: number, asOf: string) =>
        `${category} · 반경 ${radius.toLocaleString('ko-KR')}m · ${asOf} 기준`,
      asOfCurrent: '현재',
      competitor: '반경 안 동종업체 수 (참고지표)',
      competitorNote: (radius: number) => `반경 ${radius.toLocaleString('ko-KR')}m`,
      opened: '최근 12개월 개업 · 폐업',
      referenceClosure: '참고 폐업률 (최근 12개월, 참고지표)',
      referenceClosureNote: '반경 기준 · Spot:ON 계산',
      officialClosure: '서울시 공식 폐업률',
      officialClosureNote: '상권 기준 · 서울시 공표값',
      sources: (names: string) => `출처: ${names}`,
    },
    consultingTitle: '공공 창업 상담센터',
    supportTitle: '소상공인 지원사업',
    linksEmpty: '안내할 기관 링크가 아직 없어요',
    lastChecked: (date: string) => `${date} 확인`,
    /** 구 지정 시 서버가 맨 앞에 둔 관할 센터 (가까운 순·맞춤 추천 아님) */
    districtBadge: '관할 지역센터 연락처',
    districtSource: (published: string | null, checked: string | null, page: number | null) =>
      `관할 연락처는 중소벤처기업부 공고${published ? `(${published})` : ''}${page ? ` 첨부 ${page}쪽` : ''} 기준이에요${checked ? ` · ${checked} 확인` : ''}`,
    linksNotice:
      '모집 기간·지원 조건은 연결된 공식 사이트에서 확인해 주세요. 링크는 정기적으로 점검해요.',
    newWindow: '(새 창)',
    rediagnoseTitle: '다른 자리도 궁금하신가요?',
    rediagnoseDesc: '새로운 주소를 진단해 보세요!',
    rediagnoseLabel: '새로운 주소 진단하러 가기',
  },
  /** 인쇄용 진단서 (/result/report) */
  report: {
    title: 'Spot:ON 입지 진단서',
    toolbarHint: '인쇄 창에서 대상(프린터)을 "PDF로 저장"으로 고르면 파일로 저장돼요.',
    print: 'PDF로 저장 (인쇄)',
    back: '결과 화면으로 돌아가기',
    printFailed: '인쇄 창을 열지 못했어요. 다시 시도해 주세요',
    loading: '진단서 내용을 모으는 중이에요',
    partialError: '일부 내용을 불러오지 못했어요. 다시 시도해 주세요',
    conditions: '진단 조건',
    address: '주소',
    category: '업종',
    radius: '반경',
    asOf: '기준 시점',
    asOfCurrent: '현재',
    franchise: '프랜차이즈',
    historyTitle: '1. 과거 점포 이력',
    historyMore: (shown: number, total: number) => `최근 개업 순 ${total}건 중 ${shown}건`,
    nearbyTitle: '2. 주변 점포·시점 조회',
    nearbyCount: '조건에 맞는 주변 점포',
    activityTitle: '3. 상권 활동',
    indicatorsTitle: '4. 지표',
    aiTitle: '5. AI 해석',
    aiNotRequested:
      'AI 해석을 받지 않았어요 (종합 진단 화면에서 "AI 해석 보기"를 누르면 함께 담겨요).',
    footerTitle: '출처·안내',
    colName: '지표',
    colValue: '값·상태',
    colBasis: '기간·공간·표본',
    brand: 'Spot:ON · 공공데이터 기반 창업 입지 진단',
    demoNotice: '시연 데이터: 이 진단서의 수치는 시연용 가상 값이에요.',
    nearbyBasis: (space: string, date: string) => `${space}, 기준일 ${date}`,
    noData: '자료 없음',
    infoMissing: '정보 없음',
    livingSummary: (people: string, estimate: string, date: string, missing: number) =>
      `${people} (${estimate}, ${date}, 결측 격자 ${missing}개)`,
    sample: (n: number) => `표본 ${n.toLocaleString('ko-KR')}곳`,
    seoulAvg: (v: string) => `서울 평균 ${v}`,
    sources: (names: string) => `출처: ${names}`,
  },
  /** 메타 정보 줄 */
  meta: {
    demo: '시연 데이터',
    source: '출처',
    asOf: '기준일',
    period: '기간',
    sample: '표본',
  },
  /** 찾을 수 없는 페이지 */
  notFound: {
    code: '404',
    title: '페이지를 찾을 수 없어요',
    description: '주소가 바뀌었거나 없는 페이지예요. 처음 화면에서 다시 시작해 주세요.',
    home: '처음으로',
    start: '진단 시작하기',
  },
  /** 목록 공통 */
  list: {
    showMore: '더보기',
    /** 화면 읽기 프로그램용: "7건 중 5건 표시" */
    shownCount: (shown: number, total: number) => `${total}건 중 ${shown}건 표시`,
  },
  /** 단위·공통 글자 */
  units: {
    store: '곳',
  },
  common: {
    retry: '다시 시도',
    loading: '불러오는 중이에요',
    error: '정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요',
    empty: '조건에 맞는 결과가 없어요',
    /** 섹션 하나가 그려지다 멈췄을 때 (나머지 섹션은 그대로 보인다) */
    sectionError: '이 정보를 표시하지 못했어요',
  },
  /** 화면 전체가 그려지다 멈췄을 때 (라우터 오류 화면) */
  appError: {
    title: '화면을 표시하는 중 문제가 생겼어요',
    description: '잠시 후 다시 시도하거나 처음 화면에서 다시 시작해 주세요.',
    reload: '다시 시도',
    home: '처음으로',
  },
  ai: {
    unavailable: 'AI 해석을 불러오지 못했어요. 계산된 지표는 그대로 확인할 수 있어요',
    intro:
      'AI가 서버에서 검증한 설명의 순서와 계약 전 현장 확인 항목을 정리해 드려요. 새 사실을 조사하거나 성공·실패를 예측하지 않아요.',
    start: 'AI 해석 보기',
    startNotice: '만 18세 이상 대상 · 참고용 해석이에요',
    loading: 'AI가 해석을 만들고 있어요 (최대 20초)',
    retry: '다시 시도',
    /** 422 INVALID_PARAM — 요청 형식 오류 (지표는 그대로, 다시 시도는 버튼으로만) */
    invalidRequest:
      '요청 형식이 맞지 않아 해석을 만들지 못했어요. 문제가 계속되면 조건을 바꿔 다시 진단해 주세요.',
    verifyFailed: '해석 문장을 검증하지 못해 보여드리지 않아요.',
    sections: {
      // 참고지표도 함께 담기므로 전체를 "공식 통계"라고 부르지 않는다
      official: '확인된 계산값 요약',
      favorable: '유리하게 볼 요인',
      unfavorable: '불리하게 볼 요인',
      missing: '판단에 부족한 자료',
      checklist: '계약 전 현장 확인사항',
    },
    evidence: '근거 지표',
    sources: '출처',
    goToIndicator: (name: string) => `${name} 카드로 이동`,
    checklistHint: '확인한 항목을 체크해 보세요. 체크 상태는 저장되지 않아요.',
    checklistDone: (done: number, total: number) => `${total}개 중 ${done}개 확인`,
    model: '모델',
    /** generated_at = 이번 응답의 서버 문장 조립 시각 (새 모델 호출 시각 아님) */
    generatedAt: '응답 시각',
    notice:
      '이 해석은 서버가 계산한 지표만 바탕으로 만든 참고 문장이며, 창업 성공·실패를 판정하지 않아요.',
    empty: '해당 내용이 없어요',
  },
  disclaimer:
    '이 결과는 공공데이터 기반 참고 정보이며 창업의 성공·실패를 판단하지 않아요. 개별 사업주의 역량은 반영하지 않았어요.',
  /** 결과 화면 공통 틀 */
  /** 결과 화면(STEP 02~04) 위 진단 조건 요약 바 — 값은 URL 쿼리에서만 가져온다 */
  conditionBar: {
    label: '진단 조건',
    radius: (m: number) => `반경 ${m.toLocaleString('ko-KR')}m`,
    asOfCurrent: '현재 기준',
    asOfPast: (ym: string) => `${ym} 기준`,
    pastNotice: '과거 시점 조회 중',
    area: (label: string) => `시설 규모 ${label}`,
    franchise: (label: string) => `프랜차이즈 ${label}`,
    excludeUnknown: '정보 없음 점포 제외',
    edit: '조건 바꾸기',
    editHint: '입력 화면으로 이동해요. 지금 주소와 업종은 그대로 채워져 있어요',
  },
  layout: {
    eyebrow: 'DATA - BASED INSIGHT',
    ageNotice: '만 18세 이상 예비창업자를 대상으로 해요.',
    baselinePending: '데이터 기준일은 결과를 불러오면 표시돼요.',
    skipToContent: '본문 바로가기',
    logoLabel: 'Spot:ON 처음으로',
    stepsNav: '진단 단계',
    stepDone: '(완료)',
    stepCurrent: '(현재 단계)',
    addressTerm: '진단 주소',
    categoryTerm: '업종',
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
export function getAsOfRangeMessage(
  error: unknown,
  range?: { min_month: string | null; max_month: string } | null,
): string | null {
  if (typeof error !== 'object' || error === null) return null
  if (!('code' in error) || error.code !== 'AS_OF_OUT_OF_RANGE') return null
  const dot = (ym: string) => ym.replace('-', '.')
  const detail = 'detail' in error ? error.detail : null
  const min =
    typeof detail === 'object' && detail && 'min_month' in detail ? detail.min_month : null
  const max =
    typeof detail === 'object' && detail && 'max_month' in detail ? detail.max_month : null
  if (typeof min === 'string' && typeof max === 'string')
    return MESSAGES.filter.asOfRange(dot(min), dot(max))
  // 지금 BE는 error.detail을 보내지 않는다 → 같은 업종 조건의 data-range 응답으로 범위를 안내
  if (range?.min_month) return MESSAGES.filter.asOfRange(dot(range.min_month), dot(range.max_month))
  return ERROR_MESSAGES.AS_OF_OUT_OF_RANGE
}

/** 잡힌 오류 객체(ApiRequestError 등)에서 code를 꺼내 안내 문구를 찾는다 */
export function getErrorMessageFrom(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
  return getErrorMessage(typeof code === 'string' ? code : null)
}
