/** BE(support_catalog)가 관할 지역센터 카드 제목 끝에 붙여 보내는 문구 */
export const DISTRICT_TITLE_SUFFIX = ' 지역센터 연락처 안내'

/**
 * 관할 지역센터 카드 제목에서 끝의 " 지역센터 연락처 안내"를 떼어 센터 이름만 남긴다.
 * 끝이 정확히 일치할 때만 떼고, 떼고 나서 비면(문구만 있으면) 서버 제목 그대로
 */
export function supportDisplayTitle(title: string): string {
  if (!title.endsWith(DISTRICT_TITLE_SUFFIX)) return title
  const name = title.slice(0, -DISTRICT_TITLE_SUFFIX.length).trim()
  return name || title
}
