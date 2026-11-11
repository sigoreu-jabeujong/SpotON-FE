import { Copy, ExternalLink, Landmark, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES } from '../../constants/diagnosis'
import { DATA_STATUS, INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type {
  MarketJudgement,
  MetricIndicator,
  OfficialRiskIndicator,
  RiskIndicator,
  RiskQuery,
} from '../../types/risk'
import MetaLine from '../common/MetaLine'
import IndicatorArea from './IndicatorArea'
import IndicatorCard from './IndicatorCard'
import { formatIndicatorValue, indicatorGridSpan } from './indicatorFormat'

const T = MESSAGES.summary

type Props = { indicators: RiskIndicator[]; market: MarketJudgement; query: RiskQuery }

/** 서울시 공식 지표 영역 — 공식 폐업률 / 공식 창업위험도(링크 안내) / 상권변화지표 */
export default function OfficialIndicators({ indicators, market, query }: Props) {
  const closure = indicators.find((i): i is MetricIndicator => i.id === 'official_closure_rate')
  const risk = indicators.find((i): i is OfficialRiskIndicator => i.id === 'official_risk')
  const change = indicators.find((i): i is MetricIndicator => i.id === 'market_change')

  const cards = [
    closure && <OfficialClosureCard key="closure" ind={closure} market={market} />,
    risk && <OfficialRiskCard key="risk" ind={risk} market={market} query={query} />,
    change && <MarketChangeCard key="change" ind={change} />,
  ].filter(Boolean)

  return (
    <IndicatorArea type="official" title={T.officialTitle} description={T.officialDescription}>
      <ul className="grid grid-cols-6 gap-3">
        {cards.map((card, i) => (
          <li key={i} className={indicatorGridSpan(i, cards.length)}>
            {card}
          </li>
        ))}
      </ul>
    </IndicatorArea>
  )
}

/** 공식 폐업률 — 공표값 정수 % + 분자/분모 + 분기 + 상권명. 없으면 상태와 사유만 */
function OfficialClosureCard({ ind, market }: { ind: MetricIndicator; market: MarketJudgement }) {
  const value = formatIndicatorValue(ind)
  return (
    <IndicatorCard
      id="official_closure_rate"
      icon={Landmark}
      iconClassName="text-blue-500"
      title={INDICATOR_NAME.official_closure_rate}
      value={value}
      empty={{ status: ind.status, text: ind.reason ?? DATA_STATUS[ind.status].label }}
      details={
        value && (
          <ul className="flex flex-col gap-0.5">
            {ind.numerator != null && ind.denominator != null && (
              <li>{T.fraction(ind.numerator, ind.denominator)}</li>
            )}
            {ind.period && <li>{T.quarter(ind.period)}</li>}
            {market.market_name && <li>{T.market(market.market_name)}</li>}
          </ul>
        )
      }
      status={ind.status}
      source={
        <MetaLine source={ind.source} sourceNames space={ind.space} denominator={ind.denominator} />
      }
    />
  )
}

/**
 * 공식 창업위험도 — 수치·등급을 만들지 않고 서울시 상권분석서비스 링크로 안내.
 * PDF 형식(no_data + source_url)과 BE 보완안(link_only + link + copy_text)을 모두 처리한다.
 */
function OfficialRiskCard({
  ind,
  market,
  query,
}: {
  ind: OfficialRiskIndicator
  market: MarketJudgement
  query: RiskQuery
}) {
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'fail'>('idle')
  // 시연 주소처럼 공표 등급을 수기 인용한 경우(PDF 형식, value 있음)만 값을 보여준다
  const quoted = ind.status !== 'link_only' && ind.value ? ind.value : null
  const link = ind.status === 'link_only' ? ind.link : (ind.source_url ?? null)
  const categoryLabel = CATEGORIES.find((c) => c.id === query.category)?.label
  const marketName =
    ind.status === 'link_only' ? market.market_name : (ind.market_name ?? market.market_name)
  // 상권명을 모르면(상권 밖 등) 이름을 만들어내지 않고 복사 버튼을 숨긴다
  const copyText =
    (ind.status === 'link_only' ? ind.copy_text : null) ??
    (marketName && categoryLabel ? `${marketName} · ${categoryLabel}` : null)

  const copy = async () => {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopyState('done')
    } catch {
      setCopyState('fail')
    }
  }

  return (
    <IndicatorCard
      id="official_risk"
      icon={Landmark}
      iconClassName="text-blue-500"
      title={INDICATOR_NAME.official_risk}
      // 수치·등급을 만들지 않는다: 공표값을 수기 인용한 경우만 값, 아니면 값 자리에 확인 안내
      value={quoted}
      empty={{ status: ind.status, text: T.officialRiskGuide }}
      status={ind.status}
      source={<MetaLine source={ind.source} sourceNames />}
      actions={
        <>
          <div className="flex flex-wrap gap-2">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-caption font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                {T.officialRiskLink}
                <span className="sr-only">{T.officialRiskNewWindow}</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
            {copyText && (
              <button
                type="button"
                onClick={() => void copy()}
                title={T.officialRiskCopyHint}
                className="inline-flex items-center gap-1 rounded-full border border-blue-500 px-3 py-1.5 text-caption font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <Copy className="size-3.5" aria-hidden="true" />
                {T.officialRiskCopy}
              </button>
            )}
          </div>
          {copyText && <p className="mt-2 text-micro text-gray-600">“{copyText}”</p>}
          <p className="text-micro font-semibold text-blue-700" aria-live="polite">
            {copyState === 'done' ? T.copied : copyState === 'fail' ? T.copyFailed : ''}
          </p>
        </>
      }
    />
  )
}

/** 상권변화지표 — 서울시 원본 유형을 그대로 (조건부, 판단 보류면 라벨) */
function MarketChangeCard({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  return (
    <IndicatorCard
      id="market_change"
      icon={Shuffle}
      iconClassName="text-blue-500"
      title={INDICATOR_NAME.market_change}
      value={value}
      empty={{ status: ind.status, text: ind.reason ?? DATA_STATUS[ind.status].label }}
      details={value && <p>{T.marketChangeRaw}</p>}
      status={ind.status}
      source={<MetaLine source={ind.source} sourceNames period={ind.period} space={ind.space} />}
    />
  )
}
