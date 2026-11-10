import { useEffect } from 'react'
import { useLocation } from 'react-router'
import ActivitySection from '../components/analysis/ActivitySection'
import HistorySection from '../components/analysis/HistorySection'
import NearbySection from '../components/analysis/NearbySection'
import Card from '../components/common/Card'

/** STEP 02 입지 정보 분석 — 섹션 3개를 세로로 (#history, #nearby, #activity) */
export default function AnalysisPage() {
  const { hash } = useLocation()

  // 다른 화면·예전 경로에서 #섹션으로 들어오면 그 섹션으로 이동
  useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [hash])

  return (
    <Card className="flex flex-col gap-16">
      <HistorySection />
      <NearbySection />
      <ActivitySection />
    </Card>
  )
}
