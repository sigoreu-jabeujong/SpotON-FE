import type { storePeriod } from '../../utils/storeDisplay'

/**
 * 표 안의 영업 기간 칸 — 0은 "0개월"(굵게), 미산정은 흐린 "정보 없음" + 사유 한 줄.
 * 주변 점포 표·시점 조회 표가 같이 쓴다 (이력 표와 같은 모양).
 */
export default function StorePeriodCell({ period }: { period: ReturnType<typeof storePeriod> }) {
  if (!period.missing) return <span className="font-semibold whitespace-nowrap">{period.text}</span>
  return (
    <>
      <span className="whitespace-nowrap text-gray-600">{period.text}</span>
      {period.reason && (
        <span className="mt-0.5 block text-micro break-keep text-gray-600">{period.reason}</span>
      )}
    </>
  )
}
