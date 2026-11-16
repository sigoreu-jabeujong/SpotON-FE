import type { AiPopulationReference } from '../../../types/aiPopulation'

const REASONS: Record<string, string> = {
  ambiguous_source_version: '같은 날짜의 자료 버전을 확인 중이에요.',
  no_observation_in_period: '선택 기준월에 비교할 관측 자료가 없어요.',
  scope_too_large: '현재 비교할 수 있는 자료량을 넘어요.',
  no_selected_grids: '반경 안에 선택된 격자가 없어요.',
  no_source_rows: '제공된 원천 자료가 없어요.',
  no_common_public_components: '모든 시간에 공개된 동일 구성이 없어요.',
  numeric_scope_too_large: '계산할 수 있는 수치 범위를 넘어요.',
}
const NAMES = { local: '내국인', long: '장기체류 외국인', short: '단기체류 외국인' }

/** AI POST evidence dates; independent GET card dates can differ after a source update. */
export default function AiPopulationInfo({ data }: { data?: AiPopulationReference }) {
  if (!data) return null
  return (
    <section
      aria-label="AI가 확인한 공개 부분자료"
      className="space-y-1 text-caption leading-relaxed"
    >
      <h4 className="font-bold">AI가 확인한 공개 부분자료</h4>
      {data.sources.some((source) => source.status === 'partial') && (
        <p>출처: 서울시 생활인구 250m 격자 공개자료(R4)</p>
      )}
      <p>
        AI 분석일 {data.analysis_date} · 인구 관측일 {data.observation_date ?? '자료 없음'}
      </p>
      {data.status === 'ready' ? (
        <ul className="space-y-1">
          {data.sources.map((source) => (
            <li key={source.source}>
              {NAMES[source.source]}:{' '}
              {source.status === 'partial'
                ? '공개된 동일 구성의 부분 비교'
                : (REASONS[source.reason] ?? '비교할 자료가 없어요.')}
            </li>
          ))}
        </ul>
      ) : (
        <p>{REASONS[data.reason ?? ''] ?? '비교 자료를 확인 중이에요.'}</p>
      )}
      <p>
        전체 생활인구는 미확정이며, 부분자료는 전체 인구·실제 방문객을 대표하지 않아요. 점포 필터로
        인구를 거르지 않아요.
      </p>
    </section>
  )
}
