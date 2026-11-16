import type { Category } from '../constants/diagnosis'

export type SupportLinksParams = {
  /** 자치구. 지정하면 그 지역 센터를 앞에 정렬 */
  sigungu?: string | null
  category?: Category | null
}

export type SupportLink = {
  id: string
  org_name: string
  title: string
  description: string
  /**
   * 전화번호 (선택) — 지금 BE는 보내지 않고 description 안에 "전화: …"로 준다.
   * 나중에 BE가 이 필드를 주면 화면은 이 값을 먼저 쓴다 (utils/phone linkPhone)
   */
  phone?: string | null
  url: string
  type: 'consulting' | 'support_program'
  region: string
  /** 링크 확인일 YYYY-MM-DD */
  last_checked: string
}

/** GET /api/support-links 응답 data */
export type SupportLinks = { links: SupportLink[] }
