import { storeFranchise } from '../../utils/storeDisplay'
import Badge from './Badge'
import StatusLabel from './StatusLabel'

type Props = { store: Parameters<typeof storeFranchise>[0] }

/**
 * 표 안의 프랜차이즈 칸 — 이력·주변·시점 표 공통 (utils/storeDisplay.storeFranchise).
 * 정보 없음은 상태 라벨, 추정·기존 분류는 배지 + 근거 한 줄.
 */
export default function StoreFranchiseCell({ store }: Props) {
  const f = storeFranchise(store)
  if (f.kind === 'unknown') return <StatusLabel status="unknown" />
  return (
    <>
      <Badge tone={store.franchise === 'franchise' ? 'blue' : 'gray'}>{f.label}</Badge>
      {f.help && <span className="mt-0.5 block text-micro break-keep text-gray-600">{f.help}</span>}
    </>
  )
}
