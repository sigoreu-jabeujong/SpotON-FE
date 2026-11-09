import { Navigate, NavLink, Outlet } from 'react-router'
import { RESULT_STEPS, ROUTES } from '../../constants/routes'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'

/** 결과 화면(③~⑦) 공통 틀: 진단 조건이 없으면 입력 화면으로 돌려보낸다 */
export default function ResultLayout() {
  const { query, isReady, search } = useDiagnosisQuery()

  if (!isReady) return <Navigate to={ROUTES.input} replace />

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <p className="text-sm text-gray-600">
        {query.address} · 반경 {query.radius}m
      </p>
      <nav aria-label="진단 단계" className="mt-3 flex gap-2 overflow-x-auto">
        {RESULT_STEPS.map((step) => (
          <NavLink
            key={step.path}
            to={{ pathname: step.path, search }}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1 text-sm ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100'}`
            }
          >
            {step.label}
          </NavLink>
        ))}
      </nav>
      <section className="mt-4">
        <Outlet />
      </section>
    </div>
  )
}
