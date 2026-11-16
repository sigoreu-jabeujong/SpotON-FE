# 브랜드·프랜차이즈 기능 제거

2026-11-17. Codex 의존성 검토 후 구현.

브랜드 소속/체인 조건, 표·지도 소속 표시, 상태 확인 API 요청 및 경고, PDF·AI의 브랜드 주의사항을 제거한다. 업종·반경·면적·기준 시점·주소 검증과 일반 v2 분석 경로는 유지한다. 점포 상세 표와 지도는 실제 응답의 기준 시점을 표시한다. 과거 브랜드 조건이 있는 URL은 나머지 조회 조건만 복원하며 다음 공유 URL에 브랜드 조건을 넣지 않는다.

API 공통 입력: lat/lng/category/radius/sub_category/as_of/area/include_unknown_area. 브랜드 입력은 더 이상 보내지 않는다. v2 점포는 기존 source+license_no, current_status, 날짜/기간, 위치/면적을 유지하며 brand/operation은 없다. 브랜드 상태 API는 삭제됐다. AI 문맥 검증은 날짜·조건·근거/생활인구 및 문단 검증을 유지하고 판정 세대 비교만 제거한다.

BE 삭제 범위 및 DB 보존 근거: SpotON-BE/docs/designs/feat226-remove-brand-feature.md.
