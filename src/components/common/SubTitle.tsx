import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** 오른쪽에 붙는 요소 (예: 기준일 배지) */
  right?: ReactNode
  id?: string
}

/** "| 주변 점포 분석" — 왼쪽 파란 세로 막대 소제목 */
export default function SubTitle({ children, right, id }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3
        id={id}
        className="text-subtitle border-l-[3px] border-blue-500 pl-2 leading-tight font-bold text-gray-900"
      >
        {children}
      </h3>
      {right}
    </div>
  )
}
