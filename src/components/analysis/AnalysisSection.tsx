import type { ReactNode } from 'react'
import { ANALYSIS_SECTIONS, type AnalysisSectionId } from '../../constants/routes'
import SectionHeader from '../common/SectionHeader'

type Props = { id: AnalysisSectionId; children: ReactNode }

/** STEP 02 섹션 공통 틀: #id 앵커 + "01 제목" 머리 */
export default function AnalysisSection({ id, children }: Props) {
  const meta = ANALYSIS_SECTIONS.find((s) => s.id === id)
  if (!meta) return null
  const titleId = `${id}-title`
  return (
    <section id={id} aria-labelledby={titleId} className="scroll-mt-8">
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
