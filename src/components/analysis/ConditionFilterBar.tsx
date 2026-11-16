import { Info, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { toDataRangeParams } from '../../api/params'
import {
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
  RADIUS_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
  type FacilitySize,
  type FranchiseFilter,
  type RadiusMeters,
  type SubCategory,
} from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { useDataRange } from '../../hooks/useDataRange'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import type { DiagnosisQuery } from '../../types/diagnosis'
import { cn } from '../../utils/cn'
import { ChoiceGroup as Group, Choice } from '../common/ConditionChoices'
import InfoPopover from '../common/InfoPopover'
import AsOfPicker from './AsOfPicker'
import { BRAND_API_ENABLED } from '../../api/analysisProfile'
import { BRAND_SCOPE_CHOICES } from '../../constants/diagnosis'
import { brandSelection, brandSelectionFor } from '../../utils/brands'

const T = MESSAGES.filter

type Draft = Pick<
  DiagnosisQuery,
  | 'radius'
  | 'subCategories'
  | 'area'
  | 'franchise'
  | 'includeUnknown'
  | 'asOf'
  | 'brandScope'
  | 'brandUnknown'
  | 'brandEvidence'
>

const sameDraft = (a: Draft, b: Draft) =>
  a.radius === b.radius &&
  a.area === b.area &&
  a.franchise === b.franchise &&
  a.includeUnknown === b.includeUnknown &&
  a.asOf === b.asOf &&
  a.brandScope === b.brandScope &&
  a.brandUnknown === b.brandUnknown &&
  a.brandEvidence === b.brandEvidence &&
  [...a.subCategories].sort().join(',') === [...b.subCategories].sort().join(',')

/**
 * 진단 조건 필터 바 — 반경·세부 업종(음식점만)·시설 규모·프랜차이즈·기준 시점·정보 없음 포함.
 * "조회"를 눌러야 URL 쿼리가 바뀐다. 이력 섹션을 뺀 모든 섹션에 적용된다.
 * 값 목록은 constants/diagnosis.ts에서만 가져온다.
 */
export default function ConditionFilterBar() {
  const { query, updateQuery, search } = useDiagnosisQuery()
  // URL 조건이 바뀌면(뒤로 가기 등) 초안을 다시 맞추도록 key로 새로 만든다
  return <FilterForm key={search} query={query} onApply={updateQuery} />
}

function FilterForm({
  query,
  onApply,
}: {
  query: DiagnosisQuery
  onApply: (patch: Partial<DiagnosisQuery>) => void
}) {
  const applied: Draft = {
    ...brandSelection(query),
    radius: query.radius,
    subCategories: query.subCategories,
    area: query.area,
    franchise: query.franchise,
    includeUnknown: query.includeUnknown,
    asOf: query.asOf,
  }
  const [draft, setDraft] = useState<Draft>(applied)
  // 기준 시점 선택 가능 범위 (로딩·오류면 시점 선택만 비활성)
  // 적용된 업종·세부 업종 기준 (주변 조회와 같은 조건)
  const dataRange = useDataRange(toDataRangeParams(query))
  const changed = !sameDraft(draft, applied)
  const isRestaurant = query.category === 'restaurant'

  const toggleSub = (id: SubCategory) =>
    setDraft((d) => ({
      ...d,
      subCategories: d.subCategories.includes(id)
        ? d.subCategories.filter((s) => s !== id)
        : [...d.subCategories, id],
    }))

  return (
    <form
      aria-label={T.title}
      onSubmit={(e) => {
        e.preventDefault()
        if (changed) onApply(draft)
      }}
      className="rounded-control border border-gray-300 bg-gray-0"
    >
      <div className="flex flex-wrap">
        <Group legend={T.radius} segmented>
          {RADIUS_OPTIONS.map((r) => (
            <Choice
              key={r}
              type="radio"
              segmented
              name="radius"
              checked={draft.radius === r}
              onChange={() => setDraft((d) => ({ ...d, radius: r as RadiusMeters }))}
            >
              {r.toLocaleString('ko-KR')}m
            </Choice>
          ))}
        </Group>

        {isRestaurant && (
          <Group legend={T.subCategory} hint={T.subCategoryAll}>
            {RESTAURANT_SUB_CATEGORIES.map((s) => (
              <Choice
                key={s.id}
                type="checkbox"
                name="sub"
                checked={draft.subCategories.includes(s.id)}
                onChange={() => toggleSub(s.id)}
              >
                {s.label}
              </Choice>
            ))}
          </Group>
        )}

        <Group legend={T.area} segmented>
          {FACILITY_SIZE_OPTIONS.map((a) => (
            <Choice
              key={a.id}
              type="radio"
              segmented
              name="area"
              checked={draft.area === a.id}
              onChange={() => setDraft((d) => ({ ...d, area: a.id as FacilitySize }))}
            >
              {a.label}
              {a.pyeong && <span className="font-normal text-gray-600"> ({a.pyeong})</span>}
            </Choice>
          ))}
        </Group>

        {/* 프랜차이즈·개인 매장을 고르면 기준을 바로 보여준다 (개인 매장은 지금 자료로 거의 0개) */}
        {!BRAND_API_ENABLED && (
          <Group
            legend={T.franchise}
            segmented
            hint={
              draft.franchise === 'all'
                ? undefined
                : MESSAGES.store.franchise.optionHint[draft.franchise]
            }
          >
            {FRANCHISE_OPTIONS.map((f) => (
              <Choice
                key={f.id}
                type="radio"
                segmented
                name="franchise"
                checked={draft.franchise === f.id}
                onChange={() => setDraft((d) => ({ ...d, franchise: f.id as FranchiseFilter }))}
              >
                {f.label}
              </Choice>
            ))}
          </Group>
        )}

        {BRAND_API_ENABLED && (
          <>
            {/* 브랜드 소속은 전체 / 브랜드·체인 두 가지만 — 미확인·판정 근거 요청 값은 선택에 따라 정한다 */}
            <Group legend={MESSAGES.brand.scope} legendExtra={<BrandFilterInfo />} segmented>
              {BRAND_SCOPE_CHOICES.map((option) => (
                <Choice
                  key={option.id}
                  type="radio"
                  segmented
                  name="brand-scope"
                  checked={draft.brandScope === option.id}
                  onChange={() => setDraft((d) => ({ ...d, ...brandSelectionFor(option.id) }))}
                >
                  {option.label}
                </Choice>
              ))}
            </Group>
          </>
        )}

        <Group legend={T.asOf}>
          <AsOfPicker
            value={draft.asOf}
            onChange={(asOf) => setDraft((d) => ({ ...d, asOf }))}
            range={dataRange.data?.data ?? null}
            status={dataRange.isPending ? 'loading' : dataRange.isError ? 'error' : 'ready'}
          />
        </Group>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-caption text-gray-900">
          <input
            type="checkbox"
            checked={draft.includeUnknown}
            onChange={(e) => setDraft((d) => ({ ...d, includeUnknown: e.target.checked }))}
            aria-describedby="include-unknown-hint"
            className="size-4 accent-blue-500"
          />
          <span className="font-semibold">
            {BRAND_API_ENABLED ? MESSAGES.brand.areaUnknown : T.includeUnknown}
          </span>
          <span id="include-unknown-hint" className="text-gray-600">
            {BRAND_API_ENABLED ? '' : T.includeUnknownHint}
          </span>
        </label>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <p className="flex items-center gap-1 text-micro text-gray-600">
            <Info className="size-3.5 shrink-0" aria-hidden="true" />
            {T.scopeNotice}
          </p>
          {/* 바뀐 조건이 아직 적용되지 않았음을 글자로도 알림 (색만으로 구분하지 않기). 알림 영역은 늘 두고 내용만 바꾼다 */}
          <p aria-live="polite" className="text-caption font-semibold text-blue-700 empty:-ml-3">
            {changed && (
              <span className="flex items-center gap-1 transition-opacity duration-(--duration-base) starting:opacity-0">
                <RefreshCw className="size-3.5 shrink-0" aria-hidden="true" />
                {T.pendingApply}
              </span>
            )}
          </p>
          <button
            type="submit"
            aria-disabled={!changed}
            title={changed ? undefined : T.unchanged}
            className={cn(
              'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-5 text-caption font-semibold whitespace-nowrap motion-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
              changed
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-default bg-gray-100 text-gray-600',
            )}
          >
            <Search className="size-4" aria-hidden="true" />
            {T.submit}
          </button>
        </div>
      </div>
    </form>
  )
}

/** 브랜드 소속 설명 (legend 옆 ⓘ) */
function BrandFilterInfo() {
  const B = MESSAGES.brand
  return (
    <InfoPopover
      triggerLabel={B.filterInfoTrigger}
      title={B.filterInfoTitle}
      closeLabel={B.filterInfoClose}
      className="ml-1"
    >
      <span className="block">
        <strong className="mb-1 block font-bold">{B.scope}</strong>
        <span className="block">{B.membershipLimit}</span>
      </span>
    </InfoPopover>
  )
}
