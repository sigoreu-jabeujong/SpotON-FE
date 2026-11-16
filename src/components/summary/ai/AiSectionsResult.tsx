import type { AiSectionsReport, ReportSection, ReportText } from '../../../types/aiReport'
import { REPORT_CHECKLIST } from '../../../api/aiReport'
import { SOURCES } from '../../../constants/sources'
import { MESSAGES } from '../../../constants/messages'
import AiChecklist from './AiChecklist'

function Section({
  title,
  section,
  positive = false,
  limitations = [],
}: {
  title: string
  section: ReportSection
  positive?: boolean
  limitations?: ReportText[]
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
            : '현재 자료에서 비교 가능한 유의점이 없어요.'}
        </p>
      )}
      {limitations.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3 border-t border-gray-300 pt-4 text-caption leading-relaxed break-words text-gray-600">
          {limitations.map((item, i) => (
            <li key={i}>{item.text}</li>
          ))}
        </ul>
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
        <Section title="유의점" section={report.cautions} limitations={report.limitations} />
      </div>
      <section className="mt-7" aria-label="수치로 본 해석">
        <h3 className="mb-3 text-subtitle font-bold text-gray-900">수치로 본 해석</h3>
        {report.summary.status === 'ready' ? (
          <div className="flex flex-col gap-4 text-body leading-[1.9] break-words text-gray-900">
            {report.summary.items.map((p) => (
              <p key={p.group_id}>{p.text}</p>
            ))}
          </div>
        ) : (
          <p className="text-body text-gray-600">
            종합 해석을 불러오지 못했어요. 아래 수치와 기준을 확인해 주세요.
          </p>
        )}
        <dl
          className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
          aria-label="수치와 자료 기준"
        >
          {report.metrics.map((m) => (
            <div
              key={m.id}
              className="min-w-0 rounded-control bg-gray-100 p-4 text-caption break-words"
            >
              <dt className="font-semibold text-gray-900">{m.label}</dt>
              {m.area_label && <dd className="mt-1 text-gray-600">{m.area_label}</dd>}
              <dd className="mt-1 text-body font-bold break-all text-gray-900">{m.display}</dd>
              <dd className="mt-2 text-gray-600">
                {m.period} · {m.spatial_scope}
              </dd>
              <dd className="text-gray-600">
                {m.population_scope} · {m.filter_scope}
              </dd>
              {m.denominator !== null && (
                <dd className="text-gray-600">계산 기준 수: {m.denominator}</dd>
              )}
              {m.rounded && <dd className="text-gray-600">표시 단위에 따라 반올림된 값이에요.</dd>}
              {m.status === 'partial' && (
                <dd className="text-gray-600">공개된 일부 자료의 참고값이에요.</dd>
              )}
              {m.value === null && (
                <dd className="text-gray-600">제공 가능한 수치를 확인하지 못했어요.</dd>
              )}
              <dd className="mt-2 flex flex-wrap gap-2 text-gray-600">
                {m.group === 'population' ? (
                  <a
                    href="https://data.seoul.go.kr/dataList/OA-23016/S/1/datasetView.do"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-11 content-center underline"
                  >
                    서울시 행정동 내국인 생활인구
                  </a>
                ) : (
                  m.source_ids.map((id) =>
                    SOURCES[id]?.url ? (
                      <a
                        key={id}
                        href={SOURCES[id].url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-11 content-center underline"
                      >
                        {SOURCES[id].name}
                      </a>
                    ) : (
                      <span key={id}>{id}</span>
                    ),
                  )
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <ReportChecklist />
      <p className="mt-6 border-t border-gray-300 pt-4 text-caption leading-relaxed text-gray-600">
        {MESSAGES.ai.notice}
      </p>
    </article>
  )
}
