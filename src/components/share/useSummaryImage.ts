import { useRef, useState } from 'react'
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './SummaryImageCard'

export type SummaryImageStatus = 'idle' | 'making' | 'done' | 'failed'
type Status = SummaryImageStatus

/**
 * 요약 카드 DOM을 html2canvas로 PNG(1080×1350)로 만들어 내려받는다.
 * html2canvas는 이 버튼을 누를 때만 불러온다 (첫 화면 용량을 늘리지 않기 위해).
 */
export function useSummaryImage(fileName: string) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  const save = async () => {
    const el = cardRef.current
    if (!el) {
      setStatus('failed')
      return
    }
    setStatus('making')
    try {
      const { default: html2canvas } = await import('html2canvas')
      await document.fonts?.ready
      const canvas = await html2canvas(el, {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        scale: 1,
        backgroundColor: '#ffffff',
        logging: false,
        // Tailwind 기본 테두리색(oklch)을 html2canvas가 못 읽으므로 복제 문서에서만 hex로 덮는다 (테두리를 직접 지정한 요소는 제외)
        onclone: (doc) => {
          const style = doc.createElement('style')
          style.textContent =
            '*:not([style*="border"]), ::before, ::after { border-color: #e6e6e6 !important; outline-color: #3376fd !important; }'
          doc.head.appendChild(style)
        },
      })
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('PNG_FAILED')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('done')
    } catch {
      setStatus('failed')
    }
  }

  return { cardRef, status, save }
}
