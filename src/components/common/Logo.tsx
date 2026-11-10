import { Link } from 'react-router'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'

type Props = { className?: string }

/** SPOT:ON 글자 로고 (누르면 랜딩). 로고 이미지를 받으면 이 컴포넌트만 바꾼다 */
export default function Logo({ className }: Props) {
  return (
    <Link
      to={ROUTES.landing}
      aria-label={MESSAGES.layout.logoLabel}
      className={cn(
        'inline-block rounded text-title font-extrabold tracking-tight text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500',
        className,
      )}
    >
      SPOT<span className="text-blue-500">:ON</span>
    </Link>
  )
}
