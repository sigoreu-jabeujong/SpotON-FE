# 생활인구 공개자료·주야간 비교 실제 연동 (FE #73)

2026-11-16 사용자가 BE API 구현·FE 수정·배포를 승인했다. BE #180 / 설계 #178의 GET `/api/v2/population-reference`를 사용한다. 기존 v1/v2 점포 API·AI는 유지하고 부분 숫자를 living_pop.total/구형 RiskIndicator에 넣지 않는다. 첫 구현에서 이 자료는 AI 해석에 포함되지 않는다.

## 요청과 시점

`getPopulationReference`는 lat,lng,radius,category,sub_category,as_of만 projection한다. 경로는 프로필과 관계없이 `/v2/population-reference`(client의 `/api` prefix 별도)다. brand/area/franchise/include는 보내지 않는다. 기본 radius500·빈sub/생략month를 canonical key로 구분하고 sub 순서만 다른 요청은 같게 취급한다. 공간/반경/업종/월 변경 시 새 key와 AbortSignal로 이전 요청을 취소하며 stale 응답은 새 조건에 섞지 않는다.

T는 전역 점포 원천일과 허용 분석월을 따르고 관측일은 T가 속한 월 안의 최신 제공일이다. 월내 자료 없음과 같은날 복수 버전 pending을 키/연결 오류로 설명하지 않는다. 서로 다른 날짜/원천의 D/N을 조합하지 않는다. 보고서는 같은 hook/query key의 서버 응답을 사용하고 token으로 위치/구성의 동일성을 추정하지 않는다.

## 표시

기본 강조 원천은 내국인이고 long/short는 별도 카드다. local이 없어도 외국인 값으로 대체하지 않는다. partial은 공개된 동일 구성의24시간 산술이며 전체 인구·고객·방문객 수가 아니다. 배수/비중·사용 구성/파일 내 후보 구성·사용/선택 격자와 한계를 보인다. source별 no_data는 해당 source만 비운다. 합/평균은 인원수 아님 상세 영역에서만 표시하고 인원 단위를 붙이지 않는다.

숫자는 서버 decimal 문자열/display 그대로다. exact_zero와 반올림0, zero_night_denominator·zero_total을 구분한다. 비공개/누락을0으로 채우지 않고 외삽/반경 전체 coverage를 만들지 않는다. 기존 null 카드는 전체 생활인구라고 구분하고 새 부분 카드와 혼동하지 않도록 한다. 제외 패턴이 주간/야간 한쪽에 있으면 편향 안내를 추가한다. 격자 날짜/행정동 합산 미확인과 전체 반경 대표성의 한계를 유지한다.

## mock·오류·배포

새 인구 경로만 v2 mock 예외로 허용하며 기존 브랜드/점포v2 mock 차단을 바꾸지 않는다. synthetic fixture는 BE schema/정수 산술로 생성했고 실자료가 아니다. Production의 VITE_USE_MOCK=false 빌드에서는 mock 모듈을 제외한다. 오류/로딩은 인구 블록 안에서 처리하고 기존 점포/AI와 분리한다. 모바일/인쇄는 같은 표시 컴포넌트를 쓴다.

최종 테스트/실제 브라우저/Claude 검토·BE 준비 후 develop→main release/Vercel 배포 상태는 실제 실행 후 기록한다. 로컬 .env/공개키·기존 서버·사용자 추가 폴더는 수정하지 않는다. 사용자 최신 요청으로 과거 CLAUDE의 FE 수정/공개전 확인 대기 범위는 이번 구현·배포에 한해 승인됐다.

## 보고서·캡처 보완과 검증

Report만 useReportData(true)로 인구를 조회하고 Share 요약이미지는 기존useReportData()로 인구 요청 없이 동작한다. 핵심 결과 loading과별도의captureLoading으로 인구fetch중PDF버튼을비활성화하며다른표는계속보인다. populationEnabled=false인경우블록을생략한다. 카드/보고서 View 각각렌더오류경계를두고새응답에서복구한다. 자동재시도는새선택endpoint에한해사용하지않고오류블록의다시시도버튼을사용한다.

FE178단위+profile4개,실제QueryObserver의취소/새key격리/disabled상태,실제복제DB와브라우저의표시·390/360overflow0·보고서보류/인쇄버튼·PDF·새API실패에도기존지표유지를확인했다. production/preview실제빌드와production의가상fixture제거도확인했다. 실제Claude검토·Codex수정/재검토와BE전체검사·CI·배포기록은BE #180과각PR의실제실행결과를따른다. 공개서버반영완료는배포확인전표시하지않는다.
