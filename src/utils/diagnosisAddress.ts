import type { DiagnosisQuery } from '../types/diagnosis'
export function diagnosisAddress(q: DiagnosisQuery): string {
  const base =
    q.floorUnit && !q.address.endsWith(q.floorUnit) ? `${q.address} ${q.floorUnit}` : q.address
  return q.detailUnverified && q.detailText ? `${base} · 입력 상세: ${q.detailText} (미확인)` : base
}
