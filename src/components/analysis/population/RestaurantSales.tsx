import type {
  AggregatedMarket,
  LocationReference,
  ReferenceNumber,
} from '../../../types/locationReference'

const labels: Record<string, string> = {
  CS100001: '한식',
  CS100002: '중식',
  CS100003: '일식',
  CS100004: '양식',
}
const reasons: Record<string, string> = {
  mapping_conflict: '자료 정보 불일치',
  store_mapping_conflict: '점포 수 자료 정보 불일치',
  market_name_conflict: '상권명 정보 불일치',
  store_row_missing: '점포 수 자료 없음',
  source_value_null: '매출 자료 없음',
  no_source_rows: '원자료 없음',
  no_data_in_analysis_period: '선택한 분석 기간의 자료 없음',
  different_quarter: '다른 자료 분기',
  zero_store_count: '점포 수 0개',
  zero_store_count_with_sales: '점포 수 0개·매출 존재',
  source_not_loaded: '매출 원자료가 연결되지 않았어요.',
  scope_too_large: '조회 범위가 커서 자료를 표시할 수 없어요.',
  no_spatial_overlap: '이 위치나 반경과 겹치는 공개 상권이 없어요.',
}
const amount = (n: ReferenceNumber | null | undefined) =>
  n?.display?.replace(/\/점포$/, '') ?? '자료 없음'
const integer = (n: string | null) =>
  n !== null && /^(0|[1-9][0-9]*)$/.test(n) ? BigInt(n).toLocaleString('ko-KR') : '자료 없음'
const quarter = (q: string | null) => (q ? `${q.slice(0, 4)}년 ${q.slice(4)}분기` : '자료 없음')

