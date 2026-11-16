import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseDiagnosisQuery, toDiagnosisSearch } from '../hooks/useDiagnosisQuery'
import { toV1QueryParams, toV2QueryParams } from './params'
import { adaptAnalysisNearby } from './storeAdapters'
import { validateAnalysisParams } from './analysisProfile'
import type { CommonQueryParams } from '../types/api'
import { nearbyMarker, historyStore } from '../test/fixtures'
import NearbyTable from '../components/analysis/nearby/NearbyTable'
import HistoryTable from '../components/analysis/history/HistoryTable'
import StoreReferenceCell from '../components/common/StoreReferenceCell'

const oldLink = new URLSearchParams(
  'address=테스트&category=restaurant&sub=korean,chinese&lat=37.5&lng=127&bk=key&floor=2층&radius=1000&asOf=2025-10&area=lt33&areaUnknown=false&brandScope=chain&brandUnknown=exclude&brandEvidence=include_estimates&franchise=franchise',
)

describe('브랜드 기능 제거 후 일반 분석 보존', () => {
  it('이전 공유 링크에서 브랜드만 버리고 업종·면적·날짜·위치를 유지한다', () => {
    const q = parseDiagnosisQuery(oldLink)
    expect(q).toMatchObject({
      category: 'restaurant',
      subCategories: ['korean', 'chinese'],
      radius: 1000,
      asOf: '2025-10',
      area: 'lt33',
      includeUnknown: false,
      floorUnit: '2층',
    })
    const search = toDiagnosisSearch(q)
    expect(search).not.toMatch(/brand|franchise/i)
    for (const map of [toV1QueryParams, toV2QueryParams]) {
      const p = map(q, { lat: 37.5, lng: 127 })!
      expect(p).toMatchObject({
        as_of: '2025-10',
        area: 'lt33',
        include_unknown_area: false,
        sub_category: ['korean', 'chinese'],
      })
      expect(Object.keys(p).join(',')).not.toMatch(/brand|franchise|operation/)
      expect(() => validateAnalysisParams(p)).not.toThrow()
    }
  })

  it('브랜드 판정이 없는 v2 점포 응답을 그대로 받아들이고 일반 필드는 검증한다', () => {
    const row = { ...nearbyMarker(), category: 'cafe' as const }
    const data = {
      center: { lat: 37.5, lng: 127 },
      radius_m: 500,
      as_of: '2026-10-31',
      count: 1,
      excluded_no_coord: 0,
      markers: [row],
      message: null,
    }
    const result = adaptAnalysisNearby(data)
    expect(result.markers[0].license_no).toBe(row.license_no)
    expect(() => adaptAnalysisNearby({ ...data, count: 2 })).toThrow()
    expect(() =>
      validateAnalysisParams({
        ...toV2QueryParams(parseDiagnosisQuery(oldLink), { lat: 37.5, lng: 127 })!,
        brand_scope: 'chain',
      } as unknown as CommonQueryParams),
    ).toThrow()
  })

  it('주변·이력 표의 소속 칸을 실제 응답 기준 시점으로 바꾼다', () => {
    const nearby = renderToStaticMarkup(
      <MemoryRouter>
        <NearbyTable
          markers={[nearbyMarker()]}
          selectedId={null}
          onSelect={() => {}}
          asOf="2024-02-29"
        />
      </MemoryRouter>,
    )
    const history = renderToStaticMarkup(
      <HistoryTable stores={[historyStore()]} asOf="2026-10-31" />,
    )
    for (const html of [nearby, history]) {
      expect(html).toContain('기준 시점')
      expect(html).not.toMatch(/브랜드|프랜차이즈|체인/)
    }
    expect(nearby).toContain('2024. 02. 29.')
    expect(history).toContain('2026. 10. 31.')
    expect(renderToStaticMarkup(<StoreReferenceCell />)).toContain('정보 없음')
  })
})
