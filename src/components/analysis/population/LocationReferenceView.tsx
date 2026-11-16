import type { ReactNode } from 'react'
import type {
  AdminReferenceItem,
  LocationReference,
  ReferenceNumber,
} from '../../../types/locationReference'
import SubTitle from '../../common/SubTitle'

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
  return value?.display ? `${value.display}${value.rounded ? ' (표시 반올림)' : ''}` : '자료 없음'
}

function Frame({
  title,
  children,
  notice,
}: {
  title: string
  children: ReactNode
  notice: string
}) {
  return (
    <section className="flex min-w-0 break-inside-avoid flex-col gap-3">
      <SubTitle>{title}</SubTitle>
      {children}
      <p className="text-caption text-gray-600">{notice}</p>
    </section>
  )
}

function Place({ item }: { item: AdminReferenceItem }) {
  return (
    <>
      <p className="font-semibold break-words">
        {item.area_name} · {relation(item.spatial_relation)}
      </p>
      <p className="text-caption text-gray-600">
        관측일 {item.observation_date} · {periodRelation(item.temporal_relation)}
      </p>
    </>
  )
}

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
        각 구역 단위의 수치이며 반경 비율로 나누거나 구역끼리 합산하지 않아요. 기존 AI 해석에
        반영되는 값은 아니에요. 가맹·브랜드·면적 등 점포 조건으로 이 참고자료의 수치를 거르지
        않아요.
      </p>
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <Frame
          title="인근 상권 추정매출"
          notice="상권 단위 원자료 금액으로, 이 자리 점포의 실제 매출이 아니에요. 매출 집계 기간과 경계 적용 시점은 확인 중이며 월매출·분기매출로 환산하지 않아요."
        >
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
        <Frame
          title="생활인구 (행정동·내국인)"
          notice="관측일 24시간 생활인구의 시간당 평균이에요. 외국인을 포함한 전체 생활인구, 일일 순방문객 수나 선택 반경 안의 인구가 아니에요."
        >
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
              </div>
            ))
          ) : (
            <p role="status">{unavailable(data.living_population.reason)}</p>
          )}
          <a
            className="text-caption underline"
            href="https://data.seoul.go.kr/dataList/OA-23016/S/1/datasetView.do"
            target="_blank"
            rel="noreferrer"
          >
            출처: 서울시 행정동 내국인 생활인구
          </a>
        </Frame>
      </div>
      <Frame
        title="주야간 생활인구 비교 (행정동·내국인)"
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
