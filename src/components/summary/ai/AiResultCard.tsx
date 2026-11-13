import { CircleHelp, FileText, Info, ThumbsDown, ThumbsUp, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type { RiskInterpretation } from '../../../types/risk'
import { formatDateTime } from '../../../utils/format'
import RobotArt from '../../common/RobotArt'
import EvidenceChips from './EvidenceChips'
import { indicatorReasonText } from '../indicatorFormat'

const T = MESSAGES.ai

/**
 * 결과가 도착하면 머리 → (1) → (2)(3) → (4) → (5) → 꼬리 순서로 짧게 떠오르며 등장 (한 번만).
 * 문장·숫자는 처음부터 최종 값 그대로이고, 위치·투명도만 움직인다. 동작 줄이기면 효과 없음
 */
const rise = 'motion-safe:animate-rise-in'
const stagger = (n: number): CSSProperties => ({
  animationDelay: `calc(var(--duration-stagger) * ${n})`,
})

/**
 * AI 해석 결과 — 순서 고정: (1) 요약 → (2) 유리 / (3) 불리 좌우 나란히 → (4) 부족한 자료 → (5) 체크리스트.
 * 문장은 서버가 검증한 그대로 보여주고, 숫자를 바꾸거나 새로 만들지 않는다.
 */
export default function AiResultCard({
  result,
  checklist,
}: {
  result: RiskInterpretation
  /** (5) 계약 전 현장 확인사항 — 체크리스트 컴포넌트 */
  checklist?: ReactNode
}) {
  return (
    <article
      aria-label={result.label}
      className="flex flex-col gap-6 rounded-card border border-blue-500/30 bg-blue-100/50 p-6"
    >
      <header className={`flex items-center gap-3 ${rise}`} style={stagger(0)}>
        <RobotArt className="size-16" />
        <span className="rounded-full bg-blue-600 px-3 py-1 text-caption font-bold text-white">
          {result.label}
        </span>
      </header>

      <Part number={1} icon={FileText} title={T.sections.official} order={1}>
        <ItemList
          items={result.official_values.map((v) => ({
            key: v.text,
            text: v.text,
            chips: <EvidenceChips indicatorIds={v.indicator_ids} />,
          }))}
        />
      </Part>

      <div className={`grid grid-cols-2 gap-4 ${rise}`} style={stagger(2)}>
        <Part number={2} icon={ThumbsUp} title={T.sections.favorable} boxed>
          <ItemList
            items={result.favorable.map((v) => ({
              key: v.text,
              text: v.text,
              chips: <EvidenceChips indicatorIds={v.indicator_ids} sources={v.sources} />,
            }))}
          />
        </Part>
        <Part number={3} icon={ThumbsDown} title={T.sections.unfavorable} boxed>
          <ItemList
            items={result.unfavorable.map((v) => ({
              key: v.text,
              text: v.text,
              chips: <EvidenceChips indicatorIds={v.indicator_ids} sources={v.sources} />,
            }))}
          />
        </Part>
      </div>

      <Part number={4} icon={CircleHelp} title={T.sections.missing} order={3}>
        <ItemList
          items={result.missing_data.map((v) => ({
            key: v.text,
            text: v.text,
            chips: (
              <p className="mt-0.5 text-caption text-gray-600">{indicatorReasonText(v.reason)}</p>
            ),
          }))}
        />
      </Part>

      {checklist && (
        <Part number={5} icon={FileText} title={T.sections.checklist} order={4}>
          {checklist}
        </Part>
      )}

      <footer
        className={`flex flex-col gap-1 border-t border-blue-500/20 pt-4 text-micro text-gray-600 ${rise}`}
        style={stagger(5)}
      >
        <p>
          {T.model} {result.model}
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          {T.generatedAt} {formatDateTime(result.generated_at)}
        </p>
        <p className="flex items-start gap-1.5 text-caption text-gray-900">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden="true" />
          {T.notice}
        </p>
      </footer>
    </article>
  )
}

function Part({
  number,
  icon: Icon,
  title,
  boxed,
  order,
  children,
}: {
  number: number
  icon: LucideIcon
  title: string
  boxed?: boolean
  /** 순서대로 등장할 때 몇 번째인지 (묶음 안에 있으면 생략 — 묶음이 함께 움직임) */
  order?: number
  children: ReactNode
}) {
  return (
    <section
      className={[
        boxed ? 'rounded-control bg-gray-0 p-4 ring-1 ring-gray-300' : '',
        order !== undefined ? rise : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={order !== undefined ? stagger(order) : undefined}
    >
      <h4 className="mb-2 flex items-center gap-1.5 text-body font-bold text-gray-900">
        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-micro font-bold text-white">
          {number}
        </span>
        <Icon className="size-4 text-blue-500" aria-hidden="true" />
        {title}
      </h4>
      {children}
    </section>
  )
}

function ItemList({ items }: { items: { key: string; text: string; chips: ReactNode }[] }) {
  if (items.length === 0) return <p className="text-caption text-gray-600">{T.empty}</p>
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="text-body leading-relaxed text-gray-900">
          {item.text}
          {item.chips}
        </li>
      ))}
    </ul>
  )
}
