import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import ActivitySection from '../components/analysis/ActivitySection'
import AnalysisSection from '../components/analysis/AnalysisSection'
import AnalysisTabs from '../components/analysis/AnalysisTabs'
import HistorySection from '../components/analysis/HistorySection'
import NearbySection from '../components/analysis/NearbySection'
import SectionErrorBoundary from '../components/common/SectionErrorBoundary'
import StepNav from '../components/common/StepNav'
import { MESSAGES } from '../constants/messages'
import {
  analysisPanelId,
  ANALYSIS_SECTIONS,
  analysisTabFromHash,
  analysisTabId,
  ROUTES,
  type AnalysisSectionId,
} from '../constants/routes'

/** 탭 내용이 깨져도 머리(제목·설명)는 남겨 어느 탭인지 알 수 있게 한다 */
const keepSection = (id: AnalysisSectionId) => (fallback: ReactNode) => (
  <AnalysisSection id={id}>{fallback}</AnalysisSection>
)

const PANELS: Record<AnalysisSectionId, ReactNode> = {
  history: <HistorySection />,
  nearby: <NearbySection />,
  activity: <ActivitySection />,
}

/**
 * STEP 02 입지 정보 분석 — 탭 3개 (과거 점포 이력 · 주변 점포 · 상권 활동), 한 번에 하나만 보여준다.
 * 열린 탭은 URL #해시(#history·#nearby·#activity)로 정해져 예전 주소·다른 화면 링크도 그 탭으로 열린다.
 */
export default function AnalysisPage() {
  const { hash, search } = useLocation()
  const navigate = useNavigate()
  const active = analysisTabFromHash(hash)
  const panelsRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  // 탭을 바꿨을 때 이미 아래로 내려와 있으면 새 탭의 처음(탭 바 바로 아래)으로 올린다
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const el = panelsRef.current
    if (!el) return
    const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    if (el.getBoundingClientRect().top < offset) el.scrollIntoView({ block: 'start' })
  }, [active])

  const select = (id: AnalysisSectionId) =>
    navigate({ search, hash: `#${id}` }, { replace: true, preventScrollReset: true })

  return (
    <div className="flex flex-col gap-stack-4">
      <AnalysisTabs active={active} onSelect={select} />
      <div ref={panelsRef} className="scroll-mt-sticky-tabs">
        {ANALYSIS_SECTIONS.map((s) => (
          <div
            key={s.id}
            role="tabpanel"
            id={analysisPanelId(s.id)}
            aria-labelledby={analysisTabId(s.id)}
            hidden={s.id !== active}
            tabIndex={0}
            className="rounded-card focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          >
            {s.id === active && (
              <SectionErrorBoundary resetKey={search} wrap={keepSection(s.id)}>
                {PANELS[s.id]}
              </SectionErrorBoundary>
            )}
          </div>
        ))}
      </div>
      <StepNav to={ROUTES.summary} search={search} label={MESSAGES.frame.nextSummary} />
    </div>
  )
}
