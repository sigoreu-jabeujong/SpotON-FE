import { QueryClient } from '@tanstack/react-query'

/** 서버 데이터 캐시 설정. 같은 조건은 5분 동안 다시 요청하지 않는다 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
