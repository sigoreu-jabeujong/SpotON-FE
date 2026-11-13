import { ChevronDown, Table2 } from 'lucide-react'
import { useId, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MESSAGES } from '../../../constants/messages'
import { MOTION_MS, prefersReducedMotion } from '../../../constants/motion'
import type { MarketActivity } from '../../../types/market'
import { cn } from '../../../utils/cn'
import EmptyState from '../../common/EmptyState'

const T = MESSAGES.activity
/** 디자인 토큰과 같은 색 (blue-500 개업 / pink-500 폐업) — 상태 구분용, 등급 색 아님 */
const COLOR = { opened: '#3376fd', closed: '#dc3cb4' } as const

/** 막대 등장 시간은 모션 토큰(느림)과 맞추고, 동작 줄이기면 애니메이션 없이 바로 그린다 */
const barMotion = () =>
  ({
    isAnimationActive: !prefersReducedMotion(),
    animationDuration: MOTION_MS.slow,
    animationEasing: 'ease-out',
  }) as const

type Props = { trend: MarketActivity['yearly_trend'] }

/**
 * 연도별 개업·폐업 추이 — 데이터가 있는 연도만, 서버 값 그대로.
 * 같은 숫자를 담은 표는 화면에서 접기/펼치기 하되, 접혀 있어도 화면 읽기 프로그램은 읽을 수 있다.
 */
export default function YearlyTrendChart({ trend: rawTrend }: Props) {
  const trend = rawTrend ?? []
  const [showTable, setShowTable] = useState(false)
  const tableId = useId()

  if (trend.length === 0) return <EmptyState message={T.trendEmpty} />
  const yearTicks = axisTicks(trend.map((t) => t.year))

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={T.trendChartLabel} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* 연도가 많으면(실제 데이터 24~60개) 개업·폐업 막대 사이를 좁혀 막대를 조금이라도 넓게 */}
          <BarChart
            data={trend}
            margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
            barGap={trend.length > 20 ? 1 : 4}
          >
            {/* 가로 격자는 옅게 — 막대가 먼저 보이게 */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            {/* 숫자 축: 실제 연도 간격대로 그린다 (없는 연도는 0으로 채우지 않고 빈 자리로 둔다 — 1971→2002가 붙어 보이지 않게) */}
            <XAxis
              dataKey="year"
              type="number"
              domain={[yearTicks[0] - 0.5, yearTicks[yearTicks.length - 1] + 0.5]}
              ticks={yearTicks}
              allowDecimals={false}
              interval={0}
              tickFormatter={(y: number) => T.trendYear(y)}
              tick={{ fontSize: 12, fill: '#666666' }}
              axisLine={{ stroke: '#e6e6e6' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#666666' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'rgb(51 118 253 / 0.06)' }}
              labelFormatter={(y) => T.trendYear(Number(y))}
              formatter={(value, name) => [T.trendUnit(Number(value)), name]}
              contentStyle={{ borderRadius: 10, borderColor: '#e6e6e6', fontSize: 13 }}
              animationDuration={MOTION_MS.fast}
              isAnimationActive={!prefersReducedMotion()}
            />
            {/* 범례 글자는 진한 회색 (막대 색 글자는 흰 바탕 대비 4.5:1 미만) — 색은 동그라미로만 */}
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 13 }}
              formatter={(value) => <span style={{ color: '#1a1a1a' }}>{value}</span>}
            />
            <Bar
              dataKey="opened"
              name={T.trendOpened}
              fill={COLOR.opened}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              {...barMotion()}
            />
            <Bar
              dataKey="closed"
              name={T.trendClosed}
              fill={COLOR.closed}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              {...barMotion()}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        type="button"
        aria-expanded={showTable}
        aria-controls={tableId}
        onClick={() => setShowTable((v) => !v)}
        className="flex w-fit items-center gap-1 self-end rounded px-2 py-1 text-caption font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <Table2 className="size-4" aria-hidden="true" />
        {showTable ? T.trendHideTable : T.trendShowTable}
        <ChevronDown
          className={cn('size-4 transition-transform', showTable && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      <div id={tableId} className={showTable ? '' : 'sr-only'}>
        <table className="w-full overflow-hidden rounded-card bg-gray-0 text-center text-caption tabular-nums ring-1 ring-gray-300">
          <caption className="sr-only">{T.trendCaption}</caption>
          <thead className="bg-blue-100/70 text-gray-900">
            <tr>
              <th scope="col" className="px-3 py-3 font-bold">
                {T.trendYearHeader}
              </th>
              <th scope="col" className="px-3 py-3 font-bold">
                {T.trendOpened}
              </th>
              <th scope="col" className="px-3 py-3 font-bold">
                {T.trendClosed}
              </th>
            </tr>
          </thead>
          <tbody>
            {trend.map((row) => (
              <tr key={row.year} className="border-t border-gray-300/60">
                <th scope="row" className="px-3 py-3 font-semibold">
                  {T.trendYear(row.year)}
                </th>
                <td className="px-3 py-3">{T.trendUnit(row.opened)}</td>
                <td className="px-3 py-3">{T.trendUnit(row.closed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * x축 눈금 연도 (표시용) — 10년 이하면 매년, 길면 5·10·20년 간격으로 끝 연도까지.
 * 데이터 값은 바꾸지 않고 축 글자 위치만 정한다
 */
function axisTicks(years: number[]): number[] {
  const min = Math.min(...years)
  const max = Math.max(...years)
  const span = max - min
  if (span <= 10) return Array.from({ length: span + 1 }, (_, i) => min + i)
  const step = span <= 30 ? 5 : span <= 60 ? 10 : 20
  const ticks: number[] = []
  for (let y = Math.ceil(min / step) * step; y <= max; y += step) ticks.push(y)
  if (ticks[0] !== min) ticks.unshift(min)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}
