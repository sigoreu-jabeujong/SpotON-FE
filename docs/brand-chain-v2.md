# 브랜드·체인 v2 FE 연동 (#59)

기준 FE d02a8cf, BE a0626f3(앱 코드 cdc5513). 사용자가 앞선 FE 수정 범위 확인 뒤 다음 단계 진행을 지시해 이 연동을 수행한다. 새 FE 작업 브랜치에서만 구현하며 원래 .env·미추적 자료·기존5173 서버·Render/운영 BE·공개 배포는 유지한다. 로컬 테스트8001은 schema0012·publication1세대·source_drift=false이며 현재 검증 가능한 서버다.

## 1. 프로필과 요청 계약

VITE_ANALYSIS_API_VERSION=v1|v2를 빌드/개발 프로세스에서 명시한다. **값이 없거나 빈 값이면 v1**이며 기존 운영 Render0011의 동작을 유지한다(공개 배포 설정은 바꾸지 않는다). 그 밖의 모르는 값은 **`vite.config.ts`에서 `loadEnv`로 읽어 검사해 `npm run build`/개발 서버 시작 자체를 실패**시킨다(브라우저 모듈 로드 시점의 throw만으로는 빌드가 통과하고 배포된 화면 전체가 빈 화면이 되므로 그것만으로 두지 않는다). 앱 코드는 설정을 읽는 한 곳(모듈)에서 같은 값을 다시 확인하는 방어선만 둔다 — 화면 일부만 v2로 동작하는 혼합 상태를 만들지 않는다. 프로필은 빌드 시점 상수이므로 한 실행 안에서 바뀌지 않으며 **URL 값으로 프로필을 바꾸지 않는다**(아래 analysisVersion은 링크 표시용일 뿐이다). v2에서는 history/nearby/snapshot/activity/risk/AI를 모두 `/api/v2`로 전환하고 `/api/v2/brands/status`는 v2에서만 부른다(v1에서는 호출하지 않음). geocode/data-range/support/health는 기존 경로를 유지한다. v2 실패를 v1으로 자동 재시도하지 않는다.

요청 파라미터 타입은 **v1/v2를 별도 타입(구별 가능한 union)과 별도 생성 함수**로 둔다. 하나의 CommonQueryParams에 선택 필드를 덧붙이면 현재 `toCommonQueryParams`처럼 franchise/include_unknown_franchise가 항상 채워지는 코드가 v2로 새어 나갈 수 있으므로, v2 타입에는 legacy franchise/include_unknown_franchise/include_unknown 필드가 아예 없게 해 타입 검사로 막는다(v1 타입에는 brand_* 필드가 없음). v2는 brand_scope/brand_unknown/brand_evidence를 항상 보내고, brand_time_basis=observed_record·operation_type=any도 **항상 명시**한다(B2 결정). Risk GET과 AI query는 같은 v2 builder 결과를 쓴다. 면적 include_unknown_area는 브랜드 조건과 독립이다. 범위가 all이어도 brand_unknown을 항상 명시해 422를 피한다. 기본 all/include/include_estimates다.

URL 키(B2 확정, 기존 address/category/sub/radius/asOf/area/franchise/includeUnknown/lat/lng/bk/floor/gu와 겹치지 않음):
- `analysisVersion=v2` — v2 프로필이 만드는 canonical URL에 **항상** 넣는 표시. 프로필을 고르지 않으며, v1 배포가 v2 링크를 알아보는 데만 쓴다(기본값 브랜드 조건이라 brand* 키가 생략돼도 알아볼 수 있게).
- `brandScope`(all/chain/non_chain)·`brandUnknown`(include/exclude)·`brandEvidence`(include_estimates/confirmed_only) — (정정, 실제 구현) v2 canonical URL은 기본값이어도 세 키를 **항상** 적는다(`toDiagnosisSearch`). 의미는 같고, 기본값 생략 링크도 파서가 기본값으로 읽는다.
- `areaUnknown`(false일 때만) — v2의 면적 정보 없음. **기존 `includeUnknown` 키는 v1에서 "면적+가맹 미확인"을 함께 뜻했으므로 v2 URL에서 면적 전용 의미로 재사용하지 않는다**(`franchise`를 재사용하지 않는 것과 같은 이유). v2 canonical URL에는 `franchise`·`includeUnknown`을 남기지 않고, 이 둘은 아래 기존 URL 변환의 입력으로만 읽는다.

허용되지 않은 값은 기본값으로 되돌리고 "조건을 기본값으로 바꿨다"는 안내를 보여 준다(조용히 바꾸지 않는다). 안내 사유는 canonical URL로 바꾸기 **전에** 파싱 결과에 담아 화면 상태로 넘긴다(현재 `updateQuery`는 `toDiagnosisSearch`로 URL을 다시 만들어 모르는 키를 지우므로, 다시 만든 뒤에는 무엇이 바뀌었는지 알 수 없다).

기존 URL 변환(v2 프로필에서, `analysisVersion`이 없는 링크만):
- franchise=franchise → chain/exclude/include_estimates (v1에서도 include_unknown_franchise=false였으므로 같은 방향).
- franchise=independent → **non_chain/exclude(확인된 비체인, 현재 0건)**. 기존 "개인 매장" 확정 의미를 재사용하지 않으며, 0건 화면에 "예전 '개인 매장' 조건은 확인된 비체인 근거만 남는 조건으로 바뀌었고 현재 확인 근거가 없어 0곳"이라는 변환 안내와 비체인/미확인 포함으로 바꾸는 선택지를 함께 보여 준다.
- 기존 includeUnknown 값은 v2에서 **면적 정보 없음(`areaUnknown`/include_unknown_area)에만** 옮긴다. franchise=all + includeUnknown=false라도 brand_unknown은 기본 include로 둔다(미일치 점포 대부분이 unknown이라 exclude로 옮기면 대부분 점포가 조용히 사라짐). 이 차이는 화면 조건 요약에 드러낸다.
- `analysisVersion=v2`가 있거나 새 brand* 키가 하나라도 있으면 그 링크는 v2 링크로 보고 legacy franchise/includeUnknown 변환을 하지 않는다(섞여 있으면 brand*·areaUnknown 우선, legacy 키는 무시+안내). v2 URL을 다시 만들 때 legacy 키는 남기지 않는다.

v1 프로필은 brand* 키를 요청에 넣지 않는다(v1 BE가 brand_*를 422로 거절). v1 배포에서 `analysisVersion=v2`·brand*·areaUnknown 중 하나라도 있는 링크를 열면, chain→franchise처럼 의미가 다른 v1 조건으로 바꾸지도 않고 **필터 없는 수치를 자동으로 보여 주지도 않는다**(v2의 areaUnknown=false를 v1 includeUnknown=false로 옮기면 가맹 미확인까지 빠지는 등 의미가 달라짐). 결과 섹션 대신 "이 화면은 브랜드·체인 조건을 지원하지 않습니다" 안내와 사용자가 직접 누르는 링크만 보여 준다. (정정, 실제 구현) 링크는 "조건 다시 선택하기"이며 v2 전용 키를 지운 v1 조건으로 **입력 화면**(`/diagnose`)으로 간다. 결과 화면으로 곧바로 가지 않으므로, 사용자가 조건을 확인하기 전에는 필터 없는 수치가 나오지 않는다. 이 판정은 URL을 canonical로 다시 만들기 전에 한다(다시 만들면 v1 파서가 모르는 키를 지워 버림).

