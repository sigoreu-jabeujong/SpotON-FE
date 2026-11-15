import { Info, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

/**
 * ⓘ 버튼 + 설명 팝오버 — AiInfoPopover와 같은 동작(aria-expanded·aria-controls, Esc·바깥 클릭·포커스 이동으로 닫힘,
 * 열면 닫기 버튼으로 포커스, 휴대폰에서는 화면 안에 고정). AiInfoPopover 자체는 그대로 둔다.
 * legend 같은 글줄 안에도 넣을 수 있게 span으로만 만든다 — children도 span·strong 등 글줄 요소로 넘긴다.
 */
export default function InfoPopover({
  triggerLabel,
  title,
  closeLabel,
  className,
  children,
}: {
  triggerLabel: string
  title: string
  closeLabel: string
  className?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLSpanElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    close.current?.focus()
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        trigger.current?.focus()
      }
    }
    const focusOutside = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    document.addEventListener('focusin', focusOutside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      document.removeEventListener('focusin', focusOutside)
    }
  }, [open])
  return (
    <span ref={root} className={cn('relative inline-flex align-middle', className)}>
      <button
        ref={trigger}
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        // 글줄 높이를 늘리지 않게 -my, 누르는 영역은 before로 44px까지 넓힌다
        className="relative -my-1 flex size-6 items-center justify-center rounded-full text-blue-600 before:absolute before:-inset-2.5 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${id}-title`}
          className="fixed top-28 right-4 left-4 z-40 block max-h-[65vh] overflow-y-auto rounded-card border border-gray-300 bg-gray-0 p-5 text-left font-normal shadow-card sm:absolute sm:top-full sm:right-auto sm:left-0 sm:mt-1 sm:w-92"
        >
          <span className="mb-3 flex items-start justify-between gap-2">
            <span
              id={`${id}-title`}
              role="heading"
              aria-level={3}
              className="text-body font-bold text-gray-900"
            >
              {title}
            </span>
            <button
              ref={close}
              type="button"
              aria-label={closeLabel}
              onClick={() => {
                setOpen(false)
                trigger.current?.focus()
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-control text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </span>
          <span className="block space-y-4 text-caption leading-relaxed text-gray-900">
            {children}
          </span>
        </span>
      )}
    </span>
  )
}
