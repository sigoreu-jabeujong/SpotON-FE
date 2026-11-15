import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** 오른쪽에 붙는 요소 (예: 기준일 배지) */
  right?: ReactNode
  id?: string
  /**
   * 제목 단계 (기본 h3 — STEP 02처럼 h2 섹션 안의 소제목).
   * 위에 h2가 없는 화면(STEP 03·04)의 최상위 묶음은 h2로 써서 h1 → h3로 건너뛰지 않게 한다
   */
  as?: 'h2' | 'h3'
}

/** "주변 점포 분석" — 굵은 소제목 (왼쪽 색 막대 없이 크기·굵기로 섹션 제목과 구분) */
export default function SubTitle({ children, right, id, as: Heading = 'h3' }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Heading id={id} className="text-subtitle leading-tight font-bold text-gray-900">
        {children}
      </Heading>
      {right}
    </div>
  )
}
