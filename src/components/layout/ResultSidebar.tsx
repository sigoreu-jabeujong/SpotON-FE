import { Check, ClipboardList, Download, MapPin, Search, type LucideIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CATEGORIES, RESTAURANT_SUB_CATEGORIES } from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { scrollBehavior } from '../../constants/motion'
import { ANALYSIS_SECTIONS, RESULT_STEPS, ROUTES } from '../../constants/routes'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { cn } from '../../utils/cn'
import Logo from '../common/Logo'

const STEP_ICON: Record<number, LucideIcon> = {
  1: MapPin,
  2: Search,
  3: ClipboardList,
  4: Download,
}

/** 현재 경로 → 진행 중인 단계 번호 */
function currentStepOf(pathname: string): number {
  return RESULT_STEPS.find((s) => s.path === pathname)?.step ?? 2
}

/** 결과 화면 왼쪽 고정 사이드바: 로고 + STEP 01~04 진행 표시 */
export default function ResultSidebar({ activeSection }: { activeSection: string | null }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { query, search } = useDiagnosisQuery()
  const currentStep = currentStepOf(pathname)
  const onAnalysis = pathname === ROUTES.analysis

  const categoryLabel = CATEGORIES.find((c) => c.id === query.category)?.label
  const subLabels = RESTAURANT_SUB_CATEGORIES.filter((s) => query.subCategories.includes(s.id))
    .map((s) => s.label)
    .join('·')

  /** 같은 페이지 안에서는 부드럽게 스크롤하고, 섹션 제목으로 키보드 초점을 옮긴다 */
  const goToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!onAnalysis) return // 다른 화면이면 링크 이동 → AnalysisPage가 #해시로 스크롤
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    el.focus({ preventScroll: true })
    navigate({ search, hash: `#${id}` }, { replace: true, preventScrollReset: true })
  }

  return (
    <aside className="sticky top-0 flex h-screen w-sidebar shrink-0 flex-col border-r border-gray-300 bg-gray-0">
      <div className="border-b border-gray-300 px-7 py-6">
        <Logo />
      </div>

      <nav aria-label={MESSAGES.layout.stepsNav} className="flex-1 overflow-y-auto px-7 py-8">
        <ol className="flex flex-col">
          {RESULT_STEPS.map((step, index) => {
            const done = step.step < currentStep
            const current = step.step === currentStep
            const Icon = done ? Check : STEP_ICON[step.step]
            const isLast = index === RESULT_STEPS.length - 1
            return (
              <li key={step.step} className="relative flex gap-3 pb-7 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-9 bottom-1 left-[15px] w-px bg-gray-300"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full motion-colors',
                    done || current ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600',
                  )}
                >
                  <Icon className="size-4" strokeWidth={done ? 3 : 2} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={{ pathname: step.path, search }}
                    aria-current={current ? 'step' : undefined}
                    className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    <span
                      className={cn(
                        'block text-micro font-semibold motion-colors',
                        done || current ? 'text-blue-700' : 'text-gray-600',
                      )}
                    >
                      STEP {String(step.step).padStart(2, '0')}
                      {done && <span className="sr-only"> {MESSAGES.layout.stepDone}</span>}
                      {current && <span className="sr-only"> {MESSAGES.layout.stepCurrent}</span>}
                    </span>
                    <span
                      className={cn(
                        'block text-body font-bold motion-colors group-hover:text-blue-700',
                        current ? 'text-blue-700' : 'text-gray-900',
                      )}
                    >
                      {step.label}
                    </span>
                  </Link>

                  {step.step === 1 && (query.address || categoryLabel) && (
                    <dl className="mt-2 space-y-1 text-caption text-gray-600">
                      <dt className="sr-only">{MESSAGES.layout.addressTerm}</dt>
                      <dd className="break-keep">{query.address}</dd>
                      <dt className="sr-only">{MESSAGES.layout.categoryTerm}</dt>
                      <dd>
                        {categoryLabel}
                        {subLabels && ` (${subLabels})`}
                      </dd>
                    </dl>
                  )}

                  {step.step === 2 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {ANALYSIS_SECTIONS.map((section) => {
                        const active = activeSection === section.id
                        return (
                          <li key={section.id}>
                            <Link
                              to={{ pathname: ROUTES.analysis, search, hash: `#${section.id}` }}
                              onClick={(e) => goToSection(e, section.id)}
                              aria-current={active ? 'location' : undefined}
                              className={cn(
                                'block rounded border-l-2 py-0.5 pl-2.5 text-caption motion-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                                active
                                  ? 'border-blue-500 font-semibold text-blue-700'
                                  : 'border-transparent text-gray-600 hover:text-blue-700',
                              )}
                            >
                              {section.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}
