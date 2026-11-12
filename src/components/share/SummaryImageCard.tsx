import { forwardRef, type CSSProperties } from 'react'
import { CATEGORIES, FRANCHISE_OPTIONS } from '../../constants/diagnosis'
import { DATA_STATUS } from '../../constants/labels'
import { MESSAGES } from '../../constants/messages'
import { parseSourceIds, SOURCES } from '../../constants/sources'
import type { useReportData } from '../../hooks/useReportData'
import type { MetricIndicator } from '../../types/risk'
import {
  formatCount,
  formatDataBaseline,
  formatPeriod,
  formatYearMonthKo,
} from '../../utils/format'
import { formatIndicatorValue } from '../summary/indicatorFormat'

/**
 * 요약 이미지(1080×1350 PNG)용 카드 — html2canvas로 그린다.
 * html2canvas가 최신 CSS 색 함수(oklch 등)를 못 읽어서 Tailwind 클래스 대신 hex 인라인 스타일만 쓴다.
 * 카카오 지도는 넣지 않는다 (약관·외부 이미지).
 */
export const IMAGE_WIDTH = 1080
export const IMAGE_HEIGHT = 1350

const C = {
  blue: '#3376fd',
  blueDark: '#0d50d7',
  blueLight: '#f0f3fa',
  gray900: '#1a1a1a',
  gray600: '#666666',
  gray300: '#e6e6e6',
  orange: '#a65a00',
  orangeLight: '#faf0e6',
}
const T = MESSAGES.share

type Data = ReturnType<typeof useReportData>

const SummaryImageCard = forwardRef<HTMLDivElement, { data: Data }>(function SummaryImageCard(
  { data },
  ref,
) {
  const { query } = data
  const risk = data.risk.data
  const activity = data.activity.data?.data
  const history = data.history.data?.data
  const metric = (id: MetricIndicator['id']) =>
    risk?.data.indicators?.find((i): i is MetricIndicator => i.id === id)
  const metas = [data.history.data?.meta, data.activity.data?.meta, risk?.meta]
  const sources = [...new Set(metas.flatMap((m) => parseSourceIds(m?.source)))]
    .map((id) => `${SOURCES[id]?.name ?? id}(${id})`)
    .join(', ')
  const baseline = formatDataBaseline(metas.find((m) => m?.data_updated_at))
  const isDemo = metas.some((m) => m?.is_demo)

  const indicatorText = (ind: MetricIndicator | undefined) =>
    ind ? (formatIndicatorValue(ind) ?? DATA_STATUS[ind.status].label) : '—'

  const tiles: { label: string; value: string; note: string }[] = [
    {
      label: T.image.competitor,
      value: indicatorText(metric('competitor_count')),
      note: T.image.competitorNote(query.radius),
    },
    {
      label: T.image.opened,
      value: activity
        ? `${formatCount(activity.recent_12m.opened, MESSAGES.units.store)} · ${formatCount(activity.recent_12m.closed, MESSAGES.units.store)}`
        : '—',
      note: formatPeriod(activity?.recent_12m.period) ?? '',
    },
    {
      label: T.image.referenceClosure,
      value: indicatorText(metric('closure_rate_12m')),
      note: T.image.referenceClosureNote,
    },
    {
      label: T.image.officialClosure,
      value: indicatorText(metric('official_closure_rate')),
      note: T.image.officialClosureNote,
    },
  ]

  return (
    <div
      ref={ref}
      style={{
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        boxSizing: 'border-box',
        padding: 72,
        background: '#ffffff',
        color: C.gray900,
        fontFamily: "'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>
          SPOT<span style={{ color: C.blue }}>:ON</span>
        </div>
        {isDemo && <div style={pill(C.orangeLight, C.orange)}>{MESSAGES.meta.demo}</div>}
      </div>

      <div>
        <div style={{ fontSize: 30, color: C.blue, fontWeight: 700 }}>{T.image.heading}</div>
        <div style={{ fontSize: 46, fontWeight: 800, marginTop: 12, lineHeight: 1.3 }}>
          {query.address}
        </div>
        <div style={{ fontSize: 30, color: C.gray600, marginTop: 14 }}>
          {T.image.conditions(
            CATEGORIES.find((c) => c.id === query.category)?.label ?? '',
            query.radius,
            formatYearMonthKo(query.asOf) ?? T.image.asOfCurrent,
          )}
          {query.franchise !== 'all' &&
            ` · ${FRANCHISE_OPTIONS.find((f) => f.id === query.franchise)?.label ?? ''}`}
        </div>
        {history && (
          <div style={{ fontSize: 28, marginTop: 20, ...pill(C.blueLight, C.blueDark) }}>
            {MESSAGES.history.summary(history.total)}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{
              border: `3px solid ${C.gray300}`,
              borderRadius: 28,
              padding: '26px 34px',
            }}
          >
            <div style={{ fontSize: 26, color: C.gray600 }}>{t.label}</div>
            <div style={{ fontSize: 58, fontWeight: 800, marginTop: 6 }}>{t.value}</div>
            <div style={{ fontSize: 24, color: C.gray600, marginTop: 6 }}>{t.note}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', fontSize: 21, color: C.gray600, lineHeight: 1.5 }}>
        {baseline && <div>{baseline}</div>}
        <div>{T.image.sources(sources)}</div>
        <div style={{ marginTop: 12, color: C.gray900, fontWeight: 600 }}>
          {MESSAGES.disclaimer}
        </div>
        <div>{MESSAGES.layout.ageNotice}</div>
        <div style={{ marginTop: 8 }}>{T.imageFooter}</div>
      </div>
    </div>
  )
})

/**
 * 강조 글자 — html2canvas가 이 글꼴의 글자를 브라우저보다 아래에 그려서 배경 알약 모양은 어긋난다.
 * 그래서 배경 없이 왼쪽 색 막대 + 글자로 표시한다.
 */
function pill(_background: string, color: string): CSSProperties {
  return {
    display: 'inline-block',
    color,
    borderLeft: `6px solid ${color}`,
    paddingLeft: 14,
    fontSize: 26,
    fontWeight: 700,
  }
}

export default SummaryImageCard
