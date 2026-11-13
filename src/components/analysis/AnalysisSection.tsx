import type { ReactNode } from 'react'
import { ANALYSIS_SECTIONS, type AnalysisSectionId } from '../../constants/routes'
import { useRevealOnce } from '../../hooks/useRevealOnce'
import PageHeader from '../common/PageHeader'

type Props = { id: AnalysisSectionId; children: ReactNode }

/** STEP 02 탭 내용 공통 틀: 제목(h2)·설명 + 내용. 탭을 열 때 한 번만 떠오르며 등장 */
export default function AnalysisSection({ id, children }: Props) {
  const [ref, reveal] = useRevealOnce<HTMLElement>()
  const meta = ANALYSIS_SECTIONS.find((s) => s.id === id)
  if (!meta) return null
  const titleId = `${id}-title`
  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      data-reveal={reveal}
      className="flex flex-col gap-stack-3"
    >
      <PageHeader id={titleId} title={meta.label} description={meta.description} />
      {children}
    </section>
  )
}
