import Card from '../components/common/Card'
import PagePlaceholder from '../components/common/PagePlaceholder'

// TODO: PDF 진단서·요약 이미지 저장, 상담·지원 링크, 다른 주소 재진단 (F-09~F-10, useSupportLinks)
export default function SharePage() {
  return (
    <Card>
      <PagePlaceholder
        title="결과 저장 및 상담 (준비 중)"
        description="PDF 진단서·요약 이미지 저장, 공공 창업 상담·지원사업 연결, 다른 주소 다시 진단. (F-09~F-10)"
      />
    </Card>
  )
}
