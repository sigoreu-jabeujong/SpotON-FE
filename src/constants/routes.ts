/**
 * 화면 경로 — 디자인의 4단계 구조
 * 화면 7종(최종본 6번)의 기능은 그대로이고, 결과 화면 ③④⑤를 STEP 02 한 페이지로,
 * ⑥을 STEP 03, ⑦을 STEP 04로 묶었다 (docs/screens.md, docs/decisions.md)
 */
export const ROUTES = {
  landing: '/',
  /** STEP 01 주소·업종 입력 (② 화면) */
  input: '/diagnose',
  /** STEP 02 입지 정보 분석 (③ 과거 점포 이력 · ④ 주변 점포 · ⑤ 상권 활동) */
  analysis: '/result/analysis',
  /** STEP 03 종합 진단 결과 (⑥ 공식/참고 지표 · AI 해석) */
  summary: '/result/summary',
  /** STEP 04 결과 저장 및 상담 (⑦) */
  share: '/result/share',
  /** 인쇄용 진단서 (PDF 저장용, 사이드바 없음) */
  report: '/result/report',
} as const

/** STEP 02 페이지 안의 탭 (id = URL #해시 — 예전 #섹션 주소도 같은 탭으로 열린다) */
export const ANALYSIS_SECTIONS = [
  {
    id: 'history',
    number: '01',
    label: '과거 점포 이력',
    tab: '과거 점포 이력',
    description: '해당 주소에서 영업했던 점포의 이력을 확인할 수 있어요.',
  },
  {
    id: 'nearby',
    number: '02',
    label: '주변 점포 분석',
    tab: '주변 점포',
    description: '설정한 범위 안 주변 점포의 위치와 영업 현황을 확인할 수 있어요.',
  },
  {
    id: 'activity',
    number: '03',
    label: '상권 활동 분석',
    tab: '상권 활동',
    description: '반경 안 점포의 개업·폐업 변화와 상권 정보를 확인할 수 있어요.',
  },
] as const
export type AnalysisSectionId = (typeof ANALYSIS_SECTIONS)[number]['id']

/** STEP 02 탭 버튼·내용 요소 id (#해시와 겹치지 않게 접두사 — 브라우저가 해시로 멋대로 스크롤하지 않음) */
export const analysisTabId = (id: AnalysisSectionId) => `tab-${id}`
export const analysisPanelId = (id: AnalysisSectionId) => `panel-${id}`

/** URL #해시 → STEP 02 탭. 없거나 모르는 값이면 첫 탭(과거 점포 이력) */
export function analysisTabFromHash(hash: string): AnalysisSectionId {
  let id = hash.replace(/^#/, '')
  try {
    id = decodeURIComponent(id)
  } catch {
    // 잘못된 % 표기는 그대로 비교 (첫 탭으로)
  }
  return ANALYSIS_SECTIONS.find((s) => s.id === id)?.id ?? ANALYSIS_SECTIONS[0].id
}

/** 사이드바 4단계 */
export const RESULT_STEPS = [
  { step: 1, path: ROUTES.input, label: '주소 및 업종 입력' },
  { step: 2, path: ROUTES.analysis, label: '입지 정보 분석' },
  { step: 3, path: ROUTES.summary, label: '종합 진단 결과' },
  { step: 4, path: ROUTES.share, label: '결과 저장 및 상담' },
] as const

/** 예전 결과 경로 → 새 경로 (쿼리는 유지, 해시로 섹션 이동) */
export const LEGACY_RESULT_REDIRECTS = [
  { from: '/result/history', to: ROUTES.analysis, hash: 'history' },
  { from: '/result/nearby', to: ROUTES.analysis, hash: 'nearby' },
  { from: '/result/activity', to: ROUTES.analysis, hash: 'activity' },
  { from: '/result/risk', to: ROUTES.summary, hash: null },
] as const
