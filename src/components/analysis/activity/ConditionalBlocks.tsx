import { Info, Users, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type { ApiMeta } from '../../../types/api'
import type { LivingPopulation, MarketActivity, MarketSales } from '../../../types/market'
import { formatDate, formatKrwApprox } from '../../../utils/format'
import Badge from '../../common/Badge'
import InfoBox from '../../common/InfoBox'
import SourceLine from '../../common/SourceLine'
import SubTitle from '../../common/SubTitle'
import { optionalDataState, type OptionalDataState } from './optionalData'

const T = MESSAGES.activity

type Props = { activity: MarketActivity; meta: ApiMeta | null | undefined }

/**
 * 조건부 지표 — 추정매출(상권 단위)과 생활인구(250m 격자 단위).
 * 집계 단위가 달라 블록과 메타 줄을 따로 두고, 값이 없으면 숫자 대신 상태 카드만 보여준다
 * ("자료 확인 중" + 사유 / "자료 없음" — optionalData.ts).
 */
export default function ConditionalBlocks({ activity, meta }: Props) {
  const sales = optionalDataState(activity, meta, 'sales')
  const living = optionalDataState(activity, meta, 'living_pop')
  return (
    <div className="grid grid-cols-2 gap-6">
      <Block title={T.salesTitle} icon={Wallet} notice={T.salesNotice}>
        {sales.kind === 'data' && activity.sales ? (
          <SalesBody sales={activity.sales} />
        ) : (
          <MissingCard state={sales} />
        )}
      </Block>
      <Block title={T.livingTitle} icon={Users} notice={T.livingNotice}>
        {living.kind === 'data' && activity.living_pop ? (
          <LivingBody living={activity.living_pop} />
        ) : (
          <MissingCard state={living} />
        )}
      </Block>
    </div>
  )
}

function Block({
  title,
  icon: Icon,
  notice,
  children,
}: {
  title: string
  icon: typeof Wallet
  notice: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <SubTitle>
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-4 text-blue-500" aria-hidden="true" />
          {title}
        </span>
      </SubTitle>
      {children}
      <p className="flex items-start gap-1.5 text-caption text-gray-600">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {notice}
      </p>
    </div>
  )
}

/** 상권별 카드 — 상권끼리 합산하지 않는다 */
function SalesBody({ sales }: { sales: MarketSales }) {
  return (
    <>
      <ul className="flex flex-col gap-2">
        {sales.markets.map((m) => (
          <li
            key={m.market_code}
            className="flex items-center justify-between gap-3 rounded-control border border-gray-300 bg-gray-0 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-body font-semibold text-gray-900">{m.market_name}</p>
              <p className="text-micro text-gray-600">{T.salesQuarter(m.quarter)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone="gray">{T.estimate}</Badge>
              <span className="text-subtitle font-bold text-gray-900">
                {formatKrwApprox(m.est_sales)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <SourceLine
        source={sales.meta?.source}
        asOf={sales.meta?.as_of}
        space={sales.meta?.space}
        denominator={sales.meta?.denominator}
      />
    </>
  )
}

function LivingBody({ living }: { living: LivingPopulation }) {
  const rows: [string, string | null][] = [
    [T.livingTotal, T.people(living.total)],
    [T.livingDate, formatDate(living.date)],
    [T.livingGrids, T.grids(living.grid_count)],
    [T.livingMissing, T.grids(living.missing_grid_count)],
  ]
  return (
    <>
      <div className="rounded-control border border-gray-300 bg-gray-0 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="gray">{T.estimate}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-micro text-gray-600">{k}</dt>
              <dd className="text-subtitle font-bold text-gray-900">{v ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
      <SourceLine
        source={living.meta?.source}
        asOf={living.meta?.as_of}
        space={living.meta?.space}
        denominator={living.meta?.denominator}
      />
    </>
  )
}

/** 값이 없을 때 — 자료 확인 중(사유) / 자료 없음 (결과 화면 공통 안내 상자 모양) */
function MissingCard({ state }: { state: OptionalDataState }) {
  if (state.kind === 'data') return null
  return <InfoBox showTitle title={state.label} description={state.reason} />
}
