import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import type { AiSectionsReport, ReportSection } from '../../../types/aiReport'
import { REPORT_CHECKLIST } from '../../../api/aiReport'
import AiSectionsResult from './AiSectionsResult'

it('shows interpretations and checklist without exposing evidence cards or source links', () => {
  const section: ReportSection = {
    status: 'ready',
    items: [{ text: '해석 문단을 유지합니다.', evidence_ids: ['m1'], group_id: 'risk' }],
    reason: null,
    verification: { passed: true },
    group_count: 1,
    group_ids: ['risk'],
  }
  const report: AiSectionsReport = {
    schema_version: 'ai-sections-v1',
    label: 'AI 해석',
    status: 'complete',
    advantages: section,
    cautions: section,
    summary: section,
    limitations: [],
    metrics: [
      {
        id: 'm1',
        group: 'risk',
        label: '표시하지 않을 근거 카드',
        area_label: null,
        value: '13.2',
        display: '13.2%',
        unit: '%',
        status: 'ready',
        reason: null,
        source_ids: ['R5'],
        period: '2026-11-08',
        spatial_scope: '반경 500m',
        population_scope: '기록',
        filter_scope: '선택 조건',
        denominator: '684',
        exact_zero: false,
        rounded: false,
      },
    ],
    checklist: REPORT_CHECKLIST,
    generated_at: '2026-11-17T00:00:00Z',
    report_context_hash: 'a'.repeat(64),
    baseline: { risk: 'a', activity: 'b', location: 'c', grid: 'd', address_history: null },
  }
  const html = renderToStaticMarkup(<AiSectionsResult report={report} />)
  expect(html).toContain('이점')
  expect(html).toContain('유의점')
  expect(html).toContain('해석 문단을 유지합니다.')
  expect(html).toContain('계약 전 확인사항')
  expect(html).not.toContain('표시하지 않을 근거 카드')
  expect(html).not.toContain('수치와 자료 기준')
  expect(html).not.toContain('data.go.kr')
})
