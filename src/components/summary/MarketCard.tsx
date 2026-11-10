import { Info, MapPinned, MapPinOff } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import type { MarketJudgement } from '../../types/risk'
import Badge from '../common/Badge'
import SubTitle from '../common/SubTitle'

const T = MESSAGES.summary

/** 상권 판정 — 상권 안이면 상권명·유형(+관광특구), 밖이면 반경에 걸친 상권 목록(참고) */
export default function MarketCard({ market }: { market: MarketJudgement }) {
  const inside = market.status === 'in_market' && market.market_name
  return (
    <div className="flex flex-col gap-3">
      <SubTitle>{T.marketTitle}</SubTitle>
      <div className="flex items-start gap-3 rounded-control border border-gray-300 bg-gray-0 px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
          {inside ? (
            <MapPinned className="size-5" aria-hidden="true" />
          ) : (
            <MapPinOff className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          {inside ? (
            <>
              <p className="text-subtitle font-bold text-gray-900">
                {T.inMarket(market.market_name ?? '', market.market_type)}
              </p>
              {market.also_in.length > 0 && (
                <p className="mt-1 text-caption text-gray-600">
                  {T.alsoIn(market.also_in.map((m) => m.market_name).join(', '))}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-subtitle font-bold text-gray-900">{T.outside}</p>
              <p className="mt-1 flex items-start gap-1.5 text-caption text-gray-600">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {T.outsideHint}
              </p>
              {market.nearby_markets.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-micro font-semibold text-gray-600">{T.nearbyMarkets}</span>
                  {market.nearby_markets.map((m) => (
                    <Badge key={m.market_code} tone="gray">
                      {m.market_name}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
