import { createContext, useContext } from 'react'
import type { ToastInput } from '../utils/toast'

/** 알림을 띄우는 함수 (ToastProvider가 채운다). Provider 밖에서는 아무 일도 하지 않는다 */
export const ToastContext = createContext<(toast: ToastInput) => void>(() => {})

/** 사용자가 누른 일의 결과(저장·복사 완료/실패)를 화면 아래 짧은 알림으로 보여준다 */
export function useToast() {
  return useContext(ToastContext)
}
