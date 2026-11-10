import Card from '../components/common/Card'
import PagePlaceholder from '../components/common/PagePlaceholder'

// TODO: 서울시 공식 / Spot:ON 참고지표 카드, AI 해석·체크리스트 (F-07·F-08, useRisk·useRiskInterpret)
// 디자인의 "창업 위험도 점수·등급"은 원칙상 만들지 않는다 (docs/decisions.md)
export default function SummaryPage() {
  return (
    <Card>
      <PagePlaceholder
        title="종합 진단 결과 (준비 중)"
        description="서울시 공식 지표와 Spot:ON 참고지표를 나눠 보여주고, 판단 보류·자료 없음 상태와 AI 해석·계약 전 체크리스트를 제공해요. (F-07~F-08)"
      />
    </Card>
  )
}
