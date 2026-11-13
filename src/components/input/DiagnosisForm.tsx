import {
  ArrowRight,
  CircleCheck,
  Coffee,
  LoaderCircle,
  type LucideIcon,
  MapPin,
  Search,
  Utensils,
} from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CATEGORIES, type Category } from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { cn } from '../../utils/cn'

const T = MESSAGES.input
const CATEGORY_ICON: Record<Category, LucideIcon> = { cafe: Coffee, restaurant: Utensils }

type Props = {
  initialAddress?: string
  initialCategory?: Category | null
  /** 주소 검색 중이면 버튼 비활성 + 로딩 표시 */
  loading?: boolean
  /** 주소 검색 API 오류 문구 (주소 입력칸 아래에 표시) */
  apiError?: string | null
  /** 필수 항목이 모두 채워졌을 때만 호출 */
  onSubmit: (address: string, category: Category) => void
  /** 입력값이 바뀌면 호출 (이전 검색 결과·오류 지우기용) */
  onChange?: () => void
  /** 주소 입력칸 아래에 붙는 내용 (예: 주소 후보 목록) */
  children?: ReactNode
}

type Required = { address: boolean; category: boolean }

/** 주소 검색이 이 시간보다 오래 걸리면 "서버 준비 중" 안내로 바꾼다 */
const SLOW_SEARCH_MS = 3000

/** 입력 화면 오른쪽 흰 카드: STEP 01, ① 진단 위치 입력, ② 업종 선택, "이 자리 진단하기" */
export default function DiagnosisForm({
  initialAddress = '',
  initialCategory = null,
  loading = false,
  apiError,
  onSubmit,
  onChange,
  children,
}: Props) {
  const [address, setAddress] = useState(initialAddress)
  const [category, setCategory] = useState<Category | null>(initialCategory)
  const [missing, setMissing] = useState<Required>({ address: false, category: false })
  // 주소 검색이 오래 걸리면(잠든 서버가 깨어나는 중) 버튼 문구를 "서버 준비 중…"으로 바꾼다
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => setSlow(true), SLOW_SEARCH_MS)
    return () => {
      window.clearTimeout(timer)
      setSlow(false)
    }
  }, [loading])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (loading) return
    const next = { address: !address.trim(), category: !category }
    setMissing(next)
    if (next.address || next.category || !category) return // 누락 시 진행 차단 (F-01)
    onSubmit(address.trim(), category)
  }

  const ready = address.trim() !== '' && category !== null
  const addressDescribedBy = cn(
    missing.address && 'address-required',
    apiError && 'address-api-error',
    'address-example',
  )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="diagnosis-form-title"
      className="w-full max-w-[530px] rounded-card bg-gray-0 p-8 shadow-card"
    >
      <h2 id="diagnosis-form-title" className="text-section font-bold text-gray-900">
        {T.cardTitle}
      </h2>
      <p className="mt-1 text-caption text-gray-600">{T.cardDescription}</p>

      {/* ① 진단 위치 입력 */}
      <div className="mt-7">
        <div className="flex items-center gap-3">
          <label htmlFor="address" className="flex items-center gap-2 text-body font-bold">
            <StepDot n={1} />
            {T.addressLabel}
          </label>
          {missing.address && (
            <p id="address-required" role="alert" className="text-micro text-danger">
              {T.required}
            </p>
          )}
        </div>
        <div
          className={cn(
            'mt-3 flex h-12 items-center gap-2 rounded-full border-[1.5px] bg-gray-0 pr-1.5 pl-4 motion-colors focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-500/30',
            missing.address || apiError ? 'border-danger' : 'border-blue-500',
          )}
        >
          <MapPin className="size-5 shrink-0 text-gray-900" aria-hidden="true" />
          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              if (missing.address) setMissing((m) => ({ ...m, address: false }))
              onChange?.()
            }}
            placeholder={T.addressPlaceholder}
            aria-invalid={missing.address || !!apiError}
            aria-describedby={addressDescribedBy}
            className="h-full min-w-0 flex-1 bg-transparent text-body text-gray-900 outline-none placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label={T.searchButton}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:text-gray-600"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
        </div>
        {/* 입력칸 아래 안내·오류는 같은 들여쓰기·8px 간격 */}
        {apiError && (
          <p id="address-api-error" role="alert" className="mt-2 pl-4 text-caption text-danger">
            {apiError}
          </p>
        )}
        <p id="address-example" className="mt-2 pl-4 text-micro leading-relaxed text-gray-600">
          {T.addressExample}
          <span className="block">{T.addressFloorHint}</span>
        </p>
        {children}
      </div>

      {/* ② 업종 선택 */}
      <div className="mt-7">
        <div className="flex items-center gap-3">
          <span id="category-label" className="flex items-center gap-2 text-body font-bold">
            <StepDot n={2} />
            {T.categoryLabel}
          </span>
          {missing.category && (
            <p id="category-required" role="alert" className="text-micro text-danger">
              {T.required}
            </p>
          )}
        </div>
        <div
          role="group"
          aria-labelledby="category-label"
          aria-describedby={missing.category ? 'category-required' : undefined}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c.id]
            const selected = category === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCategory(c.id)
                  if (missing.category) setMissing((m) => ({ ...m, category: false }))
                  onChange?.()
                }}
                // 선택 카드: 고르면 파란 테두리 2px·옅은 파란 바탕·체크 표시 (색만으로 구분하지 않게 체크 아이콘)
                className={cn(
                  'relative flex h-14 items-center justify-center gap-2 rounded-control border-2 text-body font-semibold motion-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                  selected
                    ? 'border-blue-500 bg-blue-100 text-blue-700'
                    : missing.category
                      ? 'border-danger bg-gray-0 text-gray-900 hover:bg-gray-100'
                      : 'border-gray-300 bg-gray-0 text-gray-900 hover:border-blue-500/50 hover:bg-gray-100',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {c.label}
                {selected && (
                  <CircleCheck
                    className="absolute top-1/2 right-3 size-5 -translate-y-1/2 fill-blue-600 text-gray-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'group mt-9 flex h-12 w-full items-center justify-center gap-2 rounded-full text-body font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait',
          'transition-[color,background-color,transform] duration-(--duration-fast) ease-(--ease-out-soft)',
          ready
            ? 'bg-blue-600 text-white hover:bg-blue-700 motion-safe:enabled:hover:-translate-y-px motion-safe:enabled:active:translate-y-0 motion-safe:enabled:active:scale-[0.98]'
            : 'bg-blue-100 text-gray-600',
        )}
      >
        {loading ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            <span role="status">{slow ? T.serverWaking : T.searching}</span>
          </>
        ) : (
          <>
            {T.submit}
            <ArrowRight className={cn('size-5', ready && 'arrow-nudge')} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-micro text-gray-600">{T.scope}</p>
    </form>
  )
}

function StepDot({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-micro font-bold text-white"
    >
      {n}
    </span>
  )
}
