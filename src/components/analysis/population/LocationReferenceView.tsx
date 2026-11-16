import type { ReactNode } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type {
  DayNightReferenceItem,
  LocationReference,
  ReferenceNumber,
  SalesReferenceItem,
} from '../../../types/locationReference'
import SalesDistributionChart from './SalesDistributionChart'

const R = MESSAGES.reference
const quarter = (q: string | null) => (q ? R.quarter(q) : R.noValue)

function unavailable(reason: string | null | undefined) {
  if (reason === 'no_spatial_overlap') return '이 위치나 반경과 겹치는 공개 구역이 없어요.'
  if (reason === 'no_data_in_analysis_period') return '선택한 분석 기간의 자료가 없어요.'
  if (reason === 'no_complete_day')
    return '비공개 값 또는 누락 시간이 있어 하루 평균을 제공할 수 없어요.'
  if (reason === 'population_source_not_released') return '생활인구 자료 연결을 준비 중이에요.'
  if (reason === 'scope_too_large') return '조회 범위가 커서 자료를 표시할 수 없어요.'
  return '이 구역의 제공 가능한 자료가 없어요.'
}

function metric(value: ReferenceNumber | null | undefined) {
  // The exact decimal/string and source unit are server-owned, including huge KRW values.
  return value?.display?.replace(/\/점포$/, '') ?? R.noValue
}

/** 상권 표 비고 — 반복 설명 대신 짧은 표시 (반영 대상은 비움) */
function marketNote(item: SalesReferenceItem) {
  if (!item.metric || item.status === 'no_data') return R.marketNote.no_data
  const status = item.average_contribution?.status
  if (status === 'different_quarter') return R.marketNote.different_quarter
  if (status === 'excluded') return R.marketNote.excluded
  return ''
}

