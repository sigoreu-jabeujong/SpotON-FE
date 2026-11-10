import { Copy, ExternalLink, Landmark, Shuffle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CATEGORIES } from '../../constants/diagnosis'
import { INDICATOR_NAME } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import type {
  IndicatorId,
  MarketJudgement,
  MetricIndicator,
  OfficialRiskIndicator,
  RiskIndicator,
  RiskQuery,
} from '../../types/risk'
import MetaLine from '../common/MetaLine'
import StatusLabel from '../common/StatusLabel'
import IndicatorArea from './IndicatorArea'
import { formatIndicatorValue, indicatorAnchorId } from './indicatorFormat'

const T = MESSAGES.summary

type Props = { indicators: RiskIndicator[]; market: MarketJudgement; query: RiskQuery }

/** 서울시 공식 지표 영역 — 공식 폐업률 / 공식 창업위험도(링크 안내) / 상권변화지표 */
export default function OfficialIndicators({ indicators, market, query }: Props) {
  const closure = indicators.find((i): i is MetricIndicator => i.id === 'official_closure_rate')
  const risk = indicators.find((i): i is OfficialRiskIndicator => i.id === 'official_risk')
  const change = indicators.find((i): i is MetricIndicator => i.id === 'market_change')

  return (
    <IndicatorArea type="official" title={T.officialTitle} description={T.officialDescription}>
      <div className="grid grid-cols-3 gap-3">
        {closure && <OfficialClosureCard ind={closure} market={market} />}
        {risk && <OfficialRiskCard ind={risk} market={market} query={query} />}
        {change && <MarketChangeCard ind={change} />}
      </div>
    </IndicatorArea>
  )
}

function CardShell({
  id,
  icon: Icon,
  title,
  children,
}: {
  /** 지표 id — AI 해석 근거 칩에서 이 카드로 이동할 때 쓴다 */
  id: IndicatorId
  icon: typeof Landmark
  title: string
  children: ReactNode
}) {
  return (
    <article
      id={indicatorAnchorId(id)}
      tabIndex={-1}
      className="flex scroll-mt-8 flex-col gap-2 rounded-control border border-gray-300 bg-gray-0 p-5 focus:outline-2 focus:outline-blue-500"
    >
      <h3 className="flex items-center gap-1.5 text-body font-bold text-gray-900">
        <Icon className="size-4 text-blue-500" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </article>
  )
}

/** 공식 폐업률 — 공표값 정수 % + 분자/분모 + 분기 + 상권명. 없으면 상태와 사유만 */
function OfficialClosureCard({ ind, market }: { ind: MetricIndicator; market: MarketJudgement }) {
  const value = formatIndicatorValue(ind)
  return (
    <CardShell
      id="official_closure_rate"
      icon={Landmark}
      title={INDICATOR_NAME.official_closure_rate}
    >
      {value ? (
        <p className="text-title font-bold text-gray-900">{value}</p>
      ) : (
        <StatusLabel status={ind.status} reason={ind.reason} />
      )}
      {value && (
        <ul className="text-caption text-gray-600">
          {ind.numerator != null && ind.denominator != null && (
            <li>{T.fraction(ind.numerator, ind.denominator)}</li>
          )}
          {ind.period && <li>{T.quarter(ind.period)}</li>}
          {market.market_name && <li>{T.market(market.market_name)}</li>}
        </ul>
      )}
      {value && <StatusLabel status={ind.status} />}
      <MetaLine source={ind.source} sourceNames space={ind.space} denominator={ind.denominator} />
    </CardShell>
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
    <CardShell id="official_risk" icon={Landmark} title={INDICATOR_NAME.official_risk}>
      {quoted ? (
        <p className="text-title font-bold text-gray-900">{quoted}</p>
      ) : (
        <>
          <StatusLabel status={ind.status} />
          <p className="text-caption text-gray-900">{T.officialRiskGuide}</p>
        </>
      )}
      <div className="mt-1 flex flex-wrap gap-2">
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
      {copyText && <p className="text-micro text-gray-600">“{copyText}”</p>}
      <p className="text-micro font-semibold text-blue-700" aria-live="polite">
        {copyState === 'done' ? T.copied : copyState === 'fail' ? T.copyFailed : ''}
      </p>
      <MetaLine source={ind.source} sourceNames />
    </CardShell>
  )
}

/** 상권변화지표 — 서울시 원본 유형을 그대로 (조건부, 판단 보류면 라벨) */
function MarketChangeCard({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  return (
    <CardShell id="market_change" icon={Shuffle} title={INDICATOR_NAME.market_change}>
      {value ? (
        <>
          <p className="text-title font-bold text-gray-900">{value}</p>
          <p className="text-caption text-gray-600">{T.marketChangeRaw}</p>
          <StatusLabel status={ind.status} />
        </>
      ) : (
        <StatusLabel status={ind.status} reason={ind.reason} />
      )}
      <MetaLine source={ind.source} sourceNames period={ind.period} space={ind.space} />
    </CardShell>
  )
}
