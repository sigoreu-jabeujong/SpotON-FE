import { apiPost, ApiRequestError } from './client'
import type { AiSectionsReport, ReportBaseline, ReportRequest } from '../types/aiReport'

export const REPORT_CHECKLIST = [
  {
    item: '시간대별 현장 유동 확인',
    why: '생활인구와 실제 방문 흐름은 다르므로 영업 예정 시간에 직접 확인해 주세요.',
  },
  {
    item: '보행 동선과 출입 접근성 확인',
    why: '지도 반경과 실제 이동 경로가 같은지 현장에서 살펴보세요.',
  },
  {
    item: '가시성과 주변 점포 확인',
    why: '입구가 보이는 위치와 실제 비교 점포의 운영 모습을 확인해 주세요.',
  },
]
const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)
const strings = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((v) => typeof v === 'string')

export function reportMatches(value: unknown, baseline: ReportBaseline): value is AiSectionsReport {
  if (
    !record(value) ||
    value.schema_version !== 'ai-sections-v1' ||
    value.label !== 'AI 해석' ||
    !['complete', 'partial'].includes(String(value.status)) ||
    !record(value.baseline) ||
    !Object.entries(baseline).every(
      ([k, v]) => value.baseline && record(value.baseline) && value.baseline[k] === v,
    ) ||
    typeof value.report_context_hash !== 'string' ||
    !/^[0-9a-f]{64}$/.test(value.report_context_hash) ||
    typeof value.generated_at !== 'string' ||
    !Number.isFinite(Date.parse(value.generated_at)) ||
    !Array.isArray(value.metrics) ||
    value.metrics.length > 2000
  )
    return false
  const metricIds = new Set<string>()
  for (const m of value.metrics) {
    if (
      !record(m) ||
      ![
        'id',
        'group',
        'label',
        'display',
        'unit',
        'status',
        'period',
        'spatial_scope',
        'population_scope',
        'filter_scope',
      ].every((k) => typeof m[k] === 'string') ||
      !strings(m.source_ids) ||
      (m.area_label !== null && typeof m.area_label !== 'string') ||
      (m.value !== null && (typeof m.value !== 'string' || !/^\d+(\.\d+)?$/.test(m.value))) ||
      (m.denominator !== null && typeof m.denominator !== 'string') ||
      (m.reason !== null && typeof m.reason !== 'string') ||
      (m.rounded !== null && typeof m.rounded !== 'boolean') ||
      (m.exact_zero !== null && typeof m.exact_zero !== 'boolean') ||
      metricIds.has(String(m.id))
    )
      return false
    metricIds.add(String(m.id))
  }
  if (
    !Array.isArray(value.limitations) ||
    value.limitations.length < 1 ||
    value.limitations.length > 32 ||
    !value.limitations.every(
      (item) =>
        record(item) &&
        typeof item.text === 'string' &&
        item.text.trim() &&
        item.text.length < 20000 &&
        strings(item.evidence_ids) &&
        item.evidence_ids.every((id) => metricIds.has(id)),
    )
  )
    return false
  let ready = 0
  for (const role of ['advantages', 'cautions', 'summary']) {
    const section = value[role]
    if (!record(section) || !Array.isArray(section.items) || !strings(section.group_ids))
      return false
    if (section.status === 'unavailable') {
      if (
        section.items.length ||
        section.verification !== null ||
        !['provider_error', 'verification_failed', 'timeout', 'rate_limited'].includes(
          String(section.reason),
        )
      )
        return false
      continue
    }
    if (
      section.status !== 'ready' ||
      !record(section.verification) ||
      section.verification.passed !== true ||
      section.reason !== null
    )
      return false
    ready++
    for (const item of section.items) {
      if (
        !record(item) ||
        typeof item.text !== 'string' ||
        !item.text.trim() ||
        item.text.length > 20000 ||
        !strings(item.evidence_ids) ||
        !item.evidence_ids.every((id) => metricIds.has(id))
      )
        return false
    }
    if (
      role === 'summary' &&
      (!Number.isInteger(section.group_count) ||
        Number(section.group_count) < 1 ||
        Number(section.group_count) > 6 ||
        section.items.length !== section.group_count ||
        section.group_ids.length !== section.group_count ||
        new Set(section.group_ids).size !== section.group_count ||
        !section.items.every(
          (item, i) => record(item) && item.group_id === (section.group_ids as string[])[i],
        ))
    )
      return false
  }
  return (
    ready > 0 &&
    (value.status === 'complete') === (ready === 3) &&
    Array.isArray(value.checklist) &&
    value.checklist.length === 3 &&
    value.checklist.every(
      (c, i) =>
        record(c) && c.item === REPORT_CHECKLIST[i].item && c.why === REPORT_CHECKLIST[i].why,
    )
  )
}

export async function postAiReport(body: ReportRequest, signal: AbortSignal) {
  const result = await apiPost<unknown>('/v2/risk/interpret/sections', body, {
    signal,
    timeoutMs: 90000,
  })
  if (!reportMatches(result.data, body.baseline))
    throw new ApiRequestError(
      'AI_VERIFY_FAILED',
      'AI 해석 결과의 자료 기준을 확인하지 못했어요.',
      null,
    )
  return { ...result, data: result.data }
}
