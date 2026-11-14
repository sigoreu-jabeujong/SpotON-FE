import type { CommonQueryParams } from '../../../types/api'
import {
  CATEGORIES,
  RESTAURANT_SUB_CATEGORIES,
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
} from '../../../constants/diagnosis'
import { MESSAGES } from '../../../constants/messages'

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
    [T.asOf, asOf || params.as_of || T.latest],
    [
      T.area,
      FACILITY_SIZE_OPTIONS.find((v) => v.id === (params.area ?? 'all'))?.range ?? T.unknown,
    ],
    [
      T.franchise,
      FRANCHISE_OPTIONS.find((v) => v.id === (params.franchise ?? 'all'))?.label ?? T.unknown,
    ],
    [T.unknownArea, params.include_unknown_area !== false ? T.included : T.excluded],
    [T.unknownFranchise, params.include_unknown_franchise !== false ? T.included : T.excluded],
    [T.dataUpdatedAt, dataUpdatedAt || T.unknown],
  ]
  return (
    <dl
      aria-label={T.label}
      className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-control bg-blue-100/60 p-4 text-caption sm:grid-cols-2"
    >
      {items.map(([label, value]) => (
        <div key={label} className="flex min-w-0 gap-2">
          <dt className="shrink-0 text-gray-600">{label}</dt>
          <dd className="min-w-0 font-medium break-words text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
