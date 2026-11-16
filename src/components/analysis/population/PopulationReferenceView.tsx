import { MESSAGES } from '../../../constants/messages'
import type { PopulationBlock, PopulationReference } from '../../../types/population'
import { publicNumberText } from './populationDisplay'

const G = MESSAGES.reference.grid
const NAMES = { local: '내국인', long: '장기체류 외국인', short: '단기체류 외국인' }
const SOURCE_URLS = {
  local: 'https://data.seoul.go.kr/dataList/OA-22784/S/1/datasetView.do',
  long: 'https://data.seoul.go.kr/dataList/OA-22785/S/1/datasetView.do',
  short: 'https://data.seoul.go.kr/dataList/OA-22786/S/1/datasetView.do',
}
const REASONS: Record<string, string> = {
  ambiguous_source_version: '같은 날짜의 자료 버전을 확인 중이에요.',
  no_observation_in_period: '선택한 기준월에 비교할 관측 자료가 없어요.',
  scope_too_large: '이 범위는 현재 비교할 수 있는 자료량을 넘어요.',
  no_selected_grids: '반경 안에 선택된 격자가 없어요.',
  no_source_rows: '이 원천은 반경 안에 제공된 자료가 없어요.',
  no_common_public_components: '24시간 모두 공개된 동일 구성이 없어 비교할 수 없어요.',
  numeric_scope_too_large: '이 원천의 값이 현재 계산 범위를 넘어요.',
}

/**
 * 250m 격자 공개자료 주야간 비교 (부분) — 생활인구 카드 안 "격자 단위 부분자료 보기"에 들어가는 표 한 장.
 * 원천(내국인·장기·단기체류 외국인)마다 한 줄, 서버 비중 값(display) 그대로. 소수 배수는 화면에서 뺐다.
 * 다른 원천의 값을 대신 채우지 않는다 (행마다 data-population-source).
 */
export default function PopulationReferenceView({
  data,
  compact = false,
  isDemo = false,
}: {
  data: PopulationReference
  compact?: boolean
  isDemo?: boolean
}) {
  return (
    <section aria-label="공개자료 주야간 비교" className="flex min-w-0 flex-col gap-2 text-caption">
      <p className="text-gray-600">
        {isDemo && <span className="text-orange-700">시연용 가상 자료 · </span>}
        {G.basis(data.analysis_date, data.observation_date ?? '자료 없음', data.scope.radius_m)}
      </p>
      {data.status !== 'ready' ? (
        <p role="status" className="text-gray-600">
          {REASONS[data.reason ?? ''] ?? '자료를 확인 중이에요.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left tabular-nums">
              <caption className="sr-only">{G.caption}</caption>
              <thead className="text-gray-600">
                <tr className="border-b border-gray-300">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    {G.cols.source}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {G.cols.day}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {G.cols.night}
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    {G.cols.grids}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {data.sources.map((source) => (
                  <SourceRow key={source.source} source={source} />
                ))}
              </tbody>
            </table>
          </div>
          {data.sources
            .filter((s) => s.limitations.includes('exclusion_pattern_may_bias_ratio'))
            .map((s) => (
              <p key={s.source} className="text-micro text-gray-700">
                {NAMES[s.source]}: 주간에만 비공개·누락이 있는 구성{' '}
                {s.quality.excluded_by_hour_class.day_only}개, 야간에만 있는 구성{' '}
                {s.quality.excluded_by_hour_class.night_only}개가 제외돼 비중이 달라 보일 수 있어요.
              </p>
            ))}
        </>
      )}
      <p className="text-micro text-gray-600">{G.note}</p>
      {!compact && data.status === 'ready' && (
        <details className="text-micro text-gray-600 print:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold focus-visible:outline-2">
            {G.detailToggle}
          </summary>
          <ul className="flex flex-col gap-2">
            {data.sources.map((source) => (
              <SourceDetail key={source.source} source={source} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

function SourceRow({ source }: { source: PopulationBlock }) {
  const values = source.values
  const q = source.quality
  return (
    <tr
      data-population-source={source.source}
      className="border-b border-gray-300/60 last:border-b-0"
    >
      <th scope="row" className="py-2 pr-3 font-semibold break-keep">
        {NAMES[source.source]}
      </th>
      {source.status !== 'partial' || !values ? (
        <td colSpan={3} className="py-2 text-gray-600">
          {REASONS[source.reason] ?? '비교할 자료가 없어요.'}
        </td>
      ) : (
        <>
          <td className="py-2 pr-3 text-right">{publicNumberText(values.day_share_pct)}</td>
          <td className="py-2 pr-3 text-right">{publicNumberText(values.night_share_pct)}</td>
          <td className="py-2 text-right whitespace-nowrap">
            {G.grids(q.used_grid_count, q.selected_grid_count)}
          </td>
        </>
      )}
    </tr>
  )
}

/** 접힌 상세 — 자료 범위(비공개·빈 값 등)와 공개 원천값(인원수 아님), 원천 링크 */
function SourceDetail({ source }: { source: PopulationBlock }) {
  const q = source.quality
  const values = source.values
  return (
    <li>
      <p className="font-semibold">{NAMES[source.source]}</p>
      <p>
        사용 구성 {q.used_component_count} / 파일 내 후보 {q.candidate_component_count} · 비공개{' '}
        {q.suppressed_rows}행 · 빈 값 {q.missing_rows}행 · 후보 내 없는 시간{' '}
        {q.absent_hours_within_candidates}개
      </p>
      <p>원천 전체 위치 미확인 {q.version_unlocated_rows}행 (이 반경의 누락 수가 아님)</p>
      {values && (
        <p>
          공개 원천값 합 (인원수 아님): 주간 {publicNumberText(values.day_source_sum)} · 야간{' '}
          {publicNumberText(values.night_source_sum)} · 시간별 평균 주간{' '}
          {publicNumberText(values.day_source_mean)} · 야간{' '}
          {publicNumberText(values.night_source_mean)}
        </p>
      )}
      <a
        href={SOURCE_URLS[source.source]}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center underline"
      >
        {G.sourceLink(NAMES[source.source])}
      </a>
    </li>
  )
}
