import { RefreshCw, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { BRAND_API_ENABLED } from '../../api/analysisProfile'
import { toDataRangeParams } from '../../api/params'
import {
  BRAND_SCOPE_CHOICES,
  CATEGORIES,
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
  RADIUS_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
  type SubCategory,
} from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { useDataRange } from '../../hooks/useDataRange'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { cn } from '../../utils/cn'
import {
  draftFromQuery,
  draftToPatch,
  sameDraft,
  type ConditionDraft,
} from '../../utils/conditionDraft'
import { diagnosisAddress } from '../../utils/diagnosisAddress'
import AsOfPicker from '../analysis/AsOfPicker'
import { Choice, ChoiceGroup } from '../common/ConditionChoices'

const T = MESSAGES.conditionDialog
const F = MESSAGES.filter
/** 팝업 안 묶음 — 위아래로 쌓고 가는 선으로 구분 */
const GROUP = 'min-w-0 border-b border-gray-300 px-6 py-4 max-sm:px-4'
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 결과 화면 "조건 바꾸기" 팝업 — 업종(세부 업종)·반경·시설 규모·브랜드(또는 가맹)·기준 시점을 바꿔
 * 같은 결과 화면의 URL 쿼리만 바꾼다(useDiagnosisQuery). 주소는 바꾸지 않고 "다른 주소로 진단하기"로 입력 화면에.
 * STEP 02 조회 조건 필터와 같은 URL 조건을 쓰므로 한쪽에서 바꾸면 다른 쪽에도 그대로 보인다.
 * 접근성: role=dialog·aria-modal, 열면 첫 선택지로 포커스, Tab 순환, Esc·바깥 클릭·닫기로 닫고 여는 버튼으로 포커스 복귀, 배경 스크롤 잠금.
 * body 아래로 그린다 — 조건 바(sticky + backdrop-blur) 안에서는 fixed 위치가 바 기준이 되기 때문
 */
export default function ConditionDialog({
  onClose,
  returnFocus,
}: {
  onClose: () => void
  /** 닫은 뒤 포커스를 돌려줄 "조건 바꾸기" 버튼 */
  returnFocus: RefObject<HTMLButtonElement | null>
}) {
  const { query, search, updateQuery } = useDiagnosisQuery()
  const [draft, setDraft] = useState<ConditionDraft>(() => draftFromQuery(query))
  const changed = !sameDraft(draft, draftFromQuery(query))
  // 기준 시점 범위는 팝업에서 고른 업종·세부 업종 기준
  const dataRange = useDataRange(
    toDataRangeParams({ ...query, category: draft.category, subCategories: draft.subCategories }),
  )
  const panel = useRef<HTMLFormElement>(null)
  const id = useId()

  const close = () => {
    onClose()
    // 팝업이 사라진 뒤 여는 버튼으로 포커스 복귀
    requestAnimationFrame(() => returnFocus.current?.focus())
  }

  useEffect(() => {
    const el = panel.current
    // 첫 선택지(업종)로 포커스
    el?.querySelector<HTMLElement>('input:checked, input')?.focus()
    // 배경 스크롤 잠금
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !el) return
      // Tab 순환 — 팝업 밖으로 나가지 않게 처음·끝에서 반대쪽으로
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null || n.matches('input'),
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
    // 열릴 때 한 번만 (닫기 함수는 매번 같은 일을 한다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSub = (sub: SubCategory) =>
    setDraft((d) => ({
      ...d,
      subCategories: d.subCategories.includes(sub)
        ? d.subCategories.filter((s) => s !== sub)
        : [...d.subCategories, sub],
    }))

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 transition-opacity duration-(--duration-base) max-md:items-end max-md:p-0 starting:opacity-0"
      // 바깥(어두운 배경)을 누르면 닫힘
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <form
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        onSubmit={(e) => {
          e.preventDefault()
          if (!changed) return
          updateQuery(draftToPatch(draft, BRAND_API_ENABLED))
          close()
        }}
        className="flex max-h-[88vh] w-full max-w-[680px] flex-col overflow-hidden rounded-card bg-gray-0 shadow-card transition-transform duration-(--duration-base) ease-(--ease-out-soft) max-md:max-h-[92vh] max-md:max-w-none max-md:rounded-b-none starting:translate-y-4"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-300 px-6 py-4 max-sm:px-4">
          <div>
            <h2 id={`${id}-title`} className="text-subtitle font-bold text-gray-900">
              {T.title}
            </h2>
            <p id={`${id}-desc`} className="mt-0.5 text-caption text-gray-600">
              {T.description}
            </p>
          </div>
          <button
            type="button"
            aria-label={T.close}
            onClick={close}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* 주소는 여기서 바꾸지 않는다 — 다른 주소는 입력 화면에서 */}
          <div className={cn(GROUP, 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2')}>
            <p className="min-w-0 text-caption">
              <span className="mr-2 font-semibold text-gray-600">{T.address}</span>
              <span className="font-semibold break-keep text-gray-900">
                {diagnosisAddress(query)}
              </span>
            </p>
            <Link
              to={{ pathname: ROUTES.input, search }}
              className="inline-flex min-h-11 items-center text-caption font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {T.otherAddress}
            </Link>
          </div>

          <ChoiceGroup legend={T.category} segmented className={GROUP}>
            {CATEGORIES.map((c) => (
              <Choice
                key={c.id}
                type="radio"
                segmented
                name="dlg-category"
                checked={draft.category === c.id}
                onChange={() =>
                  setDraft((d) => ({
                    ...d,
                    category: c.id,
                    subCategories: c.id === 'restaurant' ? d.subCategories : [],
                  }))
                }
              >
                {c.label}
              </Choice>
            ))}
          </ChoiceGroup>

          {draft.category === 'restaurant' && (
            <ChoiceGroup legend={F.subCategory} hint={F.subCategoryAll} className={GROUP}>
              {RESTAURANT_SUB_CATEGORIES.map((s) => (
                <Choice
                  key={s.id}
                  type="checkbox"
                  name="dlg-sub"
                  checked={draft.subCategories.includes(s.id)}
                  onChange={() => toggleSub(s.id)}
                >
                  {s.label}
                </Choice>
              ))}
            </ChoiceGroup>
          )}

          <ChoiceGroup legend={F.radius} segmented className={GROUP}>
            {RADIUS_OPTIONS.map((r) => (
              <Choice
                key={r}
                type="radio"
                segmented
                name="dlg-radius"
                checked={draft.radius === r}
                onChange={() => setDraft((d) => ({ ...d, radius: r }))}
              >
                {r.toLocaleString('ko-KR')}m
              </Choice>
            ))}
          </ChoiceGroup>

          <ChoiceGroup legend={F.area} segmented className={GROUP}>
            {FACILITY_SIZE_OPTIONS.map((a) => (
              <Choice
                key={a.id}
                type="radio"
                segmented
                name="dlg-area"
                checked={draft.area === a.id}
                onChange={() => setDraft((d) => ({ ...d, area: a.id }))}
              >
                {a.label}
              </Choice>
            ))}
          </ChoiceGroup>

          {BRAND_API_ENABLED ? (
            <ChoiceGroup legend={MESSAGES.brand.scope} segmented className={GROUP}>
              {BRAND_SCOPE_CHOICES.map((o) => (
                <Choice
                  key={o.id}
                  type="radio"
                  segmented
                  name="brand-dlg-scope"
                  checked={draft.brandScope === o.id}
                  onChange={() => setDraft((d) => ({ ...d, brandScope: o.id }))}
                >
                  {o.label}
                </Choice>
              ))}
            </ChoiceGroup>
          ) : (
            <ChoiceGroup legend={F.franchise} segmented className={GROUP}>
              {FRANCHISE_OPTIONS.map((f) => (
                <Choice
                  key={f.id}
                  type="radio"
                  segmented
                  name="dlg-franchise"
                  checked={draft.franchise === f.id}
                  onChange={() => setDraft((d) => ({ ...d, franchise: f.id }))}
                >
                  {f.label}
                </Choice>
              ))}
            </ChoiceGroup>
          )}

          <ChoiceGroup legend={F.asOf} className={cn(GROUP, 'border-b-0')}>
            <AsOfPicker
              idPrefix="dlg-as-of"
              value={draft.asOf}
              onChange={(asOf) => setDraft((d) => ({ ...d, asOf }))}
              range={dataRange.data?.data ?? null}
              status={dataRange.isPending ? 'loading' : dataRange.isError ? 'error' : 'ready'}
            />
          </ChoiceGroup>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-300 px-6 py-4 max-sm:px-4">
          {!changed && <p className="mr-auto text-caption text-gray-600">{T.unchanged}</p>}
          <button
            type="button"
            onClick={close}
            className="inline-flex h-11 items-center rounded-full px-5 text-caption font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            {T.cancel}
          </button>
          <button
            type="submit"
            disabled={!changed}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-blue-600 px-5 text-caption font-semibold text-white motion-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {T.submit}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
