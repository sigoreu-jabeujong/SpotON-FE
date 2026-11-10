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
import type { MarketActivity } from '../../../types/market'
import { cn } from '../../../utils/cn'
import EmptyState from '../../common/EmptyState'

const T = MESSAGES.activity
/** 디자인 토큰과 같은 색 (blue-500 개업 / pink-500 폐업) — 상태 구분용, 등급 색 아님 */
const COLOR = { opened: '#3376fd', closed: '#dc3cb4' } as const

type Props = { trend: MarketActivity['yearly_trend'] }

/**
 * 연도별 개업·폐업 추이 — 데이터가 있는 연도만, 서버 값 그대로.
 * 같은 숫자를 담은 표는 화면에서 접기/펼치기 하되, 접혀 있어도 화면 읽기 프로그램은 읽을 수 있다.
 */
export default function YearlyTrendChart({ trend }: Props) {
  const [showTable, setShowTable] = useState(false)
  const tableId = useId()

  if (trend.length === 0) return <EmptyState message={T.trendEmpty} />

  return (
    <div className="flex flex-col gap-2">
      <div role="img" aria-label={T.trendChartLabel} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: -8 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
            <XAxis
              dataKey="year"
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
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
            <Bar
              dataKey="opened"
              name={T.trendOpened}
              fill={COLOR.opened}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="closed"
              name={T.trendClosed}
              fill={COLOR.closed}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
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
        <table className="w-full overflow-hidden rounded-control text-center text-caption ring-1 ring-gray-300">
          <caption className="sr-only">{T.trendCaption}</caption>
          <thead className="bg-blue-100">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                {T.trendYearHeader}
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                {T.trendOpened}
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                {T.trendClosed}
              </th>
            </tr>
          </thead>
          <tbody>
            {trend.map((row) => (
              <tr key={row.year} className="border-t border-gray-300">
                <th scope="row" className="px-3 py-2 font-semibold">
                  {T.trendYear(row.year)}
                </th>
                <td className="px-3 py-2">{T.trendUnit(row.opened)}</td>
                <td className="px-3 py-2">{T.trendUnit(row.closed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
