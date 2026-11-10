import type { RiskInterpretation } from '../../../types/risk'

/** AI 해석 결과 카드 (다음 커밋에서 섹션·근거 지표 칩을 채운다) */
export default function AiResultCard({ result }: { result: RiskInterpretation }) {
  return (
    <div className="rounded-card bg-blue-100 px-6 py-5 text-body text-gray-900">
      {result.official_values.map((v) => (
        <p key={v.text}>{v.text}</p>
      ))}
    </div>
  )
}