v2+mock은 계약을 흉내 낸 v1 자료를 반환하거나 실서버로 조용히 우회하지 않는다. v2 mock이 준비되지 않은 경로는 고정 연결 오류로 안전하게 실패한다. `VITE_REAL_API_PATHS`는 사람이 명시한 경로만 실제 BE로 보내는 기존 규칙이므로 v2 경로도 **목록에 정확히 적힌 경우에만** 실제 BE로 보내고, `/api/stores/nearby` 같은 v1 항목이 `/api/v2/stores/nearby`에 접두사로 맞아 우회되지 않게 정확 일치로 비교한다. 정확 일치 규칙은 **v2 경로에만** 새로 적용하고 v1 경로의 기존 비교 방식은 바꾸지 않는다(기존 mock 개발 환경 회귀 방지). 목록 항목의 표기(`/api` 접두사 포함 여부)는 현재 `src/api/client.ts`와 같은 형식을 따르고, 쿼리 문자열을 뗀 경로로 비교한다(B4). 실제 v2 검증 프로세스는 mock=false·baseURL=http://localhost:8001을 실행 환경에서만 지정한다. 원래 .env는 수정하지 않고 키/원문은 출력하지 않는다.

## 2. 타입과 표시

brand.status=estimated/unknown/conflict,근거/연도/월·operation.unknown과 meta.brand_classification/brand_filters/brand_counts를 타입으로 받는다. v2 점포에 legacy franchise를 만들어 넣지 않는다. 공통 표시 helper가 brand가 있으면 새 의미를 우선하고, legacy 행은 기존 표시를 유지한다. history의 current_status를 기존 화면이 사용하는 store_status로 변환하는 것은 표현 필드 호환 변환일 뿐 분류/계산이 아니다(유효 값 open/closed/other의 이름만 옮김). BE `ChainStore` 스키마(B1 확인)가 **필수**로 정한 필드 — source·license_no·category·sub_category·operating_period_status·current_status·brand(status 포함)·operation — 가 없거나 허용 값 밖이면(예: 모르는 current_status·brand.status) 다른 값으로 추정하지 않고 **그 응답 전체를 형식 오류**로 처리한다. 타입 선언만으로는 실행 중 값을 검사하지 못하므로 v2 응답은 런타임 검사 함수를 거친다. BE가 nullable로 둔 필드(좌표·distance_m·상호·개업/폐업일·기간·area_m2·floor_unit·location_match·brand 근거/연도/월)는 오류로 만들지 않고 기존 규칙대로 "정보 없음"·사유로 보여 준다. 특히 v2 이력의 location_match는 legacy 이력과 달리 null일 수 있으며, null을 'unverified(상세 위치 미확인)'로 바꾸지 않고 "정보 없음"으로 표시한다. 좌표 null 행은 목록·count에 그대로 두고 지도 점만 생략한다. 형식 오류는 해당 섹션에만 오류를 보여 주고 다른 지표는 유지한다.

화면/지도/진단서/요약에서 ‘브랜드·체인(추정)’·‘미확인’·‘근거 충돌’을 구분하고 계약·직영 운영/과거 소속은 미확인임을 표시한다. 근거별 이름/소진공 주소 대조·기준년도/월을 지원하고, unknown/conflict/stale/drift를 개인 매장으로 바꾸지 않는다. v2 필터는 전체/체인/비체인과 미확인 포함·근거 수준을 독립적으로 선택한다. ‘비체인’은 확인된 근거만 strict이며 현재0건이고,unknown include일 때는 미확인 포함임을 명시한다(non_chain/include를 '독립 점포' 목록으로 부르지 않음). confirmed_only/include에서는 추정 행이 필터상 미확인으로 포함되지만 행 표시는 원래대로 '브랜드·체인(추정)'을 유지하고, 그 차이를 조건 요약에 적는다. 새 필터 3종은 휴대폰 폭에서도 가로 넘침 없이 줄바꿈되고 각 선택지는 키보드로 고를 수 있어야 한다. 새 문구는 `src/constants/messages.ts`에, 선택 값은 `src/constants/diagnosis.ts`에 둔다.

status를 조회해 pending/estimate·source_drift·관측/부분 범위 안내를 제공한다. `/api/v2/brands/status` 실패는 상태 안내 영역에만 "상태 확인 실패"로 보이고 목록·지표를 막지 않는다(각 응답의 meta.brand_classification이 그 응답의 기준). status의 publication_counts는 저장 원천 기록 수이므로 현재 영업 점포 수나 분모로 표시하지 않는다. 같은 화면의 섹션 응답끼리 brand_classification.generation이 다르면 숫자를 섞어 설명하지 않고 "자료가 갱신 중이니 다시 불러오기" 안내와 수동 버튼을 보여 준다(BE 안내대로 같은 조회 재요청, 자동 반복 요청 없음). 필터 전 brand_counts와 필터 후 count를 합치거나 정확도로 바꾸지 않는다. pending/confirmed strict0건을 체인/점포 부재로 설명하지 않는다. 이력은 브랜드 필터 없이 지원 업종 전체를 보존한다.

## 3. AI·캐시·오류

AI는 수동 버튼으로만 같은 v2 Risk query/history를 POST한다. (정정, 실제 구현) `toRiskInterpretRequest`는 v1/v2 union(`CommonQueryParams`)을 받는다. 막는 방법은 두 가지다. 첫째, v2 타입은 legacy 필드가 `never`라 타입 검사에서 걸린다. 둘째, `postRiskInterpret`의 `validateAnalysisParams`가 프로필과 요청 형태가 다르거나 legacy 키가 섞이면 네트워크 전에 거절한다. 조건/주소/건물/층이 바뀌면 이전 요청을 취소한다(지금은 언마운트 때만 abort하므로 부모 key에 아래 baseline을 넣어 재마운트로 취소되게 한다). API 프로필과 brand 조건이 Risk·AI 캐시 query key에 포함된다.

**baseline**(캐시 key·부모 key용)은 FE가 계산하지 않은 값만 쓴다: API 프로필, 요청 조건(brand 조건 포함)·주소·건물 키·층호, Risk 응답 meta의 as_of·data_updated_at·data_version, meta.brand_classification의 generation·상태(pending/estimate)·source_drift. AI 캐시·진단서 재사용 키(`useCachedInterpretation` 포함)와 AiInterpretation 부모 key에 baseline을 넣는다.

**AI 응답 일치 검사**는 baseline 중 AI 응답에도 실제로 있는 항목만 비교한다: meta.as_of·meta.data_updated_at, meta.brand_classification의 generation·상태·source_drift, meta.brand_filters(면적·세부 업종 포함)를 비교한다. (정정, 실제 구현) brand_filters는 Risk meta와 AI meta를 **각각** 정규화한 요청 조건(`expectedBrandFilters`)과 비교한다. 둘 다 같은 요청과 일치해야 하므로 Risk와 AI도 같다. as_of·data_updated_at·generation·상태·source_drift는 Risk meta와 직접 비교한다. data_version은 AI에 없고(AI는 data_version_hash/context_hash만 줌) 서로 대응시킬 수 없으므로 일치 검사에 쓰지 않고 key에만 둔다. AI의 data_version_hash·context_hash·prompt_version은 비어 있지 않은지만 본다. 한쪽에 항목이 없거나 다르면 본문을 보여 주거나 캐시에 저장하지 않고 "자료가 갱신되어 다시 요청이 필요" 안내와 수동 버튼만 보여 준다(자동 재요청 없음). 비교는 **같은 직렬화 형식이 확인된 값끼리 문자열/값 그대로** 한다 — Risk와 AI의 as_of·data_updated_at 표기(날짜/월, 시간대 표기)와 v2 Risk meta.brand_filters 존재·키 순서·sub_category 순서가 같은지 확인되기 전에는 이 검사를 확정하지 않는다(B3). 표기가 다르면 FE가 형식을 맞추는 변환을 넣지 말고 BE에 같은 표기를 요청한다(형식 차이로 항상 불일치가 나면 v2 AI가 영구히 막힌다).

