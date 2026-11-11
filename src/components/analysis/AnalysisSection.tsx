import type { ReactNode } from 'react'
import { ANALYSIS_SECTIONS, type AnalysisSectionId } from '../../constants/routes'
import { useRevealOnce } from '../../hooks/useRevealOnce'
import SectionHeader from '../common/SectionHeader'

type Props = { id: AnalysisSectionId; children: ReactNode }

/** STEP 02 섹션 공통 틀: #id 앵커 + "01 제목" 머리. 화면에 처음 들어올 때 한 번만 떠오르며 등장 */
export default function AnalysisSection({ id, children }: Props) {
  const [ref, reveal] = useRevealOnce<HTMLElement>()
  const meta = ANALYSIS_SECTIONS.find((s) => s.id === id)
  if (!meta) return null
  const titleId = `${id}-title`
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      tabIndex={-1}
      data-reveal={reveal}
      className="scroll-mt-8 focus:outline-none"
    >
      <SectionHeader
        id={titleId}
        number={meta.number}
        title={meta.label}
        description={meta.description}
      />
      <div className="mt-6">{children}</div>
    </section>
  )
}
