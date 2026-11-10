import PagePlaceholder from '../common/PagePlaceholder'
import AnalysisSection from './AnalysisSection'

// TODO: 점포 현황 카드·연도별 개폐업 추이·조건부 상권 지표 (F-06, useMarketActivity)
export default function ActivitySection() {
  return (
    <AnalysisSection id="activity">
      <PagePlaceholder
        title="상권 활동 분석 (준비 중)"
        description="반경 안 최근 12개월 개업·폐업 수, 연도별 추이, 세부 업종별 점포 수. 조건부: 상권별 추정매출·격자 생활인구. (F-06)"
      />
    </AnalysisSection>
  )
}
