import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from '../../hooks/useToast'
import { TOAST_DURATION_MS, type ToastInput } from '../../utils/toast'

/**
 * 화면 아래 가운데 짧은 알림 (새 라이브러리 없이). 한 번에 하나만, 2~3초 뒤 사라진다.
 * 알림 영역(role="status", aria-live="polite")은 항상 있어 내용이 바뀌면 화면 읽기 프로그램이 읽는다.
 * 나타날 때 살짝 떠오르고, 동작 줄이기 설정이면 움직임 없이 나타났다 사라진다
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((next: ToastInput) => {
    window.clearTimeout(timer.current)
    setToast({ ...next, id: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS[next.tone])
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const Icon = toast?.tone === 'error' ? CircleAlert : CircleCheck
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4 print:hidden"
      >
        {toast && (
          <p
            key={toast.id}
            className="inline-flex max-w-[44em] items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-body font-medium text-white shadow-card-hover motion-safe:animate-rise-in"
          >
            <Icon
              className={
                toast.tone === 'error'
                  ? 'size-5 shrink-0 text-orange-500'
                  : 'size-5 shrink-0 text-blue-500'
              }
              aria-hidden="true"
            />
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  )
}
