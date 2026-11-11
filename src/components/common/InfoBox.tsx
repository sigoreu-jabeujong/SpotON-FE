import { Info } from 'lucide-react'
import { cn } from '../../utils/cn'

type Props = {
  /** 안내 제목. showTitle이면 화면에 굵게, 아니면 화면 읽기 프로그램용으로만 */
  title: string
  showTitle?: boolean
  /** 한 줄 사유·설명 (예: "서울 평균 산정 전") */
  description?: string | null
  /** 여러 줄 안내 (예: 이력 표 아래 유의사항) */
  items?: readonly string[]
  className?: string
}

/**
 * 회색 안내 상자 — 아이콘 + (제목) + 사유/여러 줄 안내.
 * "비교할 수 없어요·자료 없음" 같은 안내를 결과 화면 어디서나 같은 모양으로 보여준다.
 */
export default function InfoBox({ title, showTitle, description, items, className }: Props) {
  return (
    <aside
      aria-label={showTitle ? undefined : title}
      className={cn(
        'flex gap-3 rounded-control bg-gray-100 px-4 py-3 text-caption text-gray-600',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden="true" />
      <div className="min-w-0">
        {showTitle && <p className="font-semibold text-gray-900">{title}</p>}
        {description && <p className={cn(showTitle && 'mt-0.5')}>{description}</p>}
        {items && items.length > 0 && (
          <ul className="list-disc space-y-0.5 pl-4 marker:text-gray-300">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
