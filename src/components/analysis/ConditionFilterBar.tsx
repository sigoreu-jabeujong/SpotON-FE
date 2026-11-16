import { Info, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { toDataRangeParams } from '../../api/params'
import {
  FACILITY_SIZE_OPTIONS,
  RADIUS_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
  type FacilitySize,
  type RadiusMeters,
  type SubCategory,
} from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { useDataRange } from '../../hooks/useDataRange'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import type { DiagnosisQuery } from '../../types/diagnosis'
import { cn } from '../../utils/cn'
import { ChoiceGroup as Group, Choice } from '../common/ConditionChoices'
import AsOfPicker from './AsOfPicker'

const T = MESSAGES.filter

type Draft = Pick<DiagnosisQuery, 'radius' | 'subCategories' | 'area' | 'includeUnknown' | 'asOf'>

const sameDraft = (a: Draft, b: Draft) =>
  a.radius === b.radius &&
  a.area === b.area &&
  a.includeUnknown === b.includeUnknown &&
  a.asOf === b.asOf &&
  [...a.subCategories].sort().join(',') === [...b.subCategories].sort().join(',')

/**
 * 진단 조건 필터 바 — 반경·세부 업종(음식점만)·시설 규모·기준 시점·정보 없음 포함.
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
    radius: query.radius,
    subCategories: query.subCategories,
    area: query.area,
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
          <span className="font-semibold">{'면적 정보 없음 포함'}</span>
          <span id="include-unknown-hint" className="text-gray-600">
            {'신고 면적이 없는 기록도 포함해요.'}
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
