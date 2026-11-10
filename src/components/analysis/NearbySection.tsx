import PagePlaceholder from '../common/PagePlaceholder'
import AnalysisSection from './AnalysisSection'
import ConditionFilterBar from './ConditionFilterBar'

// TODO: 지도·점포 표 (F-03, useNearbyStores), 시점 조회 (F-05)
export default function NearbySection() {
  return (
    <AnalysisSection id="nearby">
      <div className="flex flex-col gap-6">
        <ConditionFilterBar />
        <PagePlaceholder
          className="min-h-96"
          title="주변 점포 분석 (준비 중)"
          description="기준 시점에 반경 안에서 영업하던 같은 업종 점포 지도, 점포 목록, 시점 조회. (F-03~F-05)"
        />
      </div>
    </AnalysisSection>
  )
}
