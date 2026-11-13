import { Navigate, Outlet, useLocation } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import { analysisTabFromHash, ROUTES } from '../../constants/routes'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useResultBaseline } from '../../hooks/useResultBaseline'
import ConditionBar from './ConditionBar'
import ResultFooter from './ResultFooter'
import ResultHeader from './ResultHeader'
import SkipLink from '../common/SkipLink'
import ResultSidebar from './ResultSidebar'

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
  const { pathname, hash } = useLocation()
  const { isReady, search } = useDiagnosisQuery()
  const baseline = useResultBaseline()
  // STEP 02에서 지금 열린 탭 (URL #해시) — 사이드바 하위 항목 강조용
  const activeSection = pathname === ROUTES.analysis ? analysisTabFromHash(hash) : null
  usePageTitle(titleOf(pathname))

  if (!isReady) return <Navigate to={{ pathname: ROUTES.input, search }} replace />

  const meta = PAGE_META[pathname] ?? MESSAGES.resultPages.analysis

  return (
    <div className="flex min-h-full bg-bg">
      <SkipLink target="result-main" />
      <ResultSidebar activeSection={activeSection} />
      <div className="flex min-w-0 flex-1 flex-col">
        <ResultHeader title={meta.title} description={meta.description} />
        {/* 진단 조건 요약 — 스크롤해도 위에 붙어 있어 긴 STEP 02에서도 지금 조건을 알 수 있다 */}
        <ConditionBar />
        <main id="result-main" tabIndex={-1} className="flex-1 px-10 pt-6 pb-12 focus:outline-none">
          <div className="max-w-[1080px]">
            <Outlet />
          </div>
        </main>
        <ResultFooter baseline={baseline} />
      </div>
    </div>
  )
}
