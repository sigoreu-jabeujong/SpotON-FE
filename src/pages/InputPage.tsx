import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  CATEGORIES,
  DEFAULT_AREA,
  DEFAULT_INCLUDE_UNKNOWN,
  DEFAULT_RADIUS,
  type Category,
} from '../constants/diagnosis'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { toDiagnosisSearch } from '../hooks/useDiagnosisQuery'

type Errors = { address?: string; category?: string }

// TODO: 디자인 시안 반영 (② 주소·업종 입력). 주소 검색(geocode API) 연동은 API 명세 확정 후
export default function InputPage() {
  const navigate = useNavigate()
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [errors, setErrors] = useState<Errors>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!address.trim()) next.address = MESSAGES.input.addressRequired
    if (!category) next.category = MESSAGES.input.categoryRequired
    setErrors(next)
    if (Object.keys(next).length > 0) return // 누락 시 다음 단계 진행 차단 (F-01)

    const search = toDiagnosisSearch({
      address: address.trim(),
      category,
      subCategories: [],
      radius: DEFAULT_RADIUS,
      asOf: null,
      area: DEFAULT_AREA,
      franchise: 'all',
      includeUnknown: DEFAULT_INCLUDE_UNKNOWN,
    })
    navigate({ pathname: ROUTES.analysis, search })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">계약 전, 이 자리를 확인하세요</h1>

      <label htmlFor="address" className="mt-6 block text-sm font-medium">
        점포 주소
      </label>
      <input
        id="address"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value)
          setErrors((p) => ({ ...p, address: undefined }))
        }}
        placeholder="서울 마포구 와우산로 21"
        aria-invalid={!!errors.address}
        aria-describedby={errors.address ? 'address-error' : undefined}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      {errors.address && (
        <p id="address-error" role="alert" className="mt-1 text-sm text-red-600">
          {errors.address}
        </p>
      )}

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">업종</legend>
        <div className="mt-2 flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => {
                setCategory(c.id)
                setErrors((p) => ({ ...p, category: undefined }))
              }}
              className={`rounded-full border px-4 py-2 text-sm ${category === c.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {errors.category && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.category}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="mt-8 w-full rounded-lg bg-gray-900 py-3 font-semibold text-white"
      >
        진단하기
      </button>
    </form>
  )
}
