import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  /** 제목 id — 묶음(section·tabpanel)의 aria-labelledby 연결용 */
  id?: string
  /** 오른쪽 끝 요소 (예: 시연 데이터 배지) */
  right?: ReactNode
}

/** 화면 안 큰 묶음의 머리 — 제목(h2) + 한 줄 설명. 결과 화면 맨 위 ResultHeader(h1) 아래에 쓴다 */
export default function PageHeader({ title, description, id, right }: Props) {
  return (
    <div className="flex items-end justify-between gap-stack-2">
      <div className="min-w-0">
        <h2 id={id} className="text-section font-bold text-gray-900">
          {title}
        </h2>
        {description && <p className="mt-stack-1 text-body text-gray-600">{description}</p>}
      </div>
      {right}
    </div>
  )
}
