import { ArrowLeft, Printer } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router'
import Badge from '../components/common/Badge'
import ErrorState from '../components/common/ErrorState'
import IndicatorTypeLabel from '../components/common/IndicatorTypeLabel'
import LoadingState from '../components/common/LoadingState'
import StatusLabel from '../components/common/StatusLabel'
import {
  formatIndicatorValue,
  formatSeoulAvg,
  indicatorReasonText,
} from '../components/summary/indicatorFormat'
import { CATEGORIES, RESTAURANT_SUB_CATEGORIES } from '../constants/diagnosis'
import {
  FRANCHISE_LABEL,
  INDICATOR_NAME,
  INDICATOR_TYPE,
  LOCATION_MATCH_LABEL,
  STORE_STATUS_LABEL,
  SUB_CATEGORY_LABEL,
} from '../constants/labels'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { parseSourceIds, SOURCES } from '../constants/sources'
import { isDiagnosisReady, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { useReportData } from '../hooks/useReportData'
import type { ApiMeta } from '../types/api'
import type { MetricIndicator, OfficialRiskIndicator, RiskIndicator } from '../types/risk'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  formatCount,
  formatDataBaseline,
  formatDate,
  formatKrwApprox,
  formatOperatingMonths,
  formatPeriod,
  formatSpace,
  formatYearMonthKo,
} from '../utils/format'
import { cn } from '../utils/cn'
import { sortHistoryRecentFirst } from '../utils/history'
import { storeCloseDate, storeName, storeOpenDate, storePeriod } from '../utils/storeDisplay'
import { storeKey } from '../utils/storeKey'

const T = MESSAGES.report
const HISTORY_ROWS = 8
const OFFICIAL_IDS = ['official_closure_rate', 'official_risk', 'market_change'] as const
const REFERENCE_IDS = [
  'closure_rate_12m',
  'survival_rate_1y',
  'survival_rate_3y',
  'competitor_count',
  'day_night_ratio',
] as const

/**
 * 인쇄용 진단서 — window.print()로 "PDF로 저장". 별도 API 없음.
 * 결과 화면과 같은 쿼리 캐시를 쓰고, 값은 형식 변환만 한다 (A4 2장 이내 목표).
 */
export default function ReportPage() {
  usePageTitle(MESSAGES.titles.report)
  const data = useReportData()
  const [printFailed, setPrintFailed] = useState(false)
  const { query } = data

  if (!isDiagnosisReady(query))
    return <Navigate to={{ pathname: ROUTES.input, search: toDiagnosisSearch(query) }} replace />

  const print = () => {
    setPrintFailed(false)
    try {
      window.print()
    } catch {
      setPrintFailed(true)
    }
  }

  const metas = [
    data.history.data?.meta,
    data.nearby.data?.meta,
    data.activity.data?.meta,
    data.risk.data?.meta,
  ]
  const isDemo = metas.some((m) => m?.is_demo)

  return (
    <div className="min-h-full bg-gray-100 print:bg-gray-0">
      {/* 화면 전용 도구 막대 (인쇄 시 숨김) */}
      <div className="sticky top-0 z-10 border-b border-gray-300 bg-gray-0 print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to={{ pathname: ROUTES.share, search: toDiagnosisSearch(query) }}
            className="flex items-center gap-1 text-caption font-semibold text-gray-900 hover:text-blue-700"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {T.back}
          </Link>
          <p className="text-micro text-gray-600">{T.toolbarHint}</p>
          <button
            type="button"
            onClick={print}
            disabled={data.loading}
            className="flex h-10 items-center gap-1.5 rounded-full bg-blue-500 px-5 text-caption font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:bg-gray-300"
          >
            <Printer className="size-4" aria-hidden="true" />
            {T.print}
          </button>
        </div>
        {printFailed && (
          <p role="alert" className="pb-3 text-center text-caption text-danger">
            {T.printFailed}
          </p>
        )}
      </div>

      <main className="report mx-auto my-6 max-w-[210mm] bg-gray-0 px-[12mm] py-[10mm] text-[11px] leading-snug text-gray-900 shadow-card print:my-0 print:max-w-none print:p-0 print:shadow-none">
        {data.loading ? (
          <LoadingState message={T.loading} />
        ) : (
          <>
            {data.failed.length > 0 && (
              <div className="print:hidden">
                <ErrorState message={T.partialError} onRetry={data.retry} />
              </div>
            )}
            <ReportHeader isDemo={isDemo} data={data} />
            <HistoryBlock data={data} />
            <NearbyBlock data={data} />
            <ActivityBlock data={data} />
            <IndicatorsBlock indicators={data.risk.data?.data.indicators ?? []} data={data} />
            <AiBlock data={data} />
            <FooterBlock metas={metas} isDemo={isDemo} />
          </>
        )}
      </main>
    </div>
  )
}

