import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * 조건 선택 묶음·선택지 — STEP 02 조회 조건 필터와 결과 화면 "조건 바꾸기" 팝업이 같은 모양을 쓴다.
 * 선택지는 sr-only input + label (키보드 포커스는 label 테두리로 보인다)
 */
export function ChoiceGroup({
  legend,
  legendExtra,
  hint,
  segmented,
  className,
  children,
}: {
  legend: string
  /** legend 글자 옆에 붙는 요소 (예: ⓘ 설명 버튼) */
  legendExtra?: ReactNode
  hint?: string
  /** 하나만 고르는 선택지 — 회색 틀 안의 세그먼트 모양 */
  segmented?: boolean
  /** 묶음 바깥 틀 (기본: 필터 바의 칸 — 아래·오른쪽 선) */
  className?: string
  children: ReactNode
}) {
  return (
    <fieldset
      className={cn(
        className ?? 'min-w-0 flex-auto border-b border-gray-300 px-4 py-3 not-last:border-r',
      )}
    >
      <legend className="float-left mb-2 w-full text-micro font-semibold text-gray-600">
        {legend}
        {legendExtra}
        {hint && <span className="ml-1 font-normal">· {hint}</span>}
      </legend>
      <div
        className={cn(
          'clear-left flex flex-wrap',
          segmented ? 'w-fit gap-1 rounded-control bg-gray-100 p-1' : 'gap-1.5',
        )}
      >
        {children}
      </div>
    </fieldset>
  )
}

export function Choice({
  type,
  segmented,
  name,
  checked,
  onChange,
  children,
}: {
  type: 'radio' | 'checkbox'
  /** 세그먼트 안 선택지 (높이 32 + 틀 여백 = 40px). 아니면 40px 알약 칩 */
  segmented?: boolean
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 text-caption font-semibold motion-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-500',
        name.startsWith('brand-') && 'min-h-11',
        segmented
          ? cn(
              'h-8 rounded-lg px-3.5',
              checked
                ? 'bg-gray-0 text-blue-700 shadow-[0_1px_3px_rgb(16_24_40/0.12)] ring-1 ring-blue-500/40'
                : 'text-gray-900 hover:bg-gray-0/70',
            )
          : cn(
              'h-10 rounded-full border px-4',
              checked
                ? 'border-blue-500 bg-blue-100 text-blue-700'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100',
            ),
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}
