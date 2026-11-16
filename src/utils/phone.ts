/**
 * 상담센터 연락처 — 지금 BE는 전화번호를 description 안에 "전화: 02-323-2915"처럼 보낸다.
 * 나중에 BE가 phone 필드를 주면 그 값을 먼저 쓴다 (요청 형식은 그대로).
 */

/** "전화"·"연락처"·"Tel" 뒤의 국내 전화번호 (지역번호·휴대전화·1588 같은 대표번호) */
const PHONE_AFTER_LABEL =
  /(?:전화|연락처|tel)\s*(?:번호)?\s*[:：]?\s*((?:0\d{1,2}|1\d{3})-\d{3,4}(?:-\d{4})?)/i

/** description 글에서 전화번호를 꺼낸다 (없으면 null). 글자 그대로 — 다른 형식으로 바꾸지 않는다 */
export function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null
  const m = PHONE_AFTER_LABEL.exec(text)
  if (!m) return null
  const phone = m[1]
  // 0으로 시작하면 지역·휴대전화(3묶음), 1로 시작하면 대표번호(2묶음)만 받는다
  const parts = phone.split('-')
  if (phone.startsWith('0') ? parts.length !== 3 : parts.length !== 2) return null
  return phone
}

/** 블록에 보여 줄 번호 — phone 필드가 있으면 그 값, 없으면 description에서 꺼낸 값 */
export function linkPhone(link: { phone?: string | null; description?: string | null }) {
  const direct = link.phone?.trim()
  return direct ? direct : extractPhone(link.description)
}

/** tel: 링크 주소 (숫자만) */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
