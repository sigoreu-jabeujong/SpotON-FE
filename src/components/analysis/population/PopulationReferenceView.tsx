import type { PopulationBlock, PopulationReference, PublicNumber } from '../../../types/population'
import { publicNumberText } from './populationDisplay'

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
    <section aria-label="공개자료 주야간 비교" className="flex min-w-0 flex-col gap-3">
      <div>
        <h2 className="text-body font-bold">공개자료 주야간 비교 (부분)</h2>
        {isDemo && <p className="text-caption text-orange-700">시연용 가상 자료</p>}
        <p className="text-caption text-gray-600">
          분석 기준일 {data.analysis_date} · 관측일 {data.observation_date ?? '자료 없음'} · 반경{' '}
          {data.scope.radius_m}m
        </p>
        <p className="text-caption text-gray-600">
          주간 06~17시 · 야간 00~05시, 18~23시 (Spot:ON 기준)
        </p>
      </div>
      <p className="text-caption text-gray-700">
        공개된 동일 구성만 비교한 참고값이며 전체 인구를 대표하지 않아요. 업종·브랜드·면적 조건으로
        인구 자료를 거르지 않아요.
      </p>
      {data.status !== 'ready' ? (
        <p role="status" className="text-caption text-gray-600">
          {REASONS[data.reason ?? ''] ?? '자료를 확인 중이에요.'}
        </p>
      ) : (
        <div
          className={
            compact
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-3'
              : 'grid grid-cols-1 gap-4 lg:grid-cols-3'
          }
        >
          {data.sources.map((source) => (
            <SourceCard key={source.source} source={source} compact={compact} />
          ))}
        </div>
      )}
      <p className="text-micro text-gray-600">
        격자 적용일과 행정동별 합산 기준은 확인 중이에요. 공개된 구성에 치우칠 수 있어 실제
        방문객·고객 수나 창업의 유불리로 해석하지 않아요.
      </p>
    </section>
  )
}

function SourceCard({ source, compact }: { source: PopulationBlock; compact: boolean }) {
  const q = source.quality
  const values = source.values
  return (
    <article
      data-population-source={source.source}
      className="flex min-w-0 flex-col gap-3 rounded-card border border-gray-300 p-4 print:rounded-none print:p-2"
    >
      <h3 className="text-caption font-bold">{NAMES[source.source]} 공개자료 주야간 비교 (부분)</h3>
      {source.status !== 'partial' || !values ? (
        <p className="text-caption text-gray-600">
          {REASONS[source.reason] ?? '비교할 자료가 없어요.'}
        </p>
      ) : (
        <dl className="flex flex-col gap-2 text-caption">
          {[
            ['주간/야간 배수', values.day_night_ratio],
            ['주간 비중', values.day_share_pct],
            ['야간 비중', values.night_share_pct],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <dt>{label as string}</dt>
              <dd className="min-w-0 font-semibold break-words">
                {publicNumberText(value as PublicNumber)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-micro text-gray-600">
        사용 구성 {q.used_component_count} / 파일 내 후보 {q.candidate_component_count}
        <br />
        사용 격자 {q.used_grid_count} / 선택 격자 {q.selected_grid_count}
      </p>
      {source.limitations.includes('exclusion_pattern_may_bias_ratio') && (
        <p className="text-micro text-gray-700">
          주간에만 비공개·누락이 있는 구성 {q.excluded_by_hour_class.day_only}개, 야간에만 있는 구성{' '}
          {q.excluded_by_hour_class.night_only}개가 제외돼 배수가 달라 보일 수 있어요.
        </p>
      )}
      {!compact && (
        <details className="text-micro text-gray-600 print:hidden">
          <summary className="cursor-pointer py-2 font-semibold focus-visible:outline-2">
            자료 범위와 공개 원천값 상세
          </summary>
          <p>
            비공개 {q.suppressed_rows}행 · 빈 값 {q.missing_rows}행 · 후보 내 없는 시간{' '}
            {q.absent_hours_within_candidates}개
          </p>
          <p>원천 전체 위치 미확인 {q.version_unlocated_rows}행 (이 반경의 누락 수가 아님)</p>
          {values && (
            <>
              <p className="mt-2 font-semibold">공개 원천값 합 (인원수 아님)</p>
              <p>
                주간 {publicNumberText(values.day_source_sum)} · 야간{' '}
                {publicNumberText(values.night_source_sum)}
              </p>
              <p>
                시간별 평균: 주간 {publicNumberText(values.day_source_mean)} · 야간{' '}
                {publicNumberText(values.night_source_mean)}
              </p>
            </>
          )}
        </details>
      )}
      <a
        href={SOURCE_URLS[source.source]}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center text-micro underline print:hidden"
      >
        서울시 원천 자료 (새 창)
      </a>
    </article>
  )
}
