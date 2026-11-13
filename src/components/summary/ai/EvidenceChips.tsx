import { ArrowUpRight } from 'lucide-react'
import { MESSAGES } from '../../../constants/messages'
import { scrollBehavior } from '../../../constants/motion'
import { SOURCES } from '../../../constants/sources'
import type { EvidenceId, IndicatorId } from '../../../types/risk'
import { indicatorAnchorId } from '../indicatorFormat'
import { evidenceChip } from './evidenceChip'

const T = MESSAGES.ai

type Props = { indicatorIds?: EvidenceId[]; sources?: string[] }

/** 위쪽 지표 카드로 부드럽게 스크롤하고 키보드 초점도 옮긴다 */
function goToIndicator(id: IndicatorId) {
  const el = document.getElementById(indicatorAnchorId(id))
  if (!el) return
  el.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
  el.focus({ preventScroll: true })
}

/**
 * 근거 지표 칩 — [동종업체 수] [참고 폐업률]처럼 AI 문장이 어떤 지표에 기댔는지 보여준다.
 * 화면에 지표 카드가 있는 칩은 누르면 그 카드로 이동하고, 카드가 없는 칩(상권 활동 참고 계산·새 ID)은
 * 이름만 보여주는 글자 칩이다 (버튼처럼 보이지 않음). 출처 칩은 R번호를 이름으로 보여준다.
 */
export default function EvidenceChips({ indicatorIds = [], sources = [] }: Props) {
  if (indicatorIds.length === 0 && sources.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {indicatorIds.length > 0 && (
        <span className="text-micro font-semibold text-gray-600">{T.evidence}</span>
      )}
      {indicatorIds.map((id, i) => {
        const { label: name, target } = evidenceChip(id)
        // 같은 ID가 여러 문장에 반복될 수 있어 key는 순서와 함께
        if (!target)
          return (
            <span
              key={`${id}-${i}`}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-micro font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset"
            >
              {name}
            </span>
          )
        return (
          <button
            key={`${id}-${i}`}
            type="button"
            onClick={() => goToIndicator(target)}
            aria-label={T.goToIndicator(name)}
            className="group inline-flex items-center gap-0.5 rounded-full border border-blue-500/40 bg-gray-0 px-2 py-0.5 text-micro font-semibold text-blue-700 motion-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
          >
            {name}
            <ArrowUpRight className="size-3 arrow-nudge" aria-hidden="true" />
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
