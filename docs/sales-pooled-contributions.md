# 전체 점포 수 기준 평균 구성 그래프

2026-11-17 사용자 직접 선택: **각 리스트 매출 ÷ 전체 점포 수**. BE #208의 같은 분기 유효 목록에서 대표 평균은 총매출/총점포 수, 각 막대는 해당 원자료 매출/같은 총점포 수다. 막대의 정확한 원값 합이 대표 평균이며, 원 단위 표시 반올림으로 눈에 보이는 정수의 합은 미세하게 다를 수 있다.

`per_store_average.metric`을 대표로 표시하고 새 `contributions`의 서버 금액을 막대에 쓴다. numerator는 해당 source metric.value, denominator는 같은 summary.total_store_count, 키는 상권·업종·분기와 일치해야 한다. 부모 included 항목 수와 목록도 일치시킨다. 기여 자료가 없으면 FE가 계산해 만들지 않는다. Number는 막대 길이에만 사용한다. 중앙값/사분위/분산 라벨은 사용하지 않는다. 이전 개별 상권 자체 점포당 금액은 원자료 목록에 유지한다.

서비스 색상·생활인구 박스/설명/출처·요청한 문구 제거를 유지한다. 새 막대는 상하/Home/End 선택과 정확한 서버 금액/공통 분모를 보여주며 인쇄는 모든 막대를 표시한다. BE 먼저 배포하고 정상 develop/main PR·CI 후 공개 화면을 검증한다. 세부 설계와 실제 Claude 검토는 BE의 `docs/designs/feat208-sales-pooled-contributions.md`를 따른다.
