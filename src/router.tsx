import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import LoadingState from './components/common/LoadingState'
import LegacyRedirect from './components/layout/LegacyRedirect'
import LandingPage from './pages/LandingPage'
import RouteErrorPage from './pages/RouteErrorPage'
import { LEGACY_RESULT_REDIRECTS, ROUTES } from './constants/routes'

/**
 * 첫 화면(랜딩)만 바로 불러오고, 나머지 화면은 필요할 때 나눠 불러온다 (첫 화면 용량 줄이기).
 * 결과 화면·지도·차트(recharts)·인쇄 화면은 각자 별도 파일로 분리된다.
 */
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    // 처음 들어온 화면을 나눠 불러오는 동안 보여줄 표시
    HydrateFallback: () => <LoadingState />,
    // 예상 못 한 오류로 화면 전체가 멈추면 흰 화면 대신 안내 (섹션 단위 오류는 SectionErrorBoundary가 먼저 잡는다)
    errorElement: <RouteErrorPage />,
    children: [
      // 랜딩·입력은 디자인대로 화면마다 자체 틀(로고 포함)을 쓴다
      { path: ROUTES.landing, element: <LandingPage /> },
      { path: ROUTES.input, lazy: lazyPage(() => import('./pages/InputPage')) },
      {
        lazy: lazyPage(() => import('./components/layout/AppLayout')),
        children: [{ path: '*', lazy: lazyPage(() => import('./pages/NotFoundPage')) }],
      },
      // 인쇄용 진단서 — 사이드바 없이 A4 지면만 (PDF 저장)
      { path: ROUTES.report, lazy: lazyPage(() => import('./pages/ReportPage')) },
      {
        // 결과 화면(STEP 02~04): 왼쪽 사이드바 레이아웃
        lazy: lazyPage(() => import('./components/layout/ResultLayout')),
        children: [
          { path: ROUTES.analysis, lazy: lazyPage(() => import('./pages/AnalysisPage')) },
          { path: ROUTES.summary, lazy: lazyPage(() => import('./pages/SummaryPage')) },
          { path: ROUTES.share, lazy: lazyPage(() => import('./pages/SharePage')) },
        ],
      },
      ...LEGACY_RESULT_REDIRECTS.map((r) => ({
        path: r.from,
        element: <LegacyRedirect to={r.to} hash={r.hash} />,
      })),
    ],
  },
])
