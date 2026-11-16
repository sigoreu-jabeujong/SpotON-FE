# 폐업·동일 상세 위치 이력 (FE108 / BE213)

사용자 구현·배포 승인으로 BE209 설계를 적용한다. 새 GET /api/v2/stores/location-history를 사용하며 원천상 closed 및 선택 층(호수가 있으면 호수까지) 일치만 표시한다. 기존 반경/과거 시점/Risk 집합은 유지한다.

입력 미확인·명시 층 부재는 조회하지 않고 상세 입력을 안내한다. 범위는 URL historyScope, 물리 건물 검증 요구는 historyIdentity에 저장한다. 기본 주소 범위 조회는 물리적 같은 건물·공실 증명이 아니다. 건물 근거가 미확보면 verified_building은 pending이며 주소 범위로 자동 대체하지 않는다.

메인 표·보고서·이미지는 같은 새 훅/계수/폐업일 정렬/미확인 안내를 사용한다. 구 AI의 건물 전체 history 선택은 새 FE의 요청/캐시에서 생략한다. 새 폐업 이력 AI 집계를 연결한 것으로 표시하지 않는다. source 기준일·원본/환경·Production v2는 유지한다. BE 선배포·실제 API 검증 후 FE 정상 release한다.
