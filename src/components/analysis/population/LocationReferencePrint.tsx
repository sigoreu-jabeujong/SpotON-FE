import type { ReactNode } from 'react'
import type {
  AdminReferenceItem,
  LocationReference,
  ReferenceNumber,
} from '../../../types/locationReference'
import SubTitle from '../../common/SubTitle'
import SalesDistributionChart from './SalesDistributionChart'

const quarter = (q: string | null) => (q ? `${q.slice(0, 4)}년 ${q.slice(4)}분기` : '자료 없음')
const exclusion: Record<string, string> = {
  sales_unavailable: '매출 자료 없음',
  different_quarter: '다른 자료 분기',
  store_row_missing: '점포 수 자료 없음',
  store_mapping_conflict: '자료 정보 불일치',
  zero_store_count: '점포 수 0개',
  zero_store_count_with_sales: '점포 수 0개·매출 존재',
}

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
  return value?.display?.replace(/\/점포$/, '') ?? '자료 없음'
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

/**
 * 진단서(인쇄)용 참고자료 — 화면용 LocationReferenceView를 간단히 바꾸기 전 모양 그대로 둔다
 * (진단서는 이번 정리 대상이 아니라서 출력이 바뀌지 않게 따로 유지)
 */
export default function LocationReferencePrint({
  data,
  isDemo = false,
}: {
  data: LocationReference
  isDemo?: boolean
}) {
  const people = data.living_population.items ?? []
  const topMarkets = data.sales.top_markets_estimate
  const hasTopMarketsContract = 'top_markets_estimate' in data.sales
  const weighted = data.sales.per_store_average?.store_weighted_distribution
  const useWeightedMedian =
    data.sales.per_store_average?.representative_method === 'store_weighted_median_v1'
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
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <Frame
          title="인근 상권 추정매출"
          notice="상권 단위 원자료 금액으로, 이 자리 점포의 실제 매출이 아니에요."
        >
          {topMarkets && (
            <div
              className="rounded-control border border-gray-200 p-4"
              data-testid="top-markets-estimate"
            >
              <p className="font-semibold">점포당 추정 매출</p>
              <p className="text-xl font-bold break-all">{metric(topMarkets.metric)}</p>
              {topMarkets.metric ? (
                <>
                  <p className="mt-2 text-caption text-gray-600">
                    {topMarkets.markets.map((m) => m.market_name).join(' · ')} 상권의 매출액을
                    토대로 추정했습니다.
                  </p>
                  <p className="mt-1 text-caption text-gray-600">
                    자료 분기 {quarter(topMarkets.source_quarter)} · 점포 수 상위{' '}
                    {topMarkets.selected_market_count}개 상권
                  </p>
                  {topMarkets.selected_market_count < 3 && (
                    <p className="text-caption text-gray-600">
                      유효한 상권이 3곳보다 적어 {topMarkets.selected_market_count}곳의 자료를
                      사용했어요.
                    </p>
                  )}
                  {topMarkets.excluded_item_count > 0 && (
                    <p className="text-caption text-gray-600">
                      매출과 점포 수를 함께 확인할 수 없는 {topMarkets.excluded_item_count}개 항목은
                      제외했어요.
                    </p>
                  )}
                  <details className="mt-2 text-caption text-gray-600">
                    <summary className="cursor-pointer">계산 기준</summary>
                    <p>
                      선정한 상권의 매출 합계 {topMarkets.total_sales}원 ÷ 점포 수 합계{' '}
                      {topMarkets.total_store_count}개
                    </p>
                    {topMarkets.markets.map((m) => (
                      <p key={m.market_code}>
                        {m.market_name}: 매출 {m.total_sales}원 · 점포 {m.total_store_count}개
                      </p>
                    ))}
                  </details>
                </>
              ) : (
                <p className="text-caption">
                  같은 분기의 매출과 점포 수를 함께 확인할 수 있는 상권이 없어요.
                </p>
              )}
            </div>
          )}
          {hasTopMarketsContract && !topMarkets && (
            <div className="rounded-control border border-gray-200 p-4">
              <p className="font-semibold">점포당 추정 매출</p>
              <p>자료 없음</p>
            </div>
          )}
          {!hasTopMarketsContract && data.sales.per_store_average && (
            <div className="rounded-control border border-gray-200 p-4">
              <p className="font-semibold">점포당 추정 매출</p>
              <p className="text-xl font-bold break-all">
                {metric(useWeightedMedian ? weighted?.median : data.sales.per_store_average.metric)}
              </p>
              {useWeightedMedian && (
                <p className="text-caption text-gray-600">점포 수 가중 중앙값 · 추정 모델</p>
              )}
              {data.sales.per_store_average.metric && (
                <details className="mt-2 text-caption text-gray-600">
                  <summary className="cursor-pointer">계산 기준</summary>
                  <p>
                    {useWeightedMedian
                      ? '상권별 점포당 평균에 점포 수를 반영한 추정 분포의 중앙값이에요.'
                      : '같은 분기 목록의 매출 합계를 같은 목록의 점포 수 합계로 나눠요.'}
                  </p>
                  <p>점포 수 가중평균(비교): {metric(data.sales.per_store_average.metric)}</p>
                </details>
              )}
              {data.sales.per_store_average.temporal_relation && (
                <p className="text-caption">
                  {periodRelation(data.sales.per_store_average.temporal_relation)}
                </p>
              )}
              <p className="text-caption">
                자료 분기 {quarter(data.sales.per_store_average.primary_quarter)} · 전체{' '}
                {data.sales.per_store_average.listed_item_count}항목 중{' '}
                {data.sales.per_store_average.included_item_count}항목 반영
              </p>
              {!useWeightedMedian && data.sales.per_store_average.metric && (
                <p className="text-caption break-words">
                  매출 합계 {data.sales.per_store_average.total_sales}원 ÷ 점포 수 합계{' '}
                  {data.sales.per_store_average.total_store_count}개
                </p>
              )}
              <SalesDistributionChart
                average={data.sales.per_store_average}
                items={data.sales.items}
              />
              <details>
                <summary>다른 분기·제외 항목 보기</summary>
                {data.sales.per_store_average.groups.map((g) => (
                  <p key={g.source_quarter}>
                    {quarter(g.source_quarter)}: {useWeightedMedian ? '가중 중앙값' : '평균'}{' '}
                    {metric(useWeightedMedian ? g.store_weighted_distribution?.median : g.metric)}
                  </p>
                ))}
                <p>
                  제외 항목 수:{' '}
                  {Object.entries(data.sales.per_store_average.excluded_counts)
                    .map(
                      ([reason, count]) => `${exclusion[reason] ?? '자료 확인 필요'} ${count}항목`,
                    )
                    .join(' / ') || '0'}
                </p>
              </details>
            </div>
          )}
          {data.sales.items?.length ? (
            data.sales.items.map((item) => (
              <div
                className="min-w-0 rounded-control border border-gray-200 p-4"
                key={`${item.market_code}-${item.industry_code}`}
              >
                <p className="font-semibold break-words">
                  {item.market_name} · {relation(item.spatial_relation)}
                </p>
                <p className="text-caption text-gray-600">
                  {item.industry_name} · 자료 분기{' '}
                  {item.source_quarter
                    ? `${item.source_quarter.slice(0, 4)}년 ${item.source_quarter.slice(4)}분기`
                    : '없음'}
                </p>
                <p className="text-caption text-gray-600">
                  {periodRelation(item.temporal_relation)}
                </p>
                <p className="text-xl font-bold break-all">{metric(item.metric)}</p>
                {item.store_reference && (
                  <p className="text-caption">
                    자료상 전체 점포 수{' '}
                    {item.store_reference.total_stores === null
                      ? '자료 없음'
                      : `${item.store_reference.total_stores}개`}{' '}
                    · 해당 상권 점포당 {metric(item.per_store_metric)}
                  </p>
                )}
                {item.average_contribution && (
                  <p className="text-caption">
                    {item.average_contribution.status === 'included'
                      ? topMarkets
                        ? data.sales.items.some(
                            (other) =>
                              other.market_code === item.market_code &&
                              other.source_quarter === item.source_quarter &&
                              other.per_store_metric &&
                              other.market_name !== item.market_name,
                          )
                          ? '자료 정보 불일치로 추정 매출 산정 제외'
                          : topMarkets.markets.some(
                                (m) =>
                                  m.market_code === item.market_code &&
                                  m.industry_codes.includes(item.industry_code),
                              )
                            ? '추정 매출 산정에 반영한 상권'
                            : '점포 수 상위 3개 상권 외 참고자료'
                        : useWeightedMedian
                          ? '추정 분포 반영 대상'
                          : '평균 산정 대상'
                      : item.average_contribution.status === 'different_quarter'
                        ? '다른 자료 분기'
                        : topMarkets
                          ? '추정 매출 산정 제외'
                          : '평균 계산 제외'}
                    {item.average_contribution.reason &&
                      item.average_contribution.status === 'excluded' &&
                      ` · ${exclusion[item.average_contribution.reason] ?? '자료 확인 필요'}`}
                  </p>
                )}
                {!item.metric && <p className="text-caption">{unavailable(item.reason)}</p>}
              </div>
            ))
          ) : (
            <p role="status">{unavailable(data.sales.reason)}</p>
          )}
          <a
            className="text-caption underline"
            href="https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do"
            target="_blank"
            rel="noreferrer"
          >
            출처: 서울시 상권분석서비스 추정매출
          </a>
        </Frame>
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
