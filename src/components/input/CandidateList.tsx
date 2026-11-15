import { ChevronRight, MapPin } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { MESSAGES } from '../../constants/messages'
import type { GeocodeCandidate } from '../../types/geocode'

const T = MESSAGES.input
/** API가 최대 5건을 주지만, 화면에서도 5건까지만 보여준다 */
const MAX_CANDIDATES = 5

type Props = {
  candidates: GeocodeCandidate[]
  onSelect: (candidate: GeocodeCandidate) => void
}

/**
 * 주소 후보가 여러 개일 때 고르는 목록 — 앱의 선택 목록처럼 한 장의 흰 상자 안에 행을 나눠 보여준다.
 * 키보드: Tab·Enter·Space(기존 그대로) + 위·아래 화살표로 후보 사이 이동. 초점이 간 행은 파란 배경·테두리로 또렷하게
 */
export default function CandidateList({ candidates, onSelect }: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const firstRef = useRef<HTMLButtonElement>(null)

  // 목록이 나타나면 첫 후보로 초점을 옮겨 키보드로 바로 고를 수 있게 한다
  useEffect(() => {
    firstRef.current?.focus()
  }, [candidates])

  /** 위·아래 화살표로 이전·다음 후보로 초점 이동 (끝에서는 멈춤) */
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const buttons = Array.from(listRef.current?.querySelectorAll('button') ?? [])
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      buttons[e.key === 'ArrowDown' ? Math.min(i + 1, buttons.length - 1) : Math.max(i - 1, 0)]
    if (!next) return
    e.preventDefault()
    next.focus()
  }

  return (
    // 나타날 때 위에서 살짝 펼쳐지듯 (동작 줄이기면 바로 보임)
    <div className="mt-4 origin-top motion-safe:animate-expand-in">
      <p
        id="candidate-title"
        role="status"
        className="px-1 text-caption font-semibold text-gray-900"
      >
        {T.candidatesTitle}
      </p>
      <ul
        ref={listRef}
        aria-labelledby="candidate-title"
        onKeyDown={onKeyDown}
        className="mt-2 divide-y divide-gray-300 overflow-hidden rounded-control border border-gray-300 bg-gray-0"
      >
        {candidates.slice(0, MAX_CANDIDATES).map((c, i) => (
          <li key={`${c.building_key}-${c.address_road}-${i}`}>
            <button
              ref={i === 0 ? firstRef : undefined}
              type="button"
              onClick={() => onSelect(c)}
              className="group flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left motion-colors hover:bg-blue-100 focus-visible:bg-blue-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500"
            >
              <MapPin className="size-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-gray-900 group-focus-visible:text-blue-700">
                  {c.address_road || c.address_jibun}
                </span>
                {c.address_road && c.address_jibun && (
                  <span className="block text-micro text-gray-600">
                    {T.candidateJibun} {c.address_jibun}
                  </span>
                )}
              </span>
              <ChevronRight
                className="size-4 shrink-0 arrow-nudge text-gray-600 group-focus-visible:text-blue-700"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
