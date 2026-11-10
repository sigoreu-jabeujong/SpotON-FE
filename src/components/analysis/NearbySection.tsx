import PagePlaceholder from '../common/PagePlaceholder'
import AnalysisSection from './AnalysisSection'

// TODO: 지도·세부 필터·점포 표·시점 조회 (F-03~F-05, useNearbyStores·useStoreSnapshot·useDataRange)
export default function NearbySection() {
  return (
    <AnalysisSection id="nearby">
      <PagePlaceholder
        title="주변 점포 분석 (준비 중)"
        description="기준 시점에 반경 안에서 영업하던 같은 업종 점포 지도, 세부 필터, 점포 목록, 시점 조회. (F-03~F-05)"
      />
    </AnalysisSection>
  )
}
