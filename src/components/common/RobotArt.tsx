import { Bot } from 'lucide-react'
import { IMAGES } from '../../assets/images'
import { cn } from '../../utils/cn'

/** 로봇 그림 (AI 해석·재진단 안내 옆 장식). 장식이라 alt="" + aria-hidden, 그림이 없으면 아이콘 */
export default function RobotArt({ className }: { className?: string }) {
  if (IMAGES.robot) {
    return (
      <img
        src={IMAGES.robot}
        alt=""
        aria-hidden="true"
        className={cn('shrink-0 object-contain', className)}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gray-0 text-blue-500 shadow-card',
        className,
      )}
    >
      <Bot className="size-1/2" />
    </span>
  )
}
