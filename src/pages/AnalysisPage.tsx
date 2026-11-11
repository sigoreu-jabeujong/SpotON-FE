import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import ActivitySection from '../components/analysis/ActivitySection'
import AnalysisSection from '../components/analysis/AnalysisSection'
import HistorySection from '../components/analysis/HistorySection'
import NearbySection from '../components/analysis/NearbySection'
import Card from '../components/common/Card'
import SectionErrorBoundary from '../components/common/SectionErrorBoundary'
import type { AnalysisSectionId } from '../constants/routes'

/** 섹션이 깨져도 머리·앵커(#id)는 남겨 사이드바 이동이 그대로 되게 한다 */
const keepSection = (id: AnalysisSectionId) => (fallback: ReactNode) => (
  <AnalysisSection id={id}>{fallback}</AnalysisSection>
)

/** #섹션으로 들어온 뒤 위쪽 내용이 자리 잡을 때까지 목표 섹션을 따라가는 시간 */
const SETTLE_MS = 4000

/** STEP 02 입지 정보 분석 — 섹션 3개를 세로로 (#history, #nearby, #activity) */
export default function AnalysisPage() {
  const { hash, search } = useLocation()

  // 다른 화면·예전 경로에서 #섹션으로 들어오면 그 섹션으로 이동
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return
    target.scrollIntoView()
    // 위쪽 섹션(지도·표·차트)이 늦게 불러와져 높이가 커지면 목표 섹션이 밀려나므로,
    // 잠시 동안 크기가 바뀔 때마다 다시 맞춘다. 사용자가 직접 스크롤하면 바로 멈춘다.
    const observer = new ResizeObserver(() => target.scrollIntoView())
    // body는 높이가 화면 크기로 고정이라, 실제로 커지는 본문(main)을 지켜본다
    observer.observe(target.closest('main') ?? document.documentElement)
    const stop = () => observer.disconnect()
    const timer = window.setTimeout(stop, SETTLE_MS)
    const userEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
    userEvents.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))
    return () => {
      stop()
      window.clearTimeout(timer)
      userEvents.forEach((e) => window.removeEventListener(e, stop))
    }
  }, [hash])

  return (
    <Card className="flex flex-col gap-16">
      <SectionErrorBoundary resetKey={search} wrap={keepSection('history')}>
        <HistorySection />
      </SectionErrorBoundary>
      <SectionErrorBoundary resetKey={search} wrap={keepSection('nearby')}>
        <NearbySection />
      </SectionErrorBoundary>
      <SectionErrorBoundary resetKey={search} wrap={keepSection('activity')}>
        <ActivitySection />
      </SectionErrorBoundary>
    </Card>
  )
}
