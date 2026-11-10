import { useId, useState } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type { RiskInterpretation } from '../../../types/risk'

const T = MESSAGES.ai

/**
 * 계약 전 현장 확인사항 — 체크박스 목록(item + 작게 why).
 * 체크 상태는 이 화면 안에서만 유지하고 저장하지 않는다.
 */
export default function AiChecklist({ items }: { items: RiskInterpretation['checklist'] }) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set())
  const baseId = useId()

  if (items.length === 0) return <p className="text-caption text-gray-600">{T.empty}</p>

  const toggle = (index: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  return (
    <div className="rounded-control bg-gray-0 p-4 ring-1 ring-gray-300">
      <p className="mb-3 flex items-center justify-between gap-2 text-micro text-gray-600">
        <span>{T.checklistHint}</span>
        {/* 체크한 개수는 화면 표시용 (지표 아님) */}
        <span aria-live="polite" className="font-semibold text-blue-700">
          {T.checklistDone(checked.size, items.length)}
        </span>
      </p>
      <ul className="flex flex-col gap-2.5">
        {items.map((c, i) => {
          const id = `${baseId}-check-${i}`
          return (
            <li key={c.item} className="flex items-start gap-2.5">
              <input
                id={id}
                type="checkbox"
                checked={checked.has(i)}
                onChange={() => toggle(i)}
                aria-describedby={`${id}-why`}
                className="mt-1 size-4 shrink-0 accent-blue-500"
              />
              <label htmlFor={id} className="cursor-pointer">
                <span
                  className={
                    checked.has(i)
                      ? 'text-body text-gray-600 line-through'
                      : 'text-body text-gray-900'
                  }
                >
                  {c.item}
                </span>
                <span id={`${id}-why`} className="block text-caption text-gray-600">
                  {c.why}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
