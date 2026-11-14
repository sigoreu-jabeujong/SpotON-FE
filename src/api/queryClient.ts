import { QueryClient } from '@tanstack/react-query'
import { shouldRetryQuery } from './retry'

/** 서버 데이터 캐시 설정. 같은 조건은 5분 동안 다시 요청하지 않는다 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // 시간 초과·연결 실패만 1번 자동 재시도 (api/retry.ts). mutation(주소 검색·AI 해석)은 기본값대로 재시도 없음
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
  },
})

/** 받아 둔 AI 해석은 화면을 옮겨도(진단서·요약 이미지) 30분 동안 남긴다 — 다시 요청하지 않기 위해 */
queryClient.setQueryDefaults(['risk', 'interpret'], { gcTime: 30 * 60 * 1000 })