function Card({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) {
  return (
    <section
      data-card={id}
      className="flex min-w-0 flex-col gap-3 rounded-card border border-gray-300 bg-gray-0 p-5"
    >
      <h3 className="flex items-center gap-1 text-subtitle font-bold text-gray-900">{title}</h3>
      {children}
    </section>
  )
}

/** 인근 상권 추정매출 — 큰 숫자 + 한 줄 요약 + 그래프 하나 + 접힌 상권별 표 */
function SalesCard({ data }: { data: LocationReference }) {
  const average = data.sales.per_store_average
  const weighted = average?.store_weighted_distribution
  const useWeightedMedian = average?.representative_method === 'store_weighted_median_v1'
  const items = data.sales.items ?? []
  const otherGroups = (average?.groups ?? []).filter(
    (g) => g.source_quarter !== average?.primary_quarter,
  )
  return (
    <Card id="sales" title={R.salesTitle}>
      {average ? (
        <div>
          <p className="text-caption font-semibold text-gray-600">{R.salesHeadline}</p>
          <p className="text-title leading-tight font-bold break-all text-gray-900">
            {metric(useWeightedMedian ? weighted?.median : average.metric)}
          </p>
          <p className="mt-1 text-caption text-gray-600">
            {R.salesSummary(average.included_item_count, quarter(average.primary_quarter))}
          </p>
          <SalesDistributionChart average={average} items={items} variant="screen" />
        </div>
      ) : (
        !items.length && <p role="status">{unavailable(data.sales.reason)}</p>
      )}
      {items.length > 0 && (
        <details className="text-caption">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-900">
            {R.marketsToggle(items.length)}
          </summary>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left tabular-nums">
              <caption className="sr-only">{R.marketsCaption}</caption>
              <thead className="text-gray-600">
                <tr className="border-b border-gray-300">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    {R.marketCols.name}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {R.marketCols.perStore}
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {R.marketCols.stores}
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    {R.marketCols.note}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {items.map((item) => (
                  <tr
                    key={`${item.market_code}-${item.industry_code}`}
                    className="border-b border-gray-300/60 last:border-b-0"
                  >
                    <th scope="row" className="py-2 pr-3 font-semibold break-keep">
                      {item.market_name}
                    </th>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {item.per_store_metric ? metric(item.per_store_metric) : '—'}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {item.store_reference?.total_stores
                        ? `${item.store_reference.total_stores}개`
                        : '—'}
                    </td>
                    <td className="py-2 text-gray-600">{marketNote(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {otherGroups.map((g) => (
            <p key={g.source_quarter} className="mt-2 text-gray-600">
              {R.otherQuarter(
                quarter(g.source_quarter),
                metric(useWeightedMedian ? g.store_weighted_distribution?.median : g.metric),
              )}
            </p>
          ))}
        </details>
      )}
      <a
        className="mt-auto text-caption text-gray-600 underline"
        href="https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do"
        target="_blank"
        rel="noreferrer"
      >
        {R.salesSource}
      </a>
    </Card>
  )
}

/** 주간·야간 막대 — 서버 비중(%) 값을 0~100 눈금에 그대로 옮긴다 (계산 없음) */
function ShareBar({
  label,
  share,
  mean,
}: {
  label: string
  share: ReferenceNumber | null
  mean: ReferenceNumber | null
}) {
  const pct = share?.value != null && /^\d+(\.\d+)?$/.test(share.value) ? Number(share.value) : null
  return (
    <div className="flex items-center gap-3 text-caption">
      <span className="w-8 shrink-0 text-gray-600">{label}</span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        {pct !== null && (
          <span
            className={`block h-full rounded-full ${label === R.day ? 'bg-blue-500' : 'bg-gray-600'}`}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        )}
      </span>
      <span className="shrink-0 text-right font-semibold whitespace-nowrap text-gray-900 tabular-nums">
        {metric(mean)}
      </span>
    </div>
  )
}

function DayNight({ item }: { item: DayNightReferenceItem }) {
  if (item.status === 'no_data')
    return <p className="text-caption text-gray-600">{unavailable(item.reason)}</p>
  return (
    <div className="flex flex-col gap-1.5">
      <ShareBar label={R.day} share={item.day_share_pct} mean={item.mean_day} />
      <ShareBar label={R.night} share={item.night_share_pct} mean={item.mean_night} />
      <p className="text-caption text-gray-600">
        {R.shares(metric(item.day_share_pct), metric(item.night_share_pct))}
      </p>
    </div>
  )
}

/**
 * 생활인구 (주간·야간) — 행정동 생활인구·주야간 비교·250m 격자 부분자료를 카드 하나로.
 * 주야간 비교는 같은 행정동·관측일·원천의 자료일 때만 붙인다 (다른 날짜를 섞지 않음).
 */
function PopulationCard({ data, grid }: { data: LocationReference; grid?: ReactNode }) {
  const people = data.living_population.items ?? []
  const dayNight = data.day_night.items ?? []
  const unmatched = dayNight.filter(
    (d) =>
      !people.some(
        (p) =>
          p.area_ref === d.area_ref &&
          p.observation_date === d.observation_date &&
          p.provenance_ref === d.provenance_ref &&
          p.population_scope === d.population_scope,
      ),
  )
  return (
    <Card id="population" title={R.populationTitle}>
      {people.length ? (
        people.map((item) => {
          const pair = dayNight.find(
            (d) =>
              d.area_ref === item.area_ref &&
              d.observation_date === item.observation_date &&
              d.provenance_ref === item.provenance_ref &&
              d.population_scope === item.population_scope,
          )
          return (
            <div key={item.area_ref} className="flex flex-col gap-3">
              <p className="text-caption text-gray-600">
                <span className="font-semibold text-gray-900">{item.area_name}</span>
                {item.spatial_relation !== 'contains_point' && ` · ${R.intersectsArea}`} ·{' '}
                {R.observed(item.observation_date)}
              </p>
              <div>
                <p className="text-caption font-semibold text-gray-600">{R.populationHeadline}</p>
                <p className="text-title leading-tight font-bold break-all text-gray-900">
                  {metric(item.mean_24h)}
                </p>
                {item.observed_hours < 24 && (
                  <p className="text-caption text-gray-600">
                    {R.observedHours(item.observed_hours)}
                  </p>
                )}
                {!item.mean_24h && (
                  <p className="text-caption text-gray-600">{unavailable(item.reason)}</p>
                )}
              </div>
              {pair && <DayNight item={pair} />}
            </div>
          )
        })
      ) : (
        <p role="status">{unavailable(data.living_population.reason)}</p>
      )}
      {unmatched.length > 0 && <p className="text-caption text-gray-600">{R.dayNightMismatch}</p>}
      {!dayNight.length && people.length > 0 && (
        <p className="text-caption text-gray-600">{unavailable(data.day_night.reason)}</p>
      )}
      <p className="text-caption text-gray-600">
        관측일 24시간 생활인구의 시간당 평균이에요. 주간 06~17시 · 야간 00~05시, 18~23시 (Spot:ON
        기준). 통계적 추정치이며 실제 방문객·고객 수나 창업의 유불리를 의미하지 않아요.
      </p>
      <a
        className="text-caption text-gray-600 underline"
        href="https://data.seoul.go.kr/dataList/OA-23016/S/1/datasetView.do"
        target="_blank"
        rel="noreferrer"
      >
        {R.populationSource}
      </a>
      {grid && (
        <details className="text-caption">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-gray-900">
            {R.gridToggle}
          </summary>
          {grid}
        </details>
      )}
    </Card>
  )
}

/** 결과 화면(STEP 02·03)용 위치 참고자료. 진단서는 LocationReferencePrint */
export default function LocationReferenceView({
  data,
  isDemo = false,
  grid,
}: {
  data: LocationReference
  isDemo?: boolean
  /** 생활인구 카드 맨 아래 접힌 "격자 단위 부분자료 보기"에 넣을 내용 (250m 격자 공개자료) */
  grid?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6" data-testid="location-reference">
      <p className="text-caption text-gray-600">
        {isDemo && '예시 자료 · '}분석 기준일 {data.analysis_as_of} ·{' '}
        {data.time_mode === 'latest_reference'
          ? '적재된 최신 공개자료를 별도 날짜의 참고값으로 표시해요.'
          : '선택한 분석 기간의 자료만 표시해요.'}{' '}
        각 구역 단위의 수치이며 반경 비율로 나누지 않아요. 점포당 참고값은 같은 분기의 상권·업종별
        자료로 계산해요. 기존 AI 해석에 반영되는 값은 아니에요. 가맹·브랜드·면적 등 점포 조건으로 이
        참고자료의 수치를 거르지 않아요.
      </p>
      <div className="grid grid-cols-2 items-start gap-6 max-md:grid-cols-1">
        <SalesCard data={data} />
        <PopulationCard data={data} grid={grid} />
      </div>
    </div>
  )
}
