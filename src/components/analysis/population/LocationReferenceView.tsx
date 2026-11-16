import type { ReactNode } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type {
  AdminReferenceItem,
  LocationReference,
  ReferenceNumber,
  SalesReferenceItem,
} from '../../../types/locationReference'
import SubTitle from '../../common/SubTitle'
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

const relation = (value: string) =>
  value === 'contains_point' ? '검색 위치 포함' : '선택 반경과 겹침 (대체값 아님)'
const periodRelation = (value: string | null) =>
  value === 'later_reference'
    ? '분석 기준 이후 참고자료'
    : value === 'earlier_reference'
      ? '분석 기준 이전 참고자료'
      : '분석 기간 자료'
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

function Frame({
  title,
  children,
  notice,
}: {
  title: string
  children: ReactNode
  notice?: string
}) {
  return (
    <section className="flex min-w-0 break-inside-avoid flex-col gap-3">
      <SubTitle>{title}</SubTitle>
      {children}
      {notice && <p className="text-caption text-gray-600">{notice}</p>}
    </section>
  )
}

function Place({ item }: { item: AdminReferenceItem }) {
  return (
    <>
      <p className="font-semibold break-words">
        {item.area_name}
        {item.spatial_relation !== 'contains_point' && ` · ${relation(item.spatial_relation)}`}
      </p>
      <p className="text-caption text-gray-600">
        관측일 {item.observation_date} · {periodRelation(item.temporal_relation)}
      </p>
    </>
  )
}

function PopulationSource() {
  return (
    <div className="mt-3 border-t border-gray-300 pt-3 text-caption text-gray-600">
      <p>관측일 24시간 생활인구의 시간당 평균이에요.</p>
      <a
        className="mt-1 inline-block underline"
        href="https://data.seoul.go.kr/dataList/OA-23016/S/1/datasetView.do"
        target="_blank"
        rel="noreferrer"
      >
        출처: 서울시 행정동 내국인 생활인구
      </a>
    </div>
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

/** 결과 화면(STEP 02·03)용 위치 참고자료. 진단서는 LocationReferencePrint */
export default function LocationReferenceView({
  data,
  isDemo = false,
}: {
  data: LocationReference
  isDemo?: boolean
}) {
  const people = data.living_population.items ?? []
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
        <Frame title="생활인구">
          {people.length ? (
            people.map((item) => (
              <div
                className="min-w-0 rounded-control border border-gray-200 p-4"
                key={item.area_ref}
              >
                <Place item={item} />
                <p className="text-xl font-bold break-all">{metric(item.mean_24h)}</p>
                <p className="text-caption">공개된 관측 시간 {item.observed_hours}/24시간</p>
                {!item.mean_24h && <p className="text-caption">{unavailable(item.reason)}</p>}
                <PopulationSource />
              </div>
            ))
          ) : (
            <div className="min-w-0 rounded-control border border-gray-200 p-4">
              <p role="status">{unavailable(data.living_population.reason)}</p>
              <PopulationSource />
            </div>
          )}
        </Frame>
      </div>
      <Frame
        title="주야간 생활인구 비교"
        notice="주간 06~17시 · 야간 00~05시, 18~23시 (Spot:ON 기준). 동일 행정동·관측일·내국인 자료로 비교해요. 통계적 추정치이며 실제 방문객·고객 수나 창업의 유불리를 의미하지 않아요. 행정동 경계의 적용일은 확인 중이에요."
      >
        {data.day_night.items?.length ? (
          data.day_night.items.map((item) => {
            const place = people.find(
              (p) =>
                p.area_ref === item.area_ref &&
                p.observation_date === item.observation_date &&
                p.provenance_ref === item.provenance_ref &&
                p.population_scope === item.population_scope,
            )
            if (!place)
              return <p key={item.area_ref}>비교 자료의 구역·관측일을 확인할 수 없어요.</p>
            return (
              <div
                className="min-w-0 rounded-control border border-gray-200 p-4"
                key={item.area_ref}
              >
                <Place item={place} />
                <p className="break-words">
                  주간 시간당 평균 <b>{metric(item.mean_day)}</b> · 야간 시간당 평균{' '}
                  <b>{metric(item.mean_night)}</b>
                </p>
                <p className="break-words">
                  주간/야간 비율 <b>{metric(item.day_night_ratio)}</b> · 주간 비중{' '}
                  {metric(item.day_share_pct)} · 야간 비중 {metric(item.night_share_pct)}
                </p>
                {item.reason === 'zero_night_population' && (
                  <p className="text-caption">야간 값이 0이라 주간/야간 비율은 계산하지 않아요.</p>
                )}
                {item.status === 'no_data' && (
                  <p className="text-caption">{unavailable(item.reason)}</p>
                )}
              </div>
            )
          })
        ) : (
          <p role="status">{unavailable(data.day_night.reason)}</p>
        )}
        <a
          className="text-caption underline"
          href="https://data.seoul.go.kr/dataList/OA-22160/S/1/datasetView.do"
          target="_blank"
          rel="noreferrer"
        >
          적용 공간: 서울시 행정동 경계 공개자료
        </a>
      </Frame>
    </div>
  )
}
