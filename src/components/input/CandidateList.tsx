import { ChevronRight, MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MESSAGES } from '../../constants/messages'
import type { GeocodeCandidate } from '../../types/geocode'

const T = MESSAGES.input
/** API가 최대 5건을 주지만, 화면에서도 5건까지만 보여준다 */
const MAX_CANDIDATES = 5

type Props = {
  candidates: GeocodeCandidate[]
  onSelect: (candidate: GeocodeCandidate) => void
}

/** 주소 후보가 여러 개일 때 고르는 목록 (Tab·Enter·Space로 선택 가능) */
export default function CandidateList({ candidates, onSelect }: Props) {
  const firstRef = useRef<HTMLButtonElement>(null)

  // 목록이 나타나면 첫 후보로 초점을 옮겨 키보드로 바로 고를 수 있게 한다
  useEffect(() => {
    firstRef.current?.focus()
  }, [candidates])

  return (
    // 나타날 때 위에서 살짝 펼쳐지듯 (동작 줄이기면 바로 보임)
    <div className="mt-4 origin-top rounded-control border border-blue-500/40 bg-blue-100/60 p-3 motion-safe:animate-expand-in">
      <p
        id="candidate-title"
        role="status"
        className="px-1 text-caption font-semibold text-gray-900"
      >
        {T.candidatesTitle}
      </p>
      <ul aria-labelledby="candidate-title" className="mt-2 flex flex-col gap-1.5">
        {candidates.slice(0, MAX_CANDIDATES).map((c, i) => (
          <li key={`${c.building_key}-${c.address_road}-${i}`}>
            <button
              ref={i === 0 ? firstRef : undefined}
              type="button"
              onClick={() => onSelect(c)}
              className="group flex w-full interactive-lift items-center gap-3 rounded-control bg-gray-0 px-3 py-2.5 text-left hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <MapPin className="size-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold text-gray-900">
                  {c.address_road || c.address_jibun}
                </span>
                {c.address_road && c.address_jibun && (
                  <span className="block text-micro text-gray-600">
                    {T.candidateJibun} {c.address_jibun}
                  </span>
                )}
              </span>
              <ChevronRight
                className="size-4 shrink-0 arrow-nudge text-gray-600"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
