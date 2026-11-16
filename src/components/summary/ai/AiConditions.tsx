import type { CommonQueryParams } from '../../../types/api'
import {
  CATEGORIES,
  RESTAURANT_SUB_CATEGORIES,
  FACILITY_SIZE_OPTIONS,
} from '../../../constants/diagnosis'
import { MESSAGES } from '../../../constants/messages'
import { formatDate } from '../../../utils/format'

export default function AiConditions({
  address,
  params,
  asOf,
  dataUpdatedAt,
}: {
  address: string
  params: CommonQueryParams
  asOf?: string | null
  dataUpdatedAt?: string | null
}) {
  const T = MESSAGES.ai.context
  const category =
    params.category === 'restaurant' && params.sub_category?.length
      ? RESTAURANT_SUB_CATEGORIES.filter((c) => params.sub_category?.includes(c.id))
          .map((c) => c.label)
          .join('·')
      : CATEGORIES.find((c) => c.id === params.category)?.label
  const items = [
    [T.address, address || T.unknown],
    [T.category, category || T.unknown],
    [T.radius, `${params.radius.toLocaleString('ko-KR')}m`],
    [T.asOf, formatDate(asOf || params.as_of) || T.latest],
    [
      T.area,
      FACILITY_SIZE_OPTIONS.find((v) => v.id === (params.area ?? 'all'))?.range ?? T.unknown,
    ],
    [T.unknownArea, params.include_unknown_area !== false ? T.included : T.excluded],
    [T.dataUpdatedAt, formatDate(dataUpdatedAt) || T.unknown],
  ]
  return (
    // 한 박스 안에 표처럼 — 칸마다 오른쪽·아래 가는 선, 바깥쪽 끝 선은 -m으로 박스 밖에 숨긴다 (열 수와 상관없이)
    // 데스크톱 4열 · 태블릿 2열 · 휴대폰 한 줄씩
    <div className="overflow-hidden rounded-control border border-gray-300 bg-gray-0">
      <dl
        aria-label={T.label}
        className="-mr-px -mb-px grid grid-cols-1 text-caption sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex min-w-0 flex-col gap-0.5 border-r border-b border-gray-300 px-4 py-3"
          >
            <dt className="text-micro text-gray-600">{label}</dt>
            <dd className="min-w-0 font-semibold break-words text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
