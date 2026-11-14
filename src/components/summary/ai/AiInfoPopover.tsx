import { Info, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ApiMeta } from '../../../types/api'
import type { RiskInterpretation } from '../../../types/risk'
import { MESSAGES } from '../../../constants/messages'

export default function AiInfoPopover({
  result,
  meta,
}: {
  result?: RiskInterpretation
  meta?: ApiMeta | null
}) {
  const T = MESSAGES.ai.info
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
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
  const missing = [...new Set(result?.missing_data.map((v) => v.text) ?? [])]
  const available =
    result?.evidence?.indicators?.filter((v) => v.status === 'fact').map((v) => v.id) ?? []
  return (
    <div ref={root} className="relative flex items-center">
      <button
        ref={trigger}
        type="button"
        aria-label={T.trigger}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full text-blue-600 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${id}-title`}
          className="fixed top-28 right-4 left-4 z-40 max-h-[65vh] overflow-y-auto rounded-card border border-gray-300 bg-gray-0 p-5 shadow-card sm:absolute sm:top-full sm:right-auto sm:left-0 sm:mt-1 sm:w-92"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 id={`${id}-title`} className="text-body font-bold text-gray-900">
              {T.title}
            </h3>
            <button
              ref={close}
              type="button"
              aria-label={T.close}
              onClick={() => {
                setOpen(false)
                trigger.current?.focus()
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-control hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-4 text-caption leading-relaxed text-gray-900">
            <section>
              <h4 className="mb-1 font-bold">{T.available}</h4>
              <p>
                {result
                  ? available.length
                    ? T.availableText
                    : T.availableLimited
                  : T.beforeRequest}
              </p>
              <p className="mt-1 text-gray-600">
                {T.source} ·{' '}
                {result?.evidence?.data_updated_at ?? meta?.data_updated_at ?? T.unknownDate}
              </p>
            </section>
            <section>
              <h4 className="mb-1 font-bold">{T.unavailable}</h4>
              <p>{T.unavailableText}</p>
            </section>
            <section>
              <h4 className="mb-1 font-bold">{T.limitations}</h4>
              <ul className="list-disc space-y-2 pl-4">
                {T.rules.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
            {missing.length > 0 && (
              <section>
                <h4 className="mb-1 font-bold">{T.requestLimits}</h4>
                <ul className="list-disc space-y-2 pl-4">
                  {missing.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
