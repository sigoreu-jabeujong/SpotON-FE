/** 화면 경로 (최종본 6번 UI 설계의 화면 7종) */
export const ROUTES = {
  landing: '/',
  input: '/diagnose',
  history: '/result/history',
  nearby: '/result/nearby',
  activity: '/result/activity',
  risk: '/result/risk',
  share: '/result/share',
} as const

/** 결과 화면 단계 (③~⑦) — 단계 이동 탭에 사용 */
export const RESULT_STEPS = [
  { path: ROUTES.history, label: '과거 점포 이력' },
  { path: ROUTES.nearby, label: '주변 점포 현황' },
  { path: ROUTES.activity, label: '상권 활동 분석' },
  { path: ROUTES.risk, label: '창업 위험도 분석' },
  { path: ROUTES.share, label: '저장·상담' },
] as const
