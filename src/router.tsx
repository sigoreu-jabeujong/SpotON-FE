import { createBrowserRouter } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import LegacyRedirect from './components/layout/LegacyRedirect'
import ResultLayout from './components/layout/ResultLayout'
import AnalysisPage from './pages/AnalysisPage'
import InputPage from './pages/InputPage'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import SharePage from './pages/SharePage'
import SummaryPage from './pages/SummaryPage'
import { LEGACY_RESULT_REDIRECTS, ROUTES } from './constants/routes'

export const router = createBrowserRouter([
  // 랜딩·입력은 디자인대로 화면마다 자체 틀(로고 포함)을 쓴다
  { path: ROUTES.landing, element: <LandingPage /> },
  { path: ROUTES.input, element: <InputPage /> },
  {
    element: <AppLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
  {
    // 결과 화면(STEP 02~04): 왼쪽 사이드바 레이아웃
    element: <ResultLayout />,
    children: [
      { path: ROUTES.analysis, element: <AnalysisPage /> },
      { path: ROUTES.summary, element: <SummaryPage /> },
      { path: ROUTES.share, element: <SharePage /> },
    ],
  },
  ...LEGACY_RESULT_REDIRECTS.map((r) => ({
    path: r.from,
    element: <LegacyRedirect to={r.to} hash={r.hash} />,
  })),
])
