import type { RiskInterpretation } from '../../../types/risk'
import { MESSAGES } from '../../../constants/messages'

/** Verified server prose as plain text, with no evidence chips or numbered sections. */
export default function AiResultCard({ result }: { result: RiskInterpretation }) {
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
      <p className="mt-6 border-t border-gray-300 pt-4 text-caption leading-relaxed text-gray-600">
        {MESSAGES.ai.notice}
      </p>
    </article>
  )
}
