import { useId } from 'react'
import type { RiskInterpretation } from '../../../types/risk'
import { MESSAGES } from '../../../constants/messages'
import AiChecklist from './AiChecklist'
import { checklistItems } from './checklist'

/**
 * Verified server prose as plain text, with no evidence chips or numbered sections.
 * 본문 아래에 서버가 보낸 "계약 전 확인사항"(item + why)을 그대로 — 비어 있으면 블록을 숨긴다
 */
export default function AiResultCard({ result }: { result: RiskInterpretation }) {
  const checklist = checklistItems(result)
  const checklistTitleId = useId()
  return (
    <article
      aria-label={result.label}
      className="rounded-card border border-blue-500/20 bg-gray-0 p-5 shadow-card sm:p-7"
    >
      <div className="flex flex-col gap-5 text-body leading-[1.9] break-words text-gray-900">
        {result.body
          ?.split(/\n\s*\n/)
          .filter((p) => p.trim())
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>
      {checklist.length > 0 && (
        <section aria-labelledby={checklistTitleId} className="mt-7">
          <h3 id={checklistTitleId} className="mb-3 text-subtitle font-bold text-gray-900">
            {MESSAGES.ai.checklistTitle}
          </h3>
          <AiChecklist items={checklist} />
        </section>
      )}
      <p className="mt-6 border-t border-gray-300 pt-4 text-caption leading-relaxed text-gray-600">
        {MESSAGES.ai.notice}
      </p>
    </article>
  )
}
