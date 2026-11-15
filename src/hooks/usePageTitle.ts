import { useEffect } from 'react'

/** 브라우저 탭 제목 (화면 읽기 프로그램이 페이지가 바뀐 것을 알 수 있게) */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
