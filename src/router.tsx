import { createBrowserRouter } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import ResultLayout from './components/layout/ResultLayout'
import ActivityPage from './pages/ActivityPage'
import HistoryPage from './pages/HistoryPage'
import InputPage from './pages/InputPage'
import LandingPage from './pages/LandingPage'
import NearbyPage from './pages/NearbyPage'
import NotFoundPage from './pages/NotFoundPage'
import RiskPage from './pages/RiskPage'
import SharePage from './pages/SharePage'
import { ROUTES } from './constants/routes'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.landing, element: <LandingPage /> },
      { path: ROUTES.input, element: <InputPage /> },
      {
        element: <ResultLayout />,
        children: [
          { path: ROUTES.history, element: <HistoryPage /> },
          { path: ROUTES.nearby, element: <NearbyPage /> },
          { path: ROUTES.activity, element: <ActivityPage /> },
          { path: ROUTES.risk, element: <RiskPage /> },
          { path: ROUTES.share, element: <SharePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