export default function RestaurantSales({ data }: { data: LocationReference }) {
  const top =
    data.sales.top_markets_estimate?.method === 'top3_markets_by_store_count_v1'
      ? data.sales.top_markets_estimate
      : null
  const projection = data.sales.market_aggregation
  const group =
    projection?.rule_version === 'restaurant_market_rollup_v1' &&
    projection.category === 'restaurant' &&
    top &&
    projection.selected_market_codes.join(',') === top.markets.map((m) => m.market_code).join(',')
      ? projection
      : null
  const selected = group?.items.filter((m) => m.selected_for_estimate) ?? []
  const other = group?.items.filter((m) => !m.selected_for_estimate) ?? []
  const partial = selected.some((m) => m.status === 'partial')
  const emptyReasons = [
    ...new Set(
      (group?.items ?? []).flatMap((m) =>
        m.unavailable_industries.map(
          (i) =>
            `${labels[i.industry_code] ?? i.industry_code}: ${reasons[i.reason] ?? '자료 없음'}`,
        ),
      ),
    ),
  ].slice(0, 4)
  function raw(code?: string) {
    return (
      <details className="mt-2 text-caption print:hidden">
        <summary className="min-h-11 cursor-pointer py-2">업종별 원자료</summary>
        {(data.sales.items ?? [])
          .filter((i) => !code || i.market_code === code)
          .map((i) => (
            <p className="mb-2 break-words" key={`${i.market_code}-${i.industry_code}`}>
              {!code && `${i.market_name} · `}
              {i.industry_name} · {quarter(i.source_quarter)} · {amount(i.metric)}
              {i.store_reference?.total_stores != null &&
                ` · 점포 ${integer(i.store_reference.total_stores)}개`}
            </p>
          ))}
      </details>
    )
  }
  function market(m: AggregatedMarket) {
    return (
      <section
        key={m.market_code}
        data-testid={m.selected_for_estimate ? 'restaurant-market' : 'restaurant-market-reference'}
        className="min-w-0 break-inside-avoid rounded-control border border-gray-300 p-3"
      >
        <h4 className="font-semibold break-words">
          {m.market_name ?? `자료 정보 불일치 (${m.market_code})`}
        </h4>
        <p className="text-caption text-gray-600">
          {m.spatial_relation === 'contains_point'
            ? '검색 위치 포함'
            : '선택 반경과 겹침 (대체값 아님)'}{' '}
          · 자료 분기 {quarter(m.source_quarter)}
        </p>
        <p className="mt-2 text-caption text-gray-600">
          {m.status === 'partial' ? '유효한 선택 업종 합산 매출' : '선택 업종 합산 매출'}
        </p>
        <p className="text-lg font-bold break-all">
          {m.total_sales === null ? '자료 없음' : `${integer(m.total_sales)}원`}
        </p>
        {m.per_store_metric && (
          <p className="text-caption">
            점포 수 합계 {integer(m.total_store_count)}개 · 해당 상권 점포당{' '}
            {amount(m.per_store_metric)}
          </p>
        )}
        {m.status === 'partial' && (
          <p className="mt-1 text-caption text-orange-700">
            선택 {group?.requested_industries.length}종 중 {m.included_industry_codes.length}종 합산
          </p>
        )}
        {m.unavailable_industries.length > 0 && (
          <p className="text-caption text-gray-600">
            합산 제외:{' '}
            {m.unavailable_industries
              .map(
                (i) =>
                  `${labels[i.industry_code] ?? i.industry_code} (${reasons[i.reason] ?? '자료 없음'}${i.reason === 'different_quarter' ? ` · ${quarter(i.source_quarter)}` : ''})`,
              )
              .join(' · ')}
          </p>
        )}
        {raw(m.market_code)}
      </section>
    )
  }
  return (
    <div className="flex min-w-0 flex-col gap-3" data-testid="restaurant-sales">
      <div data-testid="top-markets-estimate">
        <p className="text-caption font-semibold text-gray-600">점포당 추정 매출</p>
        <p className="text-title font-bold break-all">{amount(top?.metric)}</p>
        {top?.metric && (
          <>
            <p className="mt-2 text-caption break-words text-gray-600">
              {top.markets.map((m) => m.market_name).join(' · ')} 상권의 매출액을 토대로
              추정했습니다.
            </p>
            <p className="text-caption text-gray-600">
              자료 분기 {quarter(top.source_quarter)} · 점포 수 상위 {top.selected_market_count}개
              상권
            </p>
            {top.selected_market_count < 3 && (
              <p className="text-caption">
                유효한 상권이 3곳보다 적어 {top.selected_market_count}곳의 자료를 사용했어요.
              </p>
            )}
            <details className="mt-2 text-caption">
              <summary className="min-h-11 cursor-pointer py-2">계산 기준</summary>
              <p className="break-words">
                선정 상권 매출 합계 {integer(top.total_sales)}원 ÷ 점포 수 합계{' '}
                {integer(top.total_store_count)}개
              </p>
            </details>
          </>
        )}
        {group && (
          <p className="text-caption">
            선택 업종:{' '}
            {group.requested_industries
              .map((i) => labels[i.industry_code] ?? i.industry_name)
              .join(' · ')}{' '}
            합산
          </p>
        )}
        {partial && (
          <p className="mt-1 text-caption text-orange-700">
            일부 상권은 선택 업종 일부만 합산했어요.
          </p>
        )}
      </div>
      {!group ? (
        <>
          <p role="status" className="text-caption">
            상권별 합산 자료를 현재 제공할 수 없어요.
          </p>
          {raw()}
        </>
      ) : (
        <>
          {selected.length === 0 && (
            <p role="status" className="text-caption">
              {reasons[group.reason ?? ''] ??
                '같은 분기의 매출과 점포 수를 함께 확인할 수 있는 상권이 없어요.'}
            </p>
          )}
          {selected.length === 0 && emptyReasons.length > 0 && (
            <p className="text-caption text-gray-600">{emptyReasons.join(' · ')}</p>
          )}
          {selected.map(market)}
          {other.length > 0 && (
            <details className="text-caption print:hidden">
              <summary className="min-h-11 cursor-pointer py-2">
                나머지 상권 보기 ({other.length}곳)
              </summary>
              <div className="flex flex-col gap-3">{other.map(market)}</div>
            </details>
          )}
        </>
      )}
      <a
        className="text-caption text-gray-600 underline"
        href="https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do"
        target="_blank"
        rel="noreferrer"
      >
        출처: 서울시 상권분석서비스 추정매출
      </a>
    </div>
  )
}
