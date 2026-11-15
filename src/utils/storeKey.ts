/**
 * 점포 식별값 — 인허가 원천(source) + 관리번호(license_no).
 * 관리번호는 원천(일반음식점·휴게음식점)마다 따로 매겨져 같은 번호가 있을 수 있으므로 단독으로 쓰지 않는다.
 * BE DB가 UNIQUE(source, license_no)이고 source에는 ":"가 없어 한 응답 안에서 겹치지 않는다.
 * 이력·주변 점포·시점 조회·지도 목록의 React key, 선택 비교, 중복 처리에 같은 규칙으로 쓴다.
 * 관리번호가 같아도 원천이 다르면 서로 다른 점포다 — 합치지 않는다.
 */
export function storeKey(source: string, licenseNo: string): string {
  return `${source}:${licenseNo}`
}
