import { ArrowLeft, Printer } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { BRAND_API_ENABLED } from '../api/analysisProfile'
import AddressVerification from '../components/common/AddressVerification'
import BrandStatusNotice, { BrandResultBoundary } from '../components/common/BrandStatusNotice'
import InfoBox from '../components/common/InfoBox'
import SkipLink, { MAIN_ID } from '../components/common/SkipLink'
import ConditionBar from '../components/layout/ConditionBar'
import ResultFooter from '../components/layout/ResultFooter'
import ResultHeader from '../components/layout/ResultHeader'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { isDiagnosisReady, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { usePageTitle } from '../hooks/usePageTitle'
import { useReportData } from '../hooks/useReportData'
import { useResultBaseline } from '../hooks/useResultBaseline'
import AnalysisPage from './AnalysisPage'
import SummaryPage from './SummaryPage'

const T = MESSAGES.report

/**
 * 화면 그대로 PDF — STEP 02(입지 정보 분석)와 STEP 03(종합 진단 결과)을 결과 화면과 같은
 * 컴포넌트로 이어 붙이고 window.print()로 "PDF로 저장"한다. 사이드바·도구 막대는 인쇄에서 뺀다.
 * 같은 쿼리 캐시를 쓰므로 결과 화면에서 본 값이 그대로 들어가고, AI 해석은 받아 둔 경우에만 보인다.
 */
function ScreenReportContent() {
  usePageTitle(MESSAGES.titles.report)
  const data = useReportData(true)
  const baseline = useResultBaseline(
    BRAND_API_ENABLED || data.query.brandUrlNotice !== 'unsupported_brand',
  )
  const [printFailed, setPrintFailed] = useState(false)
  const { query } = data

  if (!isDiagnosisReady(query))
    return <Navigate to={{ pathname: ROUTES.input, search: toDiagnosisSearch(query) }} replace />
  if (!BRAND_API_ENABLED && query.brandUrlNotice === 'unsupported_brand')
    return (
      <main className="p-6">
        <InfoBox title={MESSAGES.brand.title} description={MESSAGES.brand.unsupportedUrl} />
        <Link
          className="inline-flex min-h-11 items-center underline"
          to={{ pathname: ROUTES.input, search: toDiagnosisSearch(query) }}
        >
          {MESSAGES.brand.resetConditions}
        </Link>
      </main>
    )

  const print = () => {
    setPrintFailed(false)
    try {
      window.print()
    } catch {
      setPrintFailed(true)
    }
  }

  return (
    <BrandResultBoundary>
      <div className="screen-report min-h-full bg-bg">
        <div className="print:hidden">
          <SkipLink />
        </div>
        {/* 화면 전용 도구 막대 (인쇄 시 숨김) */}
        <div className="sticky top-0 z-30 border-b border-gray-300 bg-gray-0 print:hidden">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link
              to={{ pathname: ROUTES.share, search: toDiagnosisSearch(query) }}
              className="flex items-center gap-1 text-caption font-semibold text-gray-900 hover:text-blue-700 max-md:min-h-11"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {T.back}
            </Link>
            <p className="text-micro text-gray-600">
              {data.captureLoading ? T.screenLoading : T.toolbarHint}
            </p>
            <button
              type="button"
              onClick={print}
              disabled={data.captureLoading}
              className="flex h-10 items-center gap-1.5 rounded-full bg-blue-600 px-5 text-caption font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:bg-gray-300"
            >
              <Printer className="size-4" aria-hidden="true" />
              {T.print}
            </button>
          </div>
          {printFailed && (
            <p role="alert" className="pb-3 text-center text-caption text-danger">
              {T.printFailed}
            </p>
          )}
        </div>

        <main
          id={MAIN_ID}
          tabIndex={-1}
          className="mx-auto max-w-[1160px] focus:outline-none print:max-w-none"
        >
          <ConditionBar />
          <BrandStatusNotice withFilterNotice />
          <section className="screen-report-step">
            <ResultHeader {...MESSAGES.resultPages.analysis} />
            <div className="px-4 pb-10 sm:px-10">
              <div className="max-w-[1080px]">
                <AnalysisPage />
              </div>
            </div>
          </section>
          {/* STEP 03은 새 페이지에서 시작 */}
          <section className="screen-report-step break-before-page">
            <ResultHeader {...MESSAGES.resultPages.summary} />
            <div className="px-4 pb-10 sm:px-10">
              <div className="max-w-[1080px]">
                <SummaryPage />
              </div>
            </div>
          </section>
          <ResultFooter baseline={baseline} />
        </main>
      </div>
    </BrandResultBoundary>
  )
}

export default function ScreenReportPage() {
  return (
    <AddressVerification>
      <ScreenReportContent />
    </AddressVerification>
  )
}
