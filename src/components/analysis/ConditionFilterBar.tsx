import { Info, RefreshCw, Search } from 'lucide-react'
import { useState, type ReactNode } from 'react'
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

        {/* 프랜차이즈·개인 매장을 고르면 기준을 바로 보여준다 (개인 매장은 지금 자료로 거의 0곳) */}
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

function Group({
  legend,
  legendExtra,
  hint,
  segmented,
  children,
}: {
  legend: string
  /** legend 글자 옆에 붙는 요소 (예: ⓘ 설명 버튼) */
  legendExtra?: ReactNode
  hint?: string
  /** 하나만 고르는 선택지 — 회색 틀 안의 세그먼트 모양 */
  segmented?: boolean
  children: ReactNode
}) {
  return (
    <fieldset className="min-w-0 flex-auto border-b border-gray-300 px-4 py-3 not-last:border-r">
      <legend className="float-left mb-2 w-full text-micro font-semibold text-gray-600">
        {legend}
        {legendExtra}
        {hint && <span className="ml-1 font-normal">· {hint}</span>}
      </legend>
      <div
        className={cn(
          'clear-left flex flex-wrap',
          segmented ? 'w-fit gap-1 rounded-control bg-gray-100 p-1' : 'gap-1.5',
        )}
      >
        {children}
      </div>
    </fieldset>
  )
}

function Choice({
  type,
  segmented,
  name,
  checked,
  onChange,
  children,
}: {
  type: 'radio' | 'checkbox'
  /** 세그먼트 안 선택지 (높이 32 + 틀 여백 = 40px). 아니면 40px 알약 칩 */
  segmented?: boolean
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 text-caption font-semibold motion-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue-500',
        name.startsWith('brand-') && 'min-h-11',
        segmented
          ? cn(
              'h-8 rounded-lg px-3.5',
              checked
                ? 'bg-gray-0 text-blue-700 shadow-[0_1px_3px_rgb(16_24_40/0.12)] ring-1 ring-blue-500/40'
                : 'text-gray-900 hover:bg-gray-0/70',
            )
          : cn(
              'h-10 rounded-full border px-4',
              checked
                ? 'border-blue-500 bg-blue-100 text-blue-700'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100',
            ),
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}