type Data = ReturnType<typeof useReportData>

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-3 break-inside-avoid">
      <h2 className="mb-1 border-b border-gray-900 pb-0.5 text-[12.5px] font-bold">{title}</h2>
      {children}
    </section>
  )
}

function ReportHeader({ isDemo, data }: { isDemo: boolean; data: Data }) {
  const { query } = data
  const category = CATEGORIES.find((c) => c.id === query.category)?.label ?? ''
  const subs = RESTAURANT_SUB_CATEGORIES.filter((s) => query.subCategories.includes(s.id))
    .map((s) => s.label)
    .join('·')
  const rows: [string, string][] = [
    [T.address, query.address],
    [T.category, subs ? `${category} (${subs})` : category],
    [T.radius, `${query.radius.toLocaleString('ko-KR')}m`],
    [T.asOf, formatYearMonthKo(query.asOf) ?? T.asOfCurrent],
  ]
  return (
    <header className="break-inside-avoid">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-extrabold">
          SPOT<span className="text-blue-500">:ON</span>{' '}
          <span className="text-[14px] font-bold">{T.title}</span>
        </h1>
        {isDemo && <Badge tone="orange">{MESSAGES.meta.demo}</Badge>}
      </div>
      <dl className="mt-2 grid grid-cols-4 gap-x-3 rounded border border-gray-300 px-3 py-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[9.5px] text-gray-600">{k}</dt>
            <dd className="font-semibold break-keep">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

function HistoryBlock({ data }: { data: Data }) {
  const h = data.history.data?.data
  if (!h) return null
  const stores = h.stores ?? []
  // 화면 이력 표와 같은 정렬·결측 표시 (utils/history)
  const rows = sortHistoryRecentFirst(stores)
  return (
    <Block title={T.historyTitle}>
      <p className="mb-1">
        {MESSAGES.history.summary(h.total)}
        {stores.length > HISTORY_ROWS && (
          <span className="text-gray-600"> ({T.historyMore(HISTORY_ROWS, stores.length)})</span>
        )}
      </p>
      {rows.length === 0 ? (
        <p className="text-gray-600">{h.message}</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{MESSAGES.history.caption}</caption>
          <thead>
            <tr className="bg-gray-100">
              {Object.values(MESSAGES.history.columns)
                .filter((c) => c !== MESSAGES.history.columns.no)
                .map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="border border-gray-300 px-1.5 py-0.5 font-semibold"
                  >
                    {c}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, HISTORY_ROWS).map((s) => {
              const period = storePeriod(s)
              return (
                <tr key={storeKey(s.source, s.license_no)} className="break-inside-avoid">
                  <Td>{storeName(s).text}</Td>
                  {/* 기간 사유가 길어져도 업종(2~3글자)은 한 줄로 */}
                  <Td nowrap>{SUB_CATEGORY_LABEL[s.sub_category]}</Td>
                  <Td>{storeOpenDate(s).text}</Td>
                  <Td>{storeCloseDate(s, s.store_status)?.text ?? '—'}</Td>
                  <Td>
                    {period.text}
                    {period.reason && <span className="block text-gray-600">{period.reason}</span>}
                  </Td>
                  <Td>{STORE_STATUS_LABEL[s.store_status]}</Td>
                  <Td>{LOCATION_MATCH_LABEL[s.location_match]}</Td>
                  <Td>{FRANCHISE_LABEL[s.franchise]}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Block>
  )
}

function Td({ children, nowrap }: { children: ReactNode; nowrap?: boolean }) {
  return (
    <td
      className={cn(
        'border border-gray-300 px-1.5 py-0.5 align-top',
        nowrap && 'whitespace-nowrap',
      )}
    >
      {children}
    </td>
  )
}

function NearbyBlock({ data }: { data: Data }) {
  const n = data.nearby.data?.data
  const s = data.snapshot.data?.data
  if (!n && !s) return null
  return (
    <Block title={T.nearbyTitle}>
      {n && (
        <p>
          {T.nearbyCount} <b>{formatCount(n.count, MESSAGES.units.store)}</b> (
          {T.nearbyBasis(formatSpace(`radius_${n.radius_m}m`) ?? '', formatDate(n.as_of) ?? '')})
          {n.excluded_no_coord > 0 && (
            <span className="text-gray-600">
              {' '}
              · {MESSAGES.nearby.excludedNoCoord(n.excluded_no_coord)}
            </span>
          )}
        </p>
      )}
      {s && (
        <p className="mt-0.5">
          <b>{s.summary_text}</b>
          <span className="text-gray-600">
            {' '}
            ({MESSAGES.snapshot.cards.total} {s.total_at_as_of} ·{' '}
            {MESSAGES.snapshot.cards.stillOpen} {s.still_open} ·{' '}
            {MESSAGES.snapshot.cards.closedSince} {s.closed_since} · {MESSAGES.snapshot.cards.other}{' '}
            {s.other})
          </span>
        </p>
      )}
    </Block>
  )
}

function ActivityBlock({ data }: { data: Data }) {
  const a = data.activity.data?.data
  if (!a) return null
  const A = MESSAGES.activity
  return (
    <Block title={T.activityTitle}>
      <div className="grid grid-cols-2 gap-x-4">
        <ul className="list-inside list-disc">
          <li>
            {A.opened12m} <b>{formatCount(a.recent_12m.opened, MESSAGES.units.store)}</b> ·{' '}
            {A.closed12m} <b>{formatCount(a.recent_12m.closed, MESSAGES.units.store)}</b> (
            {formatPeriod(a.recent_12m.period)})
          </li>
          <li>
            {A.avgPeriod}:{' '}
            {(a.by_sub_category ?? [])
              .map(
                (s) =>
                  `${SUB_CATEGORY_LABEL[s.sub_category]} ${formatOperatingMonths(s.avg_operating_months) ?? T.infoMissing}`,
              )
              .join(' · ')}
          </li>
          <li>
            {A.salesTitle}:{' '}
            {a.sales
              ? (a.sales.markets ?? [])
                  .map((m) => `${m.market_name} ${formatKrwApprox(m.est_sales)}(${A.estimate})`)
                  .join(' · ')
              : T.noData}
          </li>
          <li>
            {A.livingTitle}:{' '}
            {a.living_pop
              ? T.livingSummary(
                  A.people(a.living_pop.total),
                  A.estimate,
                  formatDate(a.living_pop.date) ?? '',
                  a.living_pop.missing_grid_count,
                )
              : T.noData}
          </li>
        </ul>
        <table className="w-full border-collapse text-center">
          <caption className="text-left text-gray-600">{A.trendTitle}</caption>
          <thead>
            <tr className="bg-gray-100">
              <th scope="col" className="border border-gray-300 px-1 py-0.5">
                {A.trendYearHeader}
              </th>
              {(a.yearly_trend ?? []).map((y) => (
                <th key={y.year} scope="col" className="border border-gray-300 px-1 py-0.5">
                  {y.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="border border-gray-300 px-1 py-0.5">
                {A.trendOpened}
              </th>
              {(a.yearly_trend ?? []).map((y) => (
                <Td key={y.year}>{y.opened}</Td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="border border-gray-300 px-1 py-0.5">
                {A.trendClosed}
              </th>
              {(a.yearly_trend ?? []).map((y) => (
                <Td key={y.year}>{y.closed}</Td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-0.5 text-[9.5px] text-gray-600">
        {A.salesNotice} · {A.livingNotice}
      </p>
    </Block>
  )
}

function IndicatorsBlock({ indicators, data }: { indicators: RiskIndicator[]; data: Data }) {
  const market = data.risk.data?.data.market
  if (!market) return null
  const S = MESSAGES.summary
  const pick = (ids: readonly string[]) =>
    ids.map((id) => indicators.find((i) => i.id === id)).filter((i): i is RiskIndicator => !!i)
  return (
    <Block title={T.indicatorsTitle}>
      <p className="mb-1">
        {/* 확인 중(unverified)은 상권 안·밖으로 확정하지 않는다 (화면 MarketCard와 같은 기준) */}
        {market.status === 'unverified'
          ? S.unverified
          : market.status === 'in_market' && market.market_name
            ? S.inMarket(market.market_name, market.market_type)
            : S.outside}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <IndicatorTable type="official" rows={pick(OFFICIAL_IDS)} />
        <IndicatorTable type="reference" rows={pick(REFERENCE_IDS)} />
      </div>
    </Block>
  )
}

function IndicatorTable({ type, rows }: { type: 'official' | 'reference'; rows: RiskIndicator[] }) {
  return (
    <div className="break-inside-avoid">
      <IndicatorTypeLabel type={type} className="mb-1" />
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{INDICATOR_TYPE[type]}</caption>
        <thead>
          <tr className="bg-gray-100">
            <th scope="col" className="border border-gray-300 px-1.5 py-0.5">
              {T.colName}
            </th>
            <th scope="col" className="border border-gray-300 px-1.5 py-0.5">
              {T.colValue}
            </th>
            <th scope="col" className="border border-gray-300 px-1.5 py-0.5">
              {T.colBasis}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ind) => (
            <tr key={ind.id} className="break-inside-avoid">
              <Td>{INDICATOR_NAME[ind.id]}</Td>
              <Td>
                {ind.id === 'official_risk' ? (
                  <OfficialRiskText ind={ind as OfficialRiskIndicator} />
                ) : (
                  <MetricText ind={ind as MetricIndicator} />
                )}
              </Td>
              <Td>
                {ind.id === 'official_risk'
                  ? '—'
                  : [
                      formatPeriod((ind as MetricIndicator).period),
                      formatSpace((ind as MetricIndicator).space),
                      (ind as MetricIndicator).denominator != null
                        ? T.sample((ind as MetricIndicator).denominator ?? 0)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MetricText({ ind }: { ind: MetricIndicator }) {
  const value = formatIndicatorValue(ind)
  const seoul = formatSeoulAvg(ind)
  return (
    <span className="flex flex-wrap items-center gap-1">
      {value && <b>{value}</b>}
      <StatusLabel status={ind.status} reason={value ? null : indicatorReasonText(ind.reason)} />
      {ind.unit === '%' && (seoul || ind.seoul_avg_reason) && (
        <span className="text-gray-600">
          ({seoul ? T.seoulAvg(seoul) : indicatorReasonText(ind.seoul_avg_reason)})
        </span>
      )}
    </span>
  )
}

function OfficialRiskText({ ind }: { ind: OfficialRiskIndicator }) {
  const link = ind.status === 'link_only' ? ind.link : ind.source_url
  return (
    <span>
      {MESSAGES.summary.officialRiskGuide}
      {link && <span className="block text-[9.5px] break-all text-gray-600">{link}</span>}
    </span>
  )
}

function AiBlock({ data }: { data: Data }) {
  const ai = data.ai
  const A = MESSAGES.ai
  return (
    <Block title={T.aiTitle}>
      {!ai ? (
        <p className="text-gray-600">{T.aiNotRequested}</p>
      ) : (
        <div className="rounded border border-blue-500 px-2 py-1">
          <Badge tone="blue">{ai.label}</Badge>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
            <AiList
              title={A.sections.official}
              items={(ai.official_values ?? []).map((v) => v.text)}
            />
            <AiList
              title={A.sections.missing}
              items={(ai.missing_data ?? []).map(
                (v) => `${v.text} — ${indicatorReasonText(v.reason) ?? ''}`,
              )}
            />
            <AiList title={A.sections.favorable} items={(ai.favorable ?? []).map((v) => v.text)} />
            <AiList
              title={A.sections.unfavorable}
              items={(ai.unfavorable ?? []).map((v) => v.text)}
            />
          </div>
          <AiList
            title={A.sections.checklist}
            items={(ai.checklist ?? []).map((c) => `□ ${c.item} (${c.why})`)}
            plain
          />
          <p className="mt-0.5 text-[9.5px] text-gray-600">{A.notice}</p>
        </div>
      )}
    </Block>
  )
}

function AiList({ title, items, plain }: { title: string; items: string[]; plain?: boolean }) {
  return (
    <div className="break-inside-avoid">
      <p className="font-bold">{title}</p>
      <ul className={plain ? '' : 'list-inside list-disc'}>
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

function FooterBlock({
  metas,
  isDemo,
}: {
  metas: (ApiMeta | null | undefined)[]
  isDemo: boolean
}) {
  const ids = [...new Set(metas.flatMap((m) => parseSourceIds(m?.source)))].sort(
    (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
  )
  const baseline = formatDataBaseline(metas.find((m) => m?.data_updated_at))
  return (
    <Block title={T.footerTitle}>
      <ul className="list-inside list-disc text-[9.5px] text-gray-600">
        <li>{T.sources(ids.map((id) => `${SOURCES[id]?.name ?? id}(${id})`).join(', '))}</li>
        {baseline && <li>{baseline}</li>}
        <li>{MESSAGES.disclaimer}</li>
        <li>{MESSAGES.history.notices[1]}</li>
        <li>{MESSAGES.layout.ageNotice}</li>
        {isDemo && <li>{T.demoNotice}</li>}
      </ul>
      <p className="mt-1 text-right text-[9.5px] text-gray-600">{T.brand}</p>
    </Block>
  )
}
