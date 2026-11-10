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
  url: string
  type: 'consulting' | 'support_program'
  region: string
  /** 링크 확인일 YYYY-MM-DD */
  last_checked: string
}

/** GET /api/support-links 응답 data */
export type SupportLinks = { links: SupportLink[] }
