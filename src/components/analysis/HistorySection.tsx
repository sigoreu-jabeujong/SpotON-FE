import PagePlaceholder from '../common/PagePlaceholder'
import AnalysisSection from './AnalysisSection'

// TODO: 과거 점포 이력 표·더보기·안내 박스 (F-02, useStoreHistory)
export default function HistorySection() {
  return (
    <AnalysisSection id="history">
      {/* 임시 높이: 내용 구현 전 사이드바 스크롤 강조 확인용 */}
      <PagePlaceholder
        className="min-h-96"
        title="과거 점포 이력 (준비 중)"
        description="같은 건물을 거쳐 간 점포의 개업·폐업일, 영업 기간, 업종, 프랜차이즈(추정), 위치 일치 여부를 시간순으로 보여줘요. (F-02)"
      />
    </AnalysisSection>
  )
}
