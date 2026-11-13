import { MESSAGES } from '../../constants/messages'
import { cn } from '../../utils/cn'

/** 회색 자리 표시 + 은은한 반짝임 (반짝임은 transform만 움직이고, 동작 줄이기면 멈춘다) */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('relative overflow-hidden bg-gray-100', className)}>
      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-gray-0/70 to-transparent motion-safe:animate-shimmer" />
    </div>
  )
}

type Variant = 'table' | 'map' | 'cards' | 'chart' | 'summary' | 'links' | 'cardsTable'

/**
 * 불러오는 동안 실제 내용과 비슷한 모양·높이로 자리를 잡아 화면이 덜 출렁이게 한다.
 * 화면 읽기 프로그램에는 기존 로딩 문구를 그대로 알린다.
 */
export default function LoadingSkeleton({
  variant,
  message = MESSAGES.common.loading,
}: {
  variant: Variant
  message?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{message}</span>
      {variant === 'table' && <TableSkeleton />}
      {variant === 'map' && <SkeletonBlock className="h-[420px] rounded-card" />}
      {variant === 'cards' && <CardsSkeleton count={4} />}
      {/* 시점 조회: 요약 카드 4개 + 점포 표 (알림은 한 번만) */}
      {variant === 'cardsTable' && (
        <div className="flex flex-col gap-4">
          <CardsSkeleton count={4} />
          <TableSkeleton />
        </div>
      )}
      {variant === 'chart' && <SkeletonBlock className="h-64 rounded-control" />}
      {/* 종합 진단: 상권 판정(120) · 공식 영역(387) · 참고 영역(635) — 실제 화면(1440, 목업)에서 잰 높이 */}
      {variant === 'summary' && (
        <div className="flex flex-col gap-10">
          <SkeletonBlock className="h-[120px] rounded-card" />
          <SkeletonBlock className="h-[387px] rounded-card" />
          <SkeletonBlock className="h-[635px] rounded-card" />
        </div>
      )}
      {variant === 'links' && (
        <div className="grid grid-cols-2 gap-6">
          {[0, 1].map((col) => (
            <div key={col} className="flex flex-col gap-3">
              <SkeletonBlock className="h-7 w-40 rounded" />
              {[0, 1].map((row) => (
                <SkeletonBlock key={row} className="h-[106px] rounded-control" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 표: 머리글 48px + 처음 보이는 5행(실제 행은 두 줄 칸이 있어 약 78px) — 실제 표와 같은 둥근 틀 */
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-gray-300">
      <SkeletonBlock className="h-12" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex h-[78px] items-center gap-4 border-t border-gray-300/60 px-3">
          <SkeletonBlock className="h-4 w-6 rounded" />
          <SkeletonBlock className="h-4 flex-1 rounded" />
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-4 w-24 rounded" />
          <SkeletonBlock className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        // 실제 점포 현황 카드 높이(135px)에 맞춤
        <div
          key={i}
          className="flex h-[135px] items-start gap-4 rounded-control border border-gray-300 bg-gray-0 p-5"
        >
          <SkeletonBlock className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-3.5 w-24 rounded" />
            <SkeletonBlock className="h-8 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
