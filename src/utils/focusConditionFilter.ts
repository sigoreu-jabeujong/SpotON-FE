import { MESSAGES } from '../constants/messages'
import { scrollBehavior } from '../constants/motion'

/**
 * 같은 화면(STEP 02)의 조회 조건 폼으로 옮겨 준다 — 빈 결과·범위 밖 시점에서 "조건 바꾸기".
 * 폼을 화면에 보이게 스크롤하고 첫 선택지로 키보드 초점을 옮긴다. 폼이 없으면 아무 일도 하지 않는다
 */
export function focusConditionFilter(): void {
  const form = document.querySelector<HTMLFormElement>(
    `form[aria-label="${MESSAGES.filter.title}"]`,
  )
  if (!form) return
  form.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
  form
    .querySelector<HTMLElement>('input:checked, input, select, button')
    ?.focus({ preventScroll: true })
}
