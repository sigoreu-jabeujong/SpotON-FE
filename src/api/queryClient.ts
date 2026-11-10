import { QueryClient } from '@tanstack/react-query'
import { ApiRequestError } from './client'

/** 400번대 오류(주소 없음·서울 외·범위 밖 등)는 다시 요청해도 같으므로 재시도하지 않는다 */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiRequestError && error.status !== null && error.status < 500) return false
  return failureCount < 1
}

/** 서버 데이터 캐시 설정. 같은 조건은 5분 동안 다시 요청하지 않는다 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
})

/** 받아 둔 AI 해석은 화면을 옮겨도(진단서·요약 이미지) 30분 동안 남긴다 — 다시 요청하지 않기 위해 */
queryClient.setQueryDefaults(['risk', 'interpret'], { gcTime: 30 * 60 * 1000 })
