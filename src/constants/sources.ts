/**
 * 출처 번호(R번호) → 이름·링크 (docs/display-rules.md 7장, 07 데이터 활용 명세서 2.5)
 * meta.source(배열)·지표 source("R5,R6" 문자열)의 번호를 화면 이름으로 바꿀 때 쓴다.
 */
export const SOURCES: Record<string, { name: string; url?: string }> = {
  R1: { name: '서울시 상권분석서비스', url: 'https://golmok.seoul.go.kr/stateDistrict.do' },
  R2: {
    name: '서울 열린데이터광장 점포-상권',
    url: 'https://data.seoul.go.kr/dataList/OA-15577/F/1/datasetView.do',
  },
  R3: {
    name: '서울 열린데이터광장 추정매출-상권',
    url: 'https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do',
  },
  R4: {
    name: '서울시 생활인구 250m 격자',
    url: 'https://data.seoul.go.kr/dataList/OA-22784/S/1/datasetView.do',
  },
  R5: {
    name: '행정안전부 일반음식점 인허가',
    url: 'https://www.data.go.kr/data/15154916/openapi.do',
  },
  R6: {
    name: '행정안전부 휴게음식점 인허가',
    url: 'https://www.data.go.kr/data/15154921/openapi.do',
  },
  R7: { name: '소상공인시장진흥공단 상가정보' },
  R8: { name: '카카오 로컬·지도', url: 'https://apis.map.kakao.com' },
  R9: { name: '공정거래위원회 가맹정보', url: 'https://www.data.go.kr/data/15143693/openapi.do' },
  R10: { name: '소상공인365·중소벤처기업부 보도자료' },
  R11: {
    name: '서울시 창업위험도 지표 정의',
    url: 'https://golmok.seoul.go.kr/images/seoul_info.pdf',
  },
  R12: { name: '생활인구 250m 통계 안내' },
  R13: { name: '자리보고 (민간, 2026-10-24 종료)' },
  R14: { name: '서울시 상권분석서비스 분석 리포트' },
  R15: {
    name: '서울 열린데이터광장 영역-상권',
    url: 'https://data.seoul.go.kr/dataList/OA-15560/S/1/datasetView.do',
  },
  R16: {
    name: '서울 열린데이터광장 상권변화지표',
    url: 'https://data.seoul.go.kr/dataList/OA-15576/S/1/datasetView.do',
  },
  R17: { name: '공공 창업상담·지원기관' },
  R18: { name: 'Google Gemini API', url: 'https://aistudio.google.com' },
  R19: {
    name: '행정안전부 주소·좌표 API',
    url: 'https://www.data.go.kr/data/15057017/openapi.do',
  },
}

/** "R5,R6" 또는 ["R5","R6"] → ["R5","R6"] */
export function parseSourceIds(source: string | readonly string[] | null | undefined): string[] {
  if (!source) return []
  const list = typeof source === 'string' ? source.split(',') : source
  return list.map((s) => s.trim()).filter(Boolean)
}
