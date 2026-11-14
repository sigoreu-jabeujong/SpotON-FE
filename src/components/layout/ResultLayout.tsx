import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import { ANALYSIS_SECTIONS, RESULT_STEPS, ROUTES } from '../../constants/routes'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useResultBaseline } from '../../hooks/useResultBaseline'
import ConditionBar from './ConditionBar'
import ResultFooter from './ResultFooter'
import ResultHeader from './ResultHeader'
import SkipLink from '../common/SkipLink'
import ResultSidebar from './ResultSidebar'

const SECTION_IDS = ANALYSIS_SECTIONS.map((s) => s.id)

/** 탭 제목: 화면 이름 (STEP 02는 섹션과 상관없이 하나로 고정) */
function titleOf(pathname: string): string {
  if (pathname === ROUTES.summary) return MESSAGES.titles.summary
  if (pathname === ROUTES.share) return MESSAGES.titles.share
  return MESSAGES.titles.analysis
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  [ROUTES.analysis]: MESSAGES.resultPages.analysis,
  [ROUTES.summary]: MESSAGES.resultPages.summary,
  [ROUTES.share]: MESSAGES.resultPages.share,
}

/**
 * 결과 화면(STEP 02~04) 공통 틀: 왼쪽 사이드바 + 머리 + 본문 + 하단 안내
 * 주소·업종·좌표·건물 키가 없으면 입력 화면으로 돌려보낸다 (데스크톱 1440 기준)
 */
export default function ResultLayout() {
  const { pathname } = useLocation()
  const { isReady, search } = useDiagnosisQuery()
  const baseline = useResultBaseline()
  const activeSection = useActiveSection(SECTION_IDS, pathname === ROUTES.analysis)
  usePageTitle(titleOf(pathname))

  if (!isReady) return <Navigate to={{ pathname: ROUTES.input, search }} replace />

  const meta = PAGE_META[pathname] ?? MESSAGES.resultPages.analysis

  return (
    <div className="flex min-h-full bg-bg">
      <SkipLink target="result-main" />
      <ResultSidebar activeSection={activeSection} />
      <div className="flex min-w-0 flex-1 flex-col">
        <nav
          aria-label={MESSAGES.layout.stepsNav}
          className="flex flex-wrap gap-2 border-b border-gray-300 bg-gray-0 p-4 lg:hidden"
        >
          {RESULT_STEPS.map((step) => (
            <Link
              key={step.step}
              to={{ pathname: step.path, search }}
              aria-current={pathname === step.path ? 'step' : undefined}
              className="rounded-control px-2 py-2 text-caption text-gray-700 aria-[current=step]:bg-blue-100 aria-[current=step]:font-bold aria-[current=step]:text-blue-700"
            >
              {step.step}. {step.label}
            </Link>
          ))}
        </nav>
        <ResultHeader title={meta.title} description={meta.description} />
        {/* 진단 조건 요약 — 스크롤해도 위에 붙어 있어 긴 STEP 02에서도 지금 조건을 알 수 있다 */}
        <ConditionBar />
        <main
          id="result-main"
          tabIndex={-1}
          className="flex-1 px-4 pt-6 pb-12 focus:outline-none sm:px-10"
        >
          <div className="max-w-[1080px]">
            <Outlet />
          </div>
        </main>
        <ResultFooter baseline={baseline} />
      </div>
    </div>
  )
}
