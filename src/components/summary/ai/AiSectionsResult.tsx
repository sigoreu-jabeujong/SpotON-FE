import type { AiSectionsReport, ReportSection } from '../../../types/aiReport'
import { REPORT_CHECKLIST } from '../../../api/aiReport'
import { MESSAGES } from '../../../constants/messages'
import AiChecklist from './AiChecklist'
import InfoPopover from '../../common/InfoPopover'

function Section({
  title,
  section,
  positive = false,
}: {
  title: string
  section: ReportSection
  positive?: boolean
}) {
  return (
    <section className="min-w-0 rounded-control border border-gray-300 bg-gray-0 p-5">
      <h3 className="mb-3 text-subtitle font-bold text-gray-900">{title}</h3>
      {section.status === 'unavailable' ? (
        <p className="text-body text-gray-600">
          이 부분의 해석을 불러오지 못했어요. 다른 결과와 원자료를 확인해 주세요.
        </p>
      ) : section.items.length ? (
        <ul className="flex flex-col gap-3 text-body leading-relaxed break-words text-gray-900">
          {section.items.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-gray-600">
          {positive
            ? '현재 자료로 확인할 수 있는 이점이 없어요.'
            : '현재 비교자료에서 뚜렷한 불리한 신호가 확인되지 않았어요.'}
        </p>
      )}
    </section>
  )
}

export function ReportChecklist() {
  return (
    <section className="mt-7" aria-label="계약 전 확인사항">
      <h3 className="mb-3 text-subtitle font-bold text-gray-900">{MESSAGES.ai.checklistTitle}</h3>
      <AiChecklist items={REPORT_CHECKLIST} />
    </section>
  )
}

export default function AiSectionsResult({ report }: { report: AiSectionsReport }) {
  return (
    <article
      aria-label="AI 해석 결과"
      className="min-w-0 rounded-card border border-blue-500/20 bg-gray-0 p-5 shadow-card sm:p-7"
    >
      {report.status === 'partial' && (
        <p className="mb-4 text-caption text-gray-600">
          일부 해석을 불러오지 못했어요. 확인된 부분만 표시해요.
        </p>
      )}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <Section title="이점" section={report.advantages} positive />
        <Section title="유의점" section={report.cautions} />
      </div>
      <section className="mt-7" aria-label="수치로 본 해석">
        <div className="mb-3 flex items-center gap-1">
          <h3 className="text-subtitle font-bold text-gray-900">수치로 본 해석</h3>
          <InfoPopover
            triggerLabel="수치 해석의 주의사항"
            title="수치 해석의 주의사항"
            closeLabel="닫기"
            className="print:hidden"
          >
            {report.limitations.map((item, i) => (
              <span key={i} className="block">
                {item.text}
              </span>
            ))}
            <span className="block">
              생활인구는 관측일의 시간대별 체류 특성이에요. 야간 수치가 높다는 이유만으로 야간
              소비나 방문이 활발한 상권으로 확정할 수 없어요.
            </span>
            <span className="block">
              행정동·격자·반경·상권은 범위와 대상이 달라요. 자료 분기와 관측일, 점포 규모 차이를
              함께 고려하고 개별 점포의 수익이나 실제 고객 수로 바꾸어 해석하지 마세요.
            </span>
            <span className="block">
              평균 영업 기간은 현재 영업 중인 점포의 경과 기간이며 앞으로의 수명이나 생존 확률이
              아니에요. 현장의 시간대별 통행·점포 접근성과 운영 조건은 계약 전에 별도로 확인해
              주세요.
            </span>
            <span className="block">{MESSAGES.ai.notice}</span>
          </InfoPopover>
        </div>
        {report.summary.status === 'ready' ? (
          <div className="flex flex-col gap-4 text-body leading-[1.9] break-words text-gray-900">
            {report.summary.items.map((p) => (
              <p key={p.group_id}>{p.text}</p>
            ))}
          </div>
        ) : (
          <p className="text-body text-gray-600">
            종합 해석을 불러오지 못했어요. 다른 해석과 분석 화면을 확인해 주세요.
          </p>
        )}
      </section>
      <ReportChecklist />
    </article>
  )
}