v2에서는 baseline이 Risk 응답에 의존하므로 **Risk가 로딩 중이거나 실패하면 AI 버튼을 비활성화하고 그 이유를 문구로 보여 준다**(v1은 기존 동작 유지). Risk가 다시 불러와져 baseline이 바뀌면 부모 key가 바뀌어 진행 중 AI 요청은 취소되고 결과는 버려진다 — 취소된 요청도 BE 한도에 집계될 수 있음을 안내 문구 없이 받아들이되, 자동 재요청은 하지 않는다. 개별 지표 숫자를 FE에서 다시 맞춰 보는 비교는 하지 않는다(서버가 같은 DB 집계를 재검증하며, FE 수치 비교는 계산 금지 원칙·표현 차이로 오탐 위험). FE 일치 검사는 서버 검증을 대신하거나 원천 불변을 보장하지 않는다. 서버 오류나 503에서 v1 AI로 우회하지 않는다.

4문단 plain text·검증 통과를 유지하고 v2에서 기존 ‘가맹 필터’ 문구/조건으로 설명하지 않는다. generated_at은 매 응답 달라질 수 있어 캐시 동등성 기준으로 쓰지 않는다. 현행 v1 동작은 기본 프로필에서 보존한다. 공유 한도5/분·50/일·동시2·20초는 BE 기준이고 FE는 자동 AI 재시도/생성하지 않는다.

개인정보: 주소·건물 키·층호·좌표는 기존과 같이 자체 BE로만 보내며, AI 캐시는 브라우저 메모리(TanStack Query)에만 두고 localStorage·로그·분석 도구·외부 서비스로 보내지 않는다. 오류 안내에 원문 주소·건물 키·내부 generation 값을 노출하지 않는다.

## 3-1. 되돌리기·배포 한계

- 되돌리기: 프로필 값을 지우면(v1) 이전 동작으로 돌아간다. 데이터·저장소 이전은 없다. v2에서 만든 공유 링크는 v1에서 오류로 깨지지는 않지만 결과를 자동으로 보여 주지 않고 1절의 안내+"조건 다시 선택하기" 링크 화면이 된다(정정, 실제 구현: 사용자가 눌러야 v2 전용 키를 지운 v1 조건으로 **입력 화면**에 간다. 결과 화면으로 바로 가지 않는다). 기존 v1 링크는 v2에서 1절 변환+안내로 열린다.
- 공개 FE 빌드 환경(**Vercel** Production=develop·Preview, docs/deploy.md §5·6. Render는 BE 호스팅이다)에 `VITE_ANALYSIS_API_VERSION`을 추가하지 않는다. 미설정이면 v1이다. Preview는 지금 목업(v1) 빌드다. 잘못된 값은 빌드 실패로 드러나므로 공개 배포가 빈 화면으로 나가지는 않는다.
- 공개 배포(Render 운영 BE head0011)는 v1 고정이다. 운영 BE에 0012·publication·조회 권한이 준비되고 사용자가 별도로 승인하기 전에는 공개 빌드에 v2를 설정하지 않는다.
- v2 검증 결과는 로컬 8001(publication 1세대, source_drift=false) 기준이며 drift·다세대 상황은 실제 서버로 재현되지 않으므로 순수 함수 테스트로만 확인한다고 기록한다.

## 4. 검증·전달

- 순수 입력/URL 왕복·기존 bookmark 변환·독립 면적/브랜드 조건·프로필 분리·legacy 인자 미유입·history 비필터 검사, v1에서 v2 링크(analysisVersion만 있는 기본 조건 포함) 차단 안내, 잘못된 프로필 값의 빌드 실패
- v2 history/current_status 변환과 필수 필드·모르는 enum 값 응답 거절, nullable 좌표/location_match "정보 없음"·지도 점만 생략·estimated/unknown/conflict/stale 표시
- AI 세대/조건/시점/지표 불일치 거절·캐시 baseline 분리·mock network 우회0
- 기본 v1 기존 회귀,명시 v2 새 회귀,lint/format/TypeScript·양 프로필 빌드
- localhost5180↔8001 실제 목록/필터/AI·조건 변경/이력 보존·503·모바일/키보드 확인. 실제 모델 요청은 기존 한도 안에서 필요한 최소 건수만 사용한다.
- FE 문서와 CLAUDE.md에 명시적 프로필·로컬 실행/한계를 기록한다. BE 계약 변경은 없으며 기존 BE 전달 문서를 기준으로 한다. 사용자 허용 없이 Render/운영/외부 메시지·main·강제push·브랜치 삭제는 하지 않는다.

## 5. 실제 검수와 결과

실제 설계 검수·블로커 원문 대조 후 구현했으며 아래에 수행 결과를 기록한다. 최종 정적 코드 재검수는 별도 기록한다.

### 설계 검수 (2026-11-15, Claude)

