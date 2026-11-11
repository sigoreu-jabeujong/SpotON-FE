import { Link } from 'react-router'
import { IMAGES } from '../../assets/images'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { cn } from '../../utils/cn'

type Props = { className?: string }

/** S 심볼 + "SPOT:ON" 글자 로고 (누르면 랜딩). 심볼은 장식이라 alt="" — 링크 이름은 aria-label */
export default function Logo({ className }: Props) {
  return (
    <Link
      to={ROUTES.landing}
      aria-label={MESSAGES.layout.logoLabel}
      className={cn(
        'inline-flex items-center gap-2 rounded text-title font-extrabold tracking-tight text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500',
        className,
      )}
    >
      {IMAGES.logo && (
        <img src={IMAGES.logo} alt="" aria-hidden="true" className="size-8 shrink-0" />
      )}
      <span>
        SPOT<span className="text-blue-500">:ON</span>
      </span>
    </Link>
  )
}
