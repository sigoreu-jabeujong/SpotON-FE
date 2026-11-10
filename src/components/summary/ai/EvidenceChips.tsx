import { ArrowUpRight } from 'lucide-react'
import { INDICATOR_NAME } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import { SOURCES } from '../../../constants/sources'
import type { IndicatorId } from '../../../types/risk'
import { indicatorAnchorId } from '../indicatorFormat'

const T = MESSAGES.ai

type Props = { indicatorIds?: IndicatorId[]; sources?: string[] }

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 위쪽 지표 카드로 부드럽게 스크롤하고 키보드 초점도 옮긴다 */
function goToIndicator(id: IndicatorId) {
  const el = document.getElementById(indicatorAnchorId(id))
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  el.focus({ preventScroll: true })
}

/**
 * 근거 지표 칩 — [동종업체 수] [참고 폐업률]처럼 AI 문장이 어떤 지표에 기댔는지 보여준다.
 * 지표 칩을 누르면 해당 지표 카드로 이동, 출처 칩은 R번호를 이름으로 보여준다.
 */
export default function EvidenceChips({ indicatorIds = [], sources = [] }: Props) {
  if (indicatorIds.length === 0 && sources.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {indicatorIds.length > 0 && (
        <span className="text-micro font-semibold text-gray-600">{T.evidence}</span>
      )}
      {indicatorIds.map((id) => {
        const name = INDICATOR_NAME[id] ?? id
        return (
          <button
            key={id}
            type="button"
            onClick={() => goToIndicator(id)}
            aria-label={T.goToIndicator(name)}
            className="inline-flex items-center gap-0.5 rounded-full border border-blue-500/40 bg-gray-0 px-2 py-0.5 text-micro font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
          >
            {name}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </button>
        )
      })}
      {sources.length > 0 && (
        <span className="ml-1 text-micro font-semibold text-gray-600">{T.sources}</span>
      )}
      {sources.map((s) => (
        <span
          key={s}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-micro text-gray-600 ring-1 ring-gray-300 ring-inset"
        >
          {SOURCES[s]?.name ?? s}({s})
        </span>
      ))}
    </div>
  )
}
