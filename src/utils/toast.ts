import { MESSAGES } from '../constants/messages'

export type ToastTone = 'success' | 'error'
export type ToastInput = { tone: ToastTone; message: string }

/** 알림이 떠 있는 시간 — 성공은 짧게, 실패는 읽고 따라 할 수 있게 조금 길게 (둘 다 2~3초) */
export const TOAST_DURATION_MS: Record<ToastTone, number> = { success: 2500, error: 3000 }

const T = MESSAGES.toast

/** 상권명·업종 복사 결과 → 알림 */
export function copyToast(ok: boolean): ToastInput {
  return ok ? { tone: 'success', message: T.copyDone } : { tone: 'error', message: T.copyFailed }
}
