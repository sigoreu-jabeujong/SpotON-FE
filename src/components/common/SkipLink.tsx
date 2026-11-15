import { MESSAGES } from '../../constants/messages'

/** 본문의 id (페이지마다 <main id={MAIN_ID} tabIndex={-1}>) */
export const MAIN_ID = 'main-content'

/**
 * 본문 바로가기 — 키보드 첫 Tab에서 나타나고, 누르면 반복 메뉴를 건너뛰어 본문으로 간다 (KWCAG 반복 영역 건너뛰기).
 * 평소에는 화면 읽기 프로그램용으로만 보인다.
 */
export default function SkipLink({ target = MAIN_ID }: { target?: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only z-50 rounded bg-blue-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {MESSAGES.layout.skipToContent}
    </a>
  )
}