범위: 이 문서와 사용자가 제공한 BE 요청 문서 2종(#145·#147), `src/api/params.ts`·`AiInterpretation.tsx`·`useRisk.ts` 발췌만 읽었다. 테스트·빌드·DB·브라우저·서버 호출은 하지 않았다.

**판정: REVISE → 이 문서에 수정 반영함. 아래 B1·B2 확인 뒤 구현 착수 가능.**

수정 반영한 항목:
1. 프로필 미지정=v1, 잘못된 값은 시작 단계 오류, `/api/v2/brands/status`는 v2에서만 호출.
2. v1/v2 파라미터를 별도 타입·생성 함수로 분리(현재 `toCommonQueryParams`가 franchise·include_unknown_franchise를 항상 채워 v2로 새는 위험).
3. 기존 includeUnknown은 v2에서 면적에만 적용, brand_unknown 기본 include(조용한 대량 제외 방지). independent→non_chain/exclude 0건에는 변환 안내 필수.
4. v1 배포에서 brand* 링크를 열면 의미가 다른 v1 조건으로 바꾸지 않고 안내. 잘못된 URL 값은 기본값+안내.
5. mock: `VITE_REAL_API_PATHS`는 정확 일치로만 v2를 실제 BE로 보냄(v1 경로 접두사로 우회 금지).
6. 필수 필드 오류 처리를 BE 스키마의 non-null 필드로 한정(null 값 "정보 없음" 규칙과 충돌 방지), 섹션 단위 오류.
7. AI baseline을 서버 meta 값(as_of·data_updated_at·data_version·generation·상태·source_drift·brand_filters)으로 구체화. FE 지표 숫자 비교 제외, 항목이 없으면 불일치 처리, 부모 key로 재마운트·취소.
8. 개인정보(메모리 캐시만·외부 전송 없음)·되돌리기·공개 배포 v1 고정·로컬 8001 한계 추가. 휴대폰 필터 줄바꿈·키보드, 문구/상수 위치 추가.

남은 블로커(구현 전 확인, 이번 검수 범위 밖이라 확인하지 못함):
- **B1** BE v2 점포/이력 응답 스키마에서 좌표·개업일·current_status의 필수/nullable 여부와 current_status 값 목록.
- **B2** 기존 `useDiagnosisQuery` URL 키 이름과 새 brand* 키의 충돌 여부, brand_time_basis·operation_type 전송/생략 결정.

구현·테스트 결과는 아직 없다. 실제 실행한 명령과 결과만 이 아래에 추가한다.

### Codex B1/B2 확인과 baseline 계약 정정

B1은 BE app/schemas/chains.py의 ChainStore·ChainHistory와 app/schemas/stores.py의 StoreStatus를 직접 확인했다. current_status는 open/closed/other 필수, source/license_no/category/sub_category·brand·operation/기간 상태도 필수다. lat/lng/distance_m/open_date/close_date/name/operating_months 등은 ChainStore에서 nullable이다. 따라서 개업일/좌표 null을 오류로 만들지 않는다. 화면 타입을 nullable로 받고 null은 ‘정보 없음’으로 표시한다. 좌표가 없는 행은 목록과 BE count에 남기며 **지도에 점을 만들 수 없는 표시만 생략**한다(분모/서버 순서/행수를 바꾸지 않음). 알 수 없는 필수 상태 값은 임의 other/unknown으로 바꾸지 않고 해당 응답을 형식 오류로 거절한다. history의 current_status→store_status는 유효 enum의 이름만 변환한다.

B2는 기존 useDiagnosisQuery의 address/category/sub/radius/asOf/area/franchise/includeUnknown/lat/lng/bk/floor/gu와 대조했다. 새 URL 키는 analysisVersion=v2·brandScope·brandUnknown·brandEvidence이며 겹치지 않는다. v2 요청에는 brand_time_basis=observed_record·operation_type=any를 **항상 명시**한다. 새 링크를 v1 프로필에서 열면 필터 없는 수치를 조용히 보여 주지 않고 안내 화면에서 v2 연결/조건 재선택을 요구한다. 기존 URL 변환·잘못된 값 기본값 변경은 URL 상태에 안내 코드를 남겨 표시하고 적용 후 새 canonical URL로 만든다.

baseline 정정: 현재 BE Risk는 meta.data_version 원자료 메타를, v2 AI는 meta.data_version_hash/context_hash만 제공한다. 둘은 직접 비교할 수 없는 서로 다른 계약이므로 FE에서 hash를 만들거나 대응한다고 주장하지 않는다. Risk의 data_version은 **FE 캐시 baseline/key에 포함**해 다른 Risk 자료의 해석 재사용을 막는다. AI 응답과는 실제 양쪽에 존재하는 as_of/data_updated_at·generation/status/source_drift·정규화 brand_filters(면적·세부 업종 포함)를 비교하며, 이 공통 필드가 없으면 실패한다. AI 자체 data_version_hash/context_hash/prompt_version도 비어 있지 않아야 한다. 개별 지표 계산/숫자 비교는 하지 않는다. 실제 BE가 매 요청 전체 집계/비공개 자료 지문을 재검증하는 기존 계약은 유지한다. FE의 일치 검사는 서버 검증의 대체나 원천 불변 토큰이 아니다.

v1/v2 별도 builder와 legacy?:never / brand_*?:never의 구별 union을 사용하고, wire 단계에서도 프로필과 요청 형태를 확인해 오염된 요청은 네트워크 전에 거절한다. AI body도 같은 구별 union이며 v2 프로필에서는 v2 query만 허용한다. v1 본문/기존 테스트는 유지한다.

위 실제 스키마/공유 메타 확인을2~3절의 일반 문구보다 우선한다. design-resolved 실제 재검수에서 이 확인과 첨부 원문을 다시 대조한다.

### 설계 재검수 (2026-11-15, Claude)

범위: 이 문서, 사용자가 붙여 준 원문 발췌만 읽었다 — BE 요청 문서 #145·#147, FE `src/api/params.ts`·`AiInterpretation.tsx`·`useRisk.ts`·`useDiagnosisQuery.ts`, BE `app/schemas/chains.py`·`app/schemas/stores.py`·`app/services/risk_interpret.py`. 저장소 파일은 이 문서만 읽고 고쳤다. 테스트·빌드·lint·DB·브라우저·서버/모델 호출은 **하지 않았다**. `src/api/client.ts`, v2 Risk 라우터/응답 meta 생성 코드, `prepare_chain_interpretation`의 `response_meta`는 보지 못했다.

**판정: REVISE → 아래 수정을 1~4절에 직접 반영함. B3·B4 확인 전에는 AI 일치 검사와 mock 경로 비교를 확정하지 않는다. 그 밖의 부분(프로필·타입·URL·표시)은 이 문서 기준으로 구현 착수 가능.**

원문과 대조해 맞는 것으로 확인한 항목(PASS): v1/v2 경로 분리·v2 실패 시 v1 우회 금지, v2 legacy 인자 거절/v1 brand_* 거절에 맞춘 구별 union, brand_unknown 항상 명시(`ChainQuery.explicit_unknown`), brand_time_basis·operation_type 단일 값, 이력 비필터(`HistoryQuery`에 브랜드 인자 없음), ChainStore 필수/nullable 구분(Codex B1), AI 응답 meta에 data_version이 없고 data_version_hash·context_hash·prompt_version만 있다는 Codex 정정(`risk_interpret.py` meta 확인), 개인정보(메모리 캐시만), 공개 배포 v1 고정.

이번에 고친 항목(REVISE):
1. **문서 내 모순 제거**: 2절 "모르는 current_status → 정보 없음"과 Codex B1 "응답 형식 오류"가 충돌 → 형식 오류로 통일, 런타임 검사 필수로 명시. 3절 baseline이 AI의 data_version까지 비교하라던 문구를 Codex 정정에 맞게 key 전용/일치 검사 대상 분리. 1절 "v1에서 전체로 표시"와 Codex B2 "필터 없는 수치를 보여 주지 않음"이 충돌 → 자동 표시 없이 안내+사용자 버튼으로 통일, 3-1 되돌리기 문구도 맞춤.
2. **잘못된 프로필 값 처리**: 모듈 로드 시점 throw는 `npm run build`를 통과시켜 배포 화면 전체를 빈 화면으로 만들 수 있음 → `vite.config.ts`의 `loadEnv` 검사로 빌드/개발 시작 실패, 앱 모듈 검사는 방어선만.
3. **URL 키 의미 재사용**: `franchise` 재사용을 막으면서 `includeUnknown`은 v2에서 면적 전용으로 의미를 바꿔 재사용하고 있었음 → v2는 `areaUnknown` 새 키, legacy 키는 변환 입력으로만. `analysisVersion`은 표시용이며 프로필을 바꾸지 않음, 기본 조건 v2 링크도 v1에서 알아보도록 항상 기록.
4. **안내 사유 유실**: 현재 `updateQuery`→`toDiagnosisSearch`가 모르는 키를 지우므로 변환/기본값/v1 차단 판정은 canonical URL 생성 전에 해야 함을 명시.
5. **v2 이력 location_match**: `ChainStore.location_match`는 nullable(legacy `HistoryStore`는 필수) → null을 'unverified'로 바꾸지 않고 "정보 없음".
6. **AI가 Risk에 의존**: baseline이 Risk meta를 필요로 하므로 v2에서 Risk 로딩/실패 중 AI 버튼 비활성+사유 표시(v1 유지). Risk 재조회로 baseline이 바뀌면 진행 중 요청 취소·결과 폐기, 자동 재요청 없음.
7. **섹션 간 generation 불일치**: 숫자를 섞지 않고 수동 "다시 불러오기"(BE #145 안내). status API 실패는 안내 영역만, publication_counts를 분모로 쓰지 않음.
8. **mock 정확 일치 범위**: v2 경로에만 적용, v1 기존 비교 방식은 유지.
9. confirmed_only/include에서 추정 행 표시 유지, non_chain/include를 '독립 점포'로 부르지 않음.

남은 블로커(구현 전 실제 확인 필요, 이번 검수에서 확인하지 못함):
- **B3** v2 Risk 응답 meta에 `brand_filters`·`brand_classification`(generation·상태·source_drift)이 실제로 있는지, Risk와 AI의 `as_of`(AI는 `context.as_of.isoformat()`로 날짜형)·`data_updated_at`(AI는 datetime isoformat) 표기와 brand_filters 키/sub_category 순서가 같은 직렬화인지. v2 Risk 라우터와 `prepare_chain_interpretation`의 `response_meta` 코드 또는 로컬 8001 실제 응답으로 확인한다. 다르면 FE 변환이 아니라 BE 표기 통일을 요청한다.
- **B4** `src/api/client.ts`의 현재 `VITE_REAL_API_PATHS` 비교 방식(접두사/정확, `/api` 포함 여부)을 확인해 v2 항목 표기와 정확 일치 규칙을 확정한다.

구현·테스트·빌드·실서버 결과는 아직 없다. 실제 실행한 명령과 결과만 이 아래에 추가한다.


### Codex B3/B4 원문·실제 응답 확인과 구현

B3은 app/schemas/ai_context.py·app/ai/chain_context.py·app/services/risk.py와 실제8001 GET Risk/AI 응답을 대조했다. 양쪽 as_of와 data_updated_at은 **날짜 YYYY-MM-DD**이며 같은 문자열이다. 기존 재검수의 ‘AI는 전체 timestamp’ 추정은 이 원문/실제 응답에 해당하지 않는다. Risk와 AI meta는 모두 brand_classification/brand_filters를 제공한다. Risk의 raw data_version은 캐시 baseline에만 쓰고 AI hash와 같다고 비교하지 않는다.

실제 AI 표시 검증에서 **meta.brand_filters.sub_category=[]는 전체 요청의 원형이고 evidence.sub_category는 cafe 또는 지원 음식점4종 전체로 확장**됨을 확인했다. 이를 같은 표현이라고 비교한 초기 FE 검증을 바로잡았다. metadata는 요청 원형끼리, evidence는 BE가 명시한 전체 업종 집합/선택 업종끼리 비교한다. 날짜 변환이나 숫자 재계산이 아니며 지표 값을 FE에서 만들지 않는다. 이 두 표현의 회귀 사례를 추가했다.

B4는 client.ts의 실제 Set.has(path.split('?')[0])와 API_PREFIX=/api를 확인했다. allowlist 값은 **/v2/risk 등의 /api 없는 내부 경로**다. v1 항목 /risk가 v2를 허용하지 않는 실제 fetch0 검사와, /v2/risk 정확 일치만 실서버로 보내는 검사를 통과했다. v2 미지원 mock은 MOCK_UNAVAILABLE로 실패하고 v1 자료/자동 실서버 우회가 없다.

구현은 v1/v2 builder·타입 union·wire 검증, 새 URL analysisVersion/brandScope/brandUnknown/brandEvidence/areaUnknown, 요청/캐시 프로필 분리, nullable 점포 표시·지도만 위치 없는 점 생략, 이력 상태 필드 호환, 목록·지도·조건·AI·진단서/요약 문구를 포함한다. v1에서 v2 링크를 열면 결과 화면과 독립 인쇄 화면 모두 안내/재선택만 제공하고 분석 API를 호출하지 않는다. v2의 status 안내 실패는 해당 안내에만 한정한다. 응답 세대/상태/drift가 섞이면 결과를 숨기고 명시적 새로고침을 요구한다.

AI는 현재 Risk가 로딩·실패·baseline 미확인인 동안 요청할 수 없다. 요청 조건/주소/건물/층/자료 baseline이 바뀌면 이전 요청을 취소하며, 현재 Risk와 공유 metadata·brand 조건·카테고리/반경·업종 집합·해석 verification/4문단·서버 hash가 맞지 않으면 표시/캐시를 거절한다. 원천 지문을 FE가 재계산하거나 generation을 원천 불변 토큰으로 취급하지 않는다. 모든 AI 재시도/자료 새로고침은 사용자 동작이며 오류에서도 지표는 유지한다.

### Codex 실제 검증

- TypeScript·ESLint·Prettier,일반 Vitest157개(기존116+신규41) 통과. 기본v1과 명시v2 모두 정적 빌드 성공. 잘못된 프로필은 vite.config의 실제 빌드에서exit1로 거절됐다. 새 라이브러리/의존성 변경은 없다.
- 실제 localhost5180(v2)↔8001: 목록/이력/활동/Risk·체인 제외/포함과 미확인 포함 여부,URL 조건·history 무브랜드,legacy 필드 없는 요청을 확인했다. 비체인 엄격0건의 확인 근거 안내와 미확인 포함 시 실제 결과 전환도 확인했다.
- 실제 Gemini 응답 HTTP200·검증 통과·숫자39개/불일치0·재생성false·4문단·chain-risk-interpret-v1 표시를 확인했다. 같은 SPA 안에서 저장/진단서로 이동하면 동일 자료의 검증 본문을 재사용하고 새 AI POST가 없었다.
- 브라우저 모의 응답으로 AI 세대 불일치 숨김/캐시 거절·503 지표 보존·수동 재요청,진행 중 AI를 둔 SPA 이동의 실제 abort,서로 다른 GET 세대 결과 숨김·수동 새로고침을 확인했다. 원본 DB나 공개 세대를 바꿔 재현한 검사는 아니다.
- desktop1440·mobile390/360에서 조건 필터/AI 가로 넘침 없음,브랜드 radio 키보드 선택,ⓘ dialog 위치·Esc/포커스 복구를 확인했다. 초기 viewport 전환 직후의 레이아웃 검사와 체크리스트까지 세는 문단 selector는 검증 스크립트에서 바로잡았다. 실제 모바일 확인에서 조회 버튼 줄바꿈은 shrink-0/nowrap으로 보강했다.
- v1 빌드를 별도5181에서 열어 v2 공유 링크가 분석/인쇄 화면에서 모두 차단되고 API 요청0임을 확인한 뒤 임시5181을 종료했다. 기존5173 서버와 원래 FE/BE .env·미추적 자료·BE source revision0은 유지한다.

검증 스크립트/브라우저 원문 응답·이미지·실행 설정은 저장소 밖에 보관하며 Claude에게는 집계와 코드만 전달한다. 로컬 재현 URL에 실제 주소/건물 키가 포함돼 이 문서나 PR 본문에는 넣지 않는다. 테스트 시작 주소는 http://localhost:5180/diagnose 이며 이 PC에만 적용된다.

### PR·공개 반영 경계

FE docs/deploy.md §5에서 **Vercel Production Branch=develop, develop PR 병합 시 공개 자동 배포**임을 확인했다. 따라서 로컬 구현/검증과 검토 가능한 PR/CI까지 준비하고 사용자 확인 전 develop 병합·Vercel 설정 변경·공개 전환은 하지 않는다. PR Preview가 자동 생성될 수 있으나 그곳의 v2/실서버 연결을 완료했다고 주장하지 않는다. 운영 BE는0011/v1이므로 새 코드는 기본v1이며 공개 v2 전환은 운영 BE 준비 뒤 별도다.

### 구현 정적 코드 검수 (2026-11-15, Claude)

범위: 사용자가 붙여 준 발췌만 읽었다. BE #145·#147 요청 문서와 FE `params.ts`·`client.ts`·`analysisProfile.ts`·`config/analysisVersion.ts`·`interpretationContext.ts`·`queryKeys.ts`·`queryClient.ts`·`risk.ts`·`market.ts`·`stores.ts`·`storeAdapters.ts`·`useDiagnosisQuery.ts`·`useRisk.ts`·`useReportData.ts`·`useResultBaseline.ts`·`useBrandsStatus.ts`·`types/{api,brands,diagnosis,risk,stores}.ts`·`constants/{diagnosis,messages}.ts`·`utils/{brands,storeDisplay}.ts`·`ConditionFilterBar`·`NearbySection`·`HistoryTable`·`NearbyTable`·`SnapshotBlock`·`BrandStatusNotice`·`FranchiseFilterNotice`·`InfoBox`·`StoreFranchiseCell`·`ConditionBar`·`ResultLayout`·`groupMarkers`·`SummaryImageCard`·`AiConditions`·`AiFailure`·`AiInterpretation`·`ReportPage`·`SummaryPage`·`vite-env.d.ts`, `brands.test.ts`·`brandTransport.test.ts`, docs/deploy.md, Codex 실행 결과 JSON이다. 저장소 파일은 이 문서만 읽고 고쳤다. **테스트·빌드·lint·DB·브라우저·서버/모델 호출은 하지 않았다.** 위 "Codex 실제 검증"의 수치는 Codex가 보고한 것이며 내가 재현하지 않았다. 보지 못한 파일은 `vite.config.ts`(잘못된 프로필 빌드 실패 검사), `AiInfoPopover`, `NearbyMap`/지도 정보창, `SnapshotTable`, `FranchiseNote`, `StatusLabel`/`labels.ts`, `mocks/`, 입력 화면, `docs/api-contract.md`이다.

**판정: REVISE.** 기본 v1 배포에 영향을 주는 코드 블로커는 읽은 범위에서 찾지 못했다. 다만 develop 병합은 공개 자동 배포이므로 여전히 사용자 확인이 필요하다. 명시 v2를 쓰거나 공개 전환하기 전에 아래 V1·V2를 고쳐야 한다. V3은 BE 계약 확인이 필요하다.

맞는 것으로 확인한 항목(PASS, 코드 정적 대조):
- 프로필: 값이 없거나 비면 v1. 모르는 값이면 앱 모듈에서 throw한다. 쿼리 키 전체에 프로필이 들어가고, v1에서는 brand status가 `skipToken`이라 호출하지 않는다. v2 경로는 `analysisPath` 한 곳에서 정한다. v1으로 자동 재시도하지 않는다.
- 요청: v1/v2 builder가 따로 있고 `never` 필드로 구별 union을 만든다. v2는 brand 5종을 항상 보내고 면적과는 독립이다. `validateAnalysisParams`가 Risk·AI·nearby·snapshot·activity에서 네트워크 전에 거절한다. 이력은 `building_key/floor_unit/category`만 보내고 브랜드 필터가 없다.
- mock: v2 경로는 `Set.has` 정확 일치일 때만 실서버로 간다. 그 밖에는 `MOCK_UNAVAILABLE`로 실패하고 v1 mock으로 넘어가지 않는다. v1 비교 방식은 바뀌지 않았다.
- 표시: v2 행에 legacy franchise를 만들지 않는다(어댑터가 legacy 키를 거절). unknown·stale·drift·conflict를 개인 매장으로 바꾸지 않는다. 좌표 null 행은 목록과 서버 count에 남기고 지도 묶음에서만 뺀다. 표의 지도 버튼은 비활성이다. v2 이력 `location_match=null`은 "정보 없음"으로 보이고 'unverified'로 바꾸지 않는다. 0건 문구는 체인이나 점포가 없다는 뜻으로 설명하지 않는다.
- v1에서 v2 링크를 열면: 파서가 canonical로 바꾸기 전에 `unsupported_brand`로 판정한다. 결과 레이아웃과 인쇄 화면 모두 분석 쿼리 params를 null로 두고 안내만 보여 준다.
- AI: 수동 버튼으로만 요청한다. v2에서는 Risk가 다시 불러오는 중이거나 실패하거나 baseline이 없으면 숨기거나 비활성화하고 사유를 보여 준다. 부모 key에 baseline이 들어가 재마운트되면서 abort된다. 불일치는 mutation 안에서 throw되므로 캐시에 저장되지 않는다. 진단서는 같은 key와 `interpretationMatches`를 다시 확인해서 재사용한다. generated_at은 동등성 기준이 아니다. data_version은 key에만 쓰고 hash와 대응시키지 않는다.
- 개인정보: AI 캐시는 TanStack 메모리에만 있다(gcTime 30분). localStorage·외부 전송·주소 로그는 보이지 않았다. 오류 문구에 주소·건물 키·generation이 없다.

수정 필요(REVISE):
- **V1(v2 블로커) 미확인 선택지 안내 문구**: `ConditionFilterBar`의 "소속 미확인" 그룹 hint가 선택값과 상관없이 늘 `MESSAGES.brand.unknownIncluded`("미확인 점포도 포함한 결과")를 보여 준다. 그래서 exclude를 골라도 "포함"이라고 안내된다. include일 때만 이 문구를 보여 주고, exclude에는 제외 의미 문구를 쓴다.
- **V2(v2 블로커) legacy `includeUnknown`이 v2 링크에 섞임**: `parseDiagnosisQuery`는 v2 링크(analysisVersion·brand* 있음)에 `areaUnknown`이 없으면 legacy `includeUnknown`을 읽는다. 그래서 `analysisVersion=v2&includeUnknown=false`는 면적 미확인 제외로 바뀐다. 섞인 링크에서 legacy `franchise`·`includeUnknown`도 안내 없이 무시하거나 적용한다. 1절대로 v2 링크에서는 legacy 키를 무시하고 안내 코드를 남긴다. 테스트 `new explicit brand conditions take precedence…`에 안내 검증을 추가한다.
- **V3(BE 확인) 어댑터 개수 불변식**: `adaptChainNearby`는 `count===markers.length`를, snapshot은 `total_at_as_of===stores.length===still_open+closed_since+other`를 요구한다. 이 조건이 깨지면 응답 전체가 형식 오류가 된다. BE 계약이 목록 상한·잘림을 허용하지 않는다는 근거를 문서에 남기거나 BE에 확인한다. 허용한다면 v2 주변/시점이 항상 실패한다(로컬 8001에서 통과한 것은 Codex 보고).
- V4 필터 독립성: 범위를 바꾸면 `brandUnknown`이 all→include, 그 밖→exclude로 강제로 다시 정해져 사용자가 고른 값이 사라진다. 2절의 "독립 선택"과 다르다. 범위가 all이 아닐 때 unknown을 명시해야 한다는 것만 지키면 된다.
- V5 런타임 검사 범위: BE가 필수로 둔 `operation`(type=unknown), `brand.time_basis`·`historical_membership`을 `checked()`가 검사하지 않는다. 2절 필수 필드 목록대로 추가한다.
- V6 조건 요약 누락(2절): confirmed_only/include에서 "추정 행은 필터상 미확인으로 포함되지만 행 표시는 추정"이라는 문장이 없다. legacy franchise=all+includeUnknown=false를 바꾼 뒤 "미확인 소속은 포함된다"는 차이 안내도 없다. 각각 `brandFilterNotice`/URL 안내에 추가한다.
- V7 AI 검사가 지나치게 엄격할 위험(실패해도 막히는 쪽이라 안전하지만 v2 AI가 영구히 막힐 수 있음): 본문을 빈 줄로 나눈 문단과 `paragraphs[i].text`가 정확히 같아야 하고, `prompt_sha256`·hash는 64자리 hex여야 한다. 둘 다 #147 문서에 명시된 계약은 아니다. 음식점 전체 업종 목록도 하드코딩돼 있다 → `RESTAURANT_SUB_CATEGORIES`에서 만들고, 나머지 형식은 BE 계약 문서에 남겨 달라고 요청한다.
- V8 v2 AI 한계 문구: `MESSAGES.ai.info.rules`가 v2에서 "공식 폐업률 적용 기준"·"공식 창업위험도 자체 계산 안 함" 두 줄을 뺀다. 브랜드 조건과 관계없는 변경이므로 근거를 문서에 적거나 원래대로 되돌린다.
- V9 테스트 이름이 실제보다 많이 주장함: `preserves v1 default wire behavior and does not call brand status`는 status를 호출하지 않는지 검사하지 않는다. 이름을 고치거나 검사를 추가한다.
- V10 자동 요청 경계: v2 `useRisk` staleTime 0은 화면에 들어갈 때마다 다시 불러온다. `useBrandsStatus`는 창 포커스 때마다 다시 불러온다. 둘 다 AI가 아닌 GET이라 자동 AI 금지 규칙에 걸리지는 않는다. 다만 포커스 때 다시 불러온 status 세대가 바뀌면 결과가 숨겨지고(새로고침 필요), Risk를 다시 불러오면 받아 둔 AI가 버려질 수 있다. 의도한 실패-차단 동작으로 문서에 적어 둔다.
- 경미: 새 하드코딩 문구(`validateAnalysisParams`·`MOCK_UNAVAILABLE`·어댑터 오류)는 messages.ts 규칙과 다르다(기존 client.ts 관행과는 같다). 브랜드 `Choice`에 `segmented` prop이 빠져 모양이 일관되지 않다.

이 문서에 직접 정정한 것: 1절 brand* 키를 항상 기록하는 것, v1 차단 링크가 입력 화면으로 가는 것, 3절 `toRiskInterpretRequest`가 union+런타임 검사인 것, brand_filters를 요청 정규화 값과 비교하는 실제 방식, 3-1 공개 FE 빌드 환경이 Vercel인 것(Render는 BE).

남은 확인: `vite.config.ts`의 loadEnv 검사와 위에서 보지 못한 컴포넌트(지도 정보창의 `conflict` kind 처리 포함)는 내가 읽지 않았다. V1·V2·V5 수정과 V3 확인 뒤 다시 검수한다. 병합·Vercel 설정 변경·공개 전환은 사용자 확인 전까지 하지 않는다.


### 최종 검수 지적 보완 및 BE 근거 대조 (Codex, 2026-11-15)

아래는 앞선 REVISE 기록 이후의 현재 구현이다. 과거 지적은 검수 이력으로 보존한다.

- V1·V2: 소속 미확인 선택값에 맞는 포함/제외 안내를 쓴다. 새 URL 키가 하나라도 있으면 예전 `includeUnknown`을 면적 조건에도 적용하지 않는다. 섞인 legacy 키는 무시했다는 안내를 남긴다. legacy 전용 링크의 면적 변환에는 별도 안내와 소속 미확인 제외 버튼을 제공한다.
- V3: BE `app/schemas/chains.py`의 `ChainNearby.complete`, `ChainSnapshot.complete`, `ChainHistory.complete`가 각각 count=markers 길이, total_at_as_of=stores 길이=상태별 합, total=stores 길이를 서버 응답 생성 시 검증한다. 따라서 현재 v2 계약은 잘린 목록을 허용하지 않는다. FE 어댑터 검사는 이 보증과 일치한다. 향후 페이지 처리를 도입하면 양쪽 계약을 함께 바꿔야 한다.
- V4·V5: 범위 변경은 소속 미확인 선택을 유지한다. 행의 operation.type=unknown/basis=null, observed_record/not_verified와 운영기간 상태·정수 개월 수를 검사한다. malformed 응답은 섹션 오류로 처리한다.
- V6: confirmed_only/include에서는 추정 점포가 필터상 미확인으로 포함되며 행에는 추정으로 남는다는 안내를 표시한다. legacy 면적/소속 의미 차이는 URL 안내와 조정 버튼으로 알린다. 보고서와 요약 이미지에도 면적·면적 미확인 조건을 포함한다.
- V7: 음식점 기본 세부 업종은 `RESTAURANT_SUB_CATEGORIES`를 공유한다. BE `app/ai/interpretation.py`는 카탈로그 문단 text를 빈 줄 두 개로 결합해 body를 만든다. `app/ai/context.py`와 프롬프트 bundle은 sha256.hexdigest()를 사용한다. 현재 BE develop a0626f3의 실제 계약을 근거로 문단 일치·64자리 hex를 방어적으로 검증하며, 이는 새로운 BE 필드나 계산을 요구하지 않는다. 본문/해시 형식이 바뀌면 FE 검사도 함께 조정해야 한다. 실제 브라우저 AI 응답이 이 검사를 통과했다.
- V8: v2 팝오버에서 삭제된 공식 폐업률/공식 위험도 두 안내를 뺀 근거는 BE `docs/fe-risk-reference-api-request.md` 1절의 2026-11-15 #140 사용자 결정이다. 해당 카드·링크·AI 대상 제거에 맞추었다. 기본 v1 문구는 기존 호환을 유지한다.
- V9: v1 전송 검사만 하는 테스트 이름에서 status 미호출 주장을 제거했다. 별도로 v1 실제 빌드에서 v2 analysis/report 링크를 열 때 전체 API 요청 0건임을 브라우저로 확인했다.
- V10: v2 Risk GET은 staleTime=0으로 화면 진입 때 재검증하며, brand status GET은 창 포커스 때 재검증한다. 재검증 중에는 이전 AI를 숨긴다. 세대가 바뀌거나 결과가 섞이면 수동 새로고침을 요구한다. AI POST 생성은 계속 사용자 버튼으로만 시작하며 GET 재검증이 AI를 자동 생성하지 않는다. 같은 baseline이면 보고서 이동 때 검증된 AI 캐시를 재사용한다.
- 공통 API 오류 문구를 순환 의존성 없는 constants/apiMessages.ts에 모으고 messages.ts에서도 제공한다. 브랜드 선택지 segmented 표시와 최소 44px 높이를 적용했다.

최신 검증: 전체 단위 테스트 **159개 통과**, TypeScript·ESLint·변경 파일 Prettier 정리 통과, v1/v2 빌드 통과, 잘못된 프로필 빌드 실패 확인. 로컬 실제 v2 조회·필터·무브랜드 이력, 실제 AI 200/4문단/수치 검증 통과, 보고서 재사용·조건 변경·취소·503·혼합 세대 차단을 확인했다. 390/360px 가로 넘침 없음, 키보드 선택·팝오버 닫기/포커스를 확인했다. 검수 보완 항목의 선택값 안내·범위 독립성·legacy 변환 버튼·혼합 URL·confirmed_only 안내도 브라우저로 재확인했다. fault 상황은 브라우저 응답 대체이며 실제 DB를 바꾸지 않았다.

실제 Claude 검수 이력(UTC): 설계 05:26:07~05:28:04/8 turns, 설계 재검수 05:29:48~05:32:25/17 turns, 구현 06:00:43~06:03:34/8 turns. 모두 실제 CLI exit 0·권한 거절 0이며 문서 Read/Edit만 허용했다. 각 REVISE를 보완한 최종 재검수를 이어서 기록한다. 공개 배포나 병합은 아직 하지 않았다.

### 최종 정적 재검수 (2026-11-15, Claude)

범위: 사용자가 붙여 준 현재 코드 발췌만 읽었다. 앞 검수 범위에 더해 이번에는 `vite.config.ts`·`AiInfoPopover`·`NearbyMap`·`SnapshotTable`·`FranchiseNote`·`StatusLabel`/`labels.ts`·`docs/api-contract.md`와 BE `app/schemas/{chains,ai_context}.py`·`app/ai/{chain_context,interpretation,context}.py`·`app/ai/prompts/chain_version.py`·`docs/fe-risk-reference-api-request.md`, Codex 결과 JSON(2026-11-15T06:13Z)도 읽었다. 저장소 파일은 이 문서만 읽고 고쳤다. **테스트·빌드·lint·DB·브라우저·서버/모델 호출은 하지 않았다.** 159개 테스트·빌드·브라우저 결과는 Codex 보고이며 내가 재현하지 않았다. `mocks/`와 입력 화면은 여전히 보지 않았다.

**판정: PASS.** 읽은 범위에서 지금 남은 중대한 블로커는 없다. 앞의 "구현 정적 코드 검수"의 REVISE와 V1~V10은 **당시 기록**이다. 현재 코드에서 아래와 같이 해소됐다. 다만 develop 병합은 Vercel 공개 자동 배포이므로 **사용자 확인 전 병합·Vercel 설정 변경·공개 v2 전환은 하지 않는다**(이 PASS는 병합 승인이 아니다).

과거 지적 → 현재 코드 대조:
- V1 해소: `ConditionFilterBar` hint가 `draft.brandUnknown`에 따라 `unknownExcluded`/`unknownIncluded`로 바뀐다.
- V2 해소: `parseDiagnosisQuery`는 새 키(analysisVersion·brand*·areaUnknown)가 하나라도 있으면 `areaUnknown`만 읽는다. 이때 legacy `franchise`·`includeUnknown`은 적용하지 않고 `mixed_legacy`로 안내한다. 테스트(`does not apply an old shared unknown flag…`, `new explicit…` 안내 검증)도 있다.
- V3 해소(근거 확인): BE `ChainNearby/ChainSnapshot/ChainHistory.complete` 검증자가 FE 어댑터 불변식과 같다. 잘린 목록은 계약상 없다.
- V4 해소: 범위 onChange는 `brandScope`만 바꾼다.
- V5 해소: `checked()`가 operation(type=unknown·basis=null), time_basis, historical_membership, 기간 상태/사유/정수 개월, legacy 키 부재를 검사한다.
- V6 해소: `brandFilterNotice`와 `BrandStatusNotice`가 confirmed_only/include 안내를 보여 준다. `legacy_area`에는 안내와 "소속 미확인도 제외하기" 버튼이 있다. 보고서·요약 이미지에는 면적과 면적 미확인 조건이 들어간다.
- V7 해소(근거 확인): BE `render_interpretation`이 `"\n\n".join(paragraph.text)`로 body를 만들고, hash는 `sha256().hexdigest()`(64자리 소문자 hex)다. 따라서 FE의 문단 일치·hex 검사는 현재 계약과 같고, 어긋나면 막히는 쪽(fail-closed)이다. evidence 업종은 BE `chain_query_parts`/context처럼 전체 업종으로 펼쳐 정렬한 집합과 비교한다. 음식점 목록은 `RESTAURANT_SUB_CATEGORIES`에서 만든다.
- V8 해소(근거 확인): #140 사용자 결정(공식 폐업률·창업위험도 카드 삭제)에 따른 v2 문구다. v1 문구는 바뀌지 않았다.
- V9 해소: 테스트 이름이 `preserves v1 default wire behavior`로 바뀌었다.
- V10 문서화: 아래 남은 한계에 적었다.
- 앞 검수에서 보지 못한 부분: `vite.config.ts`는 `process.env ?? loadEnv`로 `parseAnalysisVersion`을 불러 잘못된 값이면 설정 단계에서 throw한다(1절 충족). 지도 정보창(`makeDetailList`·`makeGroupInfoElement`)은 `storeFranchise`를 써서 conflict·unknown·estimate 라벨과 근거를 그대로 보여 준다. 좌표 null 점은 `groupMarkers`에서만 빠진다.

추가로 PASS 확인한 경계:
- 기본 v1 호환: v1 builder·URL 키·AI key(`search`)·info 문구는 기존과 같다. 쿼리 키에 'v1'이 추가된 것만 다르며 동작에는 영향이 없다. brand status는 `skipToken`이라 호출하지 않는다. v1에서 v2 링크를 열면 `ResultLayout`·`ReportPage`·`useResultBaseline`·`useReportData`가 모두 params/history를 null로 두어 분석 API를 부르지 않는다.
- 근거를 지어내지 않음: v2 어댑터가 legacy franchise 키를 거절한다. unknown·conflict·stale·drift는 "미확인"·"근거 충돌"로 남고 개인 매장으로 바뀌지 않는다. non_chain/include를 '독립 점포'라고 부르지 않는다.
- 이력: v2도 `building_key/floor_unit/category`만 보낸다. `location_match=null`은 화면과 진단서 모두 "정보 없음"으로 보인다.
- mock: v2 경로는 allowlist와 정확히 일치할 때만 실서버로 간다. 그 밖에는 `MOCK_UNAVAILABLE`이다. brand status도 같은 규칙을 따르고, 실패하면 안내 영역에만 "확인 실패"가 뜬다.
- AI·캐시: 수동 버튼으로만 요청한다. Risk가 다시 불러오는 중이거나 실패하면 v2 AI를 숨긴다. baseline이 들어간 부모 key가 바뀌면 재마운트되어 abort된다. 불일치는 throw되어 캐시에 저장되지 않는다. 진단서는 같은 key와 `interpretationMatches`를 다시 확인한 뒤 재사용한다. `AI_CONTEXT_CHANGED`의 "같은 조건으로 다시 조회"는 사용자가 누를 때만 페이지를 새로고침한다(AI 자동 POST 없음).
- 개인정보: 메모리 캐시만 쓴다(30분). 오류 문구에 주소·건물 키·generation이 없다.

남은 한계(블로커 아님, 기록용):
- `BrandResultBoundary`의 `blocked`는 한 번 켜지면 새로고침 전까지 유지된다. 창 포커스로 status 세대가 바뀌거나 Risk를 다시 불러와 baseline이 바뀌면 결과나 받아 둔 AI가 숨겨지고 사용자가 새로고침해야 한다. 의도한 fail-closed 동작이다(V10).
- URL 변환 안내(`legacy_*`·`mixed_legacy`·`invalid_brand`)는 처음 연 URL에서만 보인다. 결과 화면 사이를 이동하면 canonical v2 URL로 바뀌어 안내가 사라진다. 바뀐 조건은 조건 바·필터 요약에 계속 보이고, 0건이면 `brandEmptyMessage`가 설명한다.
- `checked()`는 nullable 문자열인 brand 근거·연도·월과 floor_unit의 타입까지는 검사하지 않는다(BE pydantic `extra=forbid`가 보장).
- v2 Summary에서 Risk 재조회 중 "지표 확인 후 AI" 문구가 두 곳에 뜰 수 있다(표시 중복, 경미).
- BE 본문 결합·hash 형식이나 v2 목록 완전성 계약이 바뀌면 FE 검사도 함께 바꿔야 한다. drift·다세대는 로컬 8001에서 재현되지 않았고 단위 테스트와 브라우저 응답 대체로만 확인했다(3-1).

이 문서에 직접 정정한 것: 3-1 되돌리기 문구("브랜드 조건 없이 전체 보기" 버튼 → 실제 "조건 다시 선택하기" 링크·입력 화면 이동).

최종 CLI 실행 기록(Codex): UTC 2026-11-15T06:13:10.731575+00:00 ~ 2026-11-15T06:14:43.885705+00:00, exit 0, 4 turns, permission_denials 0. 검수 전 MD SHA256 `4413f39da22093015a4cf15bc5f3affe446279ca58a29ad30c2f95e5a8fd0fc2`, 검수 직후 `77cc65fce4f061d27bafeaf48b053096ee78014a5a0d8af701400abda518cf78`. 이후 이 실행 기록과 문서 정리만 추가했으며 검수 후 앱 코드는 바꾸지 않았다.
