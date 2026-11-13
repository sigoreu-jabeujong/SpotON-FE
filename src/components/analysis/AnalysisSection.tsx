import type { ReactNode } from 'react'
import { ANALYSIS_SECTIONS, type AnalysisSectionId } from '../../constants/routes'
import SectionHeader from '../common/SectionHeader'

type Props = { id: AnalysisSectionId; children: ReactNode }

/** STEP 02 섹션 공통 틀: #id 앵커 + "제목" 머리. 결과 화면은 등장 효과 없이 처음부터 보인다 */
export default function AnalysisSection({ id, children }: Props) {
  const meta = ANALYSIS_SECTIONS.find((s) => s.id === id)
  if (!meta) return null
  const titleId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      tabIndex={-1}
      className="scroll-mt-sticky focus:outline-none"
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
