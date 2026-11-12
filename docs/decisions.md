# 결정 사항과 미결 사항

> 마지막 갱신: 2026-11-12
> 새 결정은 날짜와 함께 위에 추가하고, 관련 문서([api-contract.md](api-contract.md), [screens.md](screens.md), [display-rules.md](display-rules.md))를 따라 고친다.

## 1. 결정됨

| 날짜 | 결정 | 메모 |
|---|---|---|
| 2026-11-12 | **프랜차이즈는 근거(`franchise_basis`)대로 표시** — 목록명 일치 → "프랜차이즈(추정)"+"2025년 브랜드 목록과 상호 일치 · 실제 계약·과거 소속 아님", 기존 분류 → 값 그대로+"기존 분류 자료 기준", 미확인 → "정보 없음" | BE 가맹 추정 요청서(PR #93). 이력·주변·시점 표·지도 정보창·진단서가 `storeDisplay.storeFranchise` 하나를 같이 씀. 과거 소속 표현 금지 |
| 2026-11-12 | **정보 없음 포함을 면적·가맹 두 플래그로 보낸다**, 가맹 필터(프랜차이즈·개인 매장)를 고르면 `include_unknown_franchise=false` | legacy `include_unknown`과 섞으면 422라 FE는 개별 플래그만. Risk·AI 본문도 같은 값 (`params.ts` 한 곳) |
| 2026-11-12 | **개인 매장 선택지는 유지하고 0건을 "분류 자료가 없어 0곳"으로 안내** (비활성으로 막지 않음) | BE 자료에 기존 외부 분류(false)가 거의 없어 개인 매장은 거의 0건. 선택지를 막으면 자료가 생겼을 때 다시 바꿔야 함 → 조건 도움말·0건 문구·상권 활동/종합 진단/진단서 안내로 "점포가 없다"는 오해를 막음 |
| 2026-11-12 | 범위 밖 시점(`AS_OF_OUT_OF_RANGE`) 안내는 **data-range 응답**으로 범위를 채운다 | BE는 `error.detail`을 보내지 않음 (감사 요청서 "현재 전달 기준"). `useAsOfRangeMessage` |
| 2026-11-12 | 상권 활동 선택 항목(추정매출·생활인구)이 `optional_data` pending이면 **"자료 확인 중" + 사유**로 표시 | 숫자를 만들지 않음. 화면 블록과 진단서가 `activity/optionalData.ts`를 같이 씀. 연도별 추이는 서버가 준 연도만, YTD 기준이면 비교 기간 안내. 가맹 분류 pending + 프랜차이즈 조건이면 "점포 없음으로 단정하지 않음" 안내 |
| 2026-11-12 | 상담 링크는 **구 지정 시 관할 지역센터 1곳 + 공통 4곳 (서버 순서 그대로)** | 관할 센터는 "관할 지역센터 연락처" 배지 + 공고일·확인일 안내. 업종은 순서에 영향 없음, "맞춤·신청 가능" 표현 금지. 지원사업 카드 문구를 "지원사업과 모집 공고를 확인해 보세요"로 (자격 보장처럼 읽히지 않게) |
| 2026-11-12 | **점포 식별(`source`+`license_no`)을 주변 점포·시점 조회·지도에도 적용** | 지도 마커 관리 키·마커 클릭·선택 강조·정보창 찾기, 표의 key·선택 비교·클릭 인자까지 `storeKey`. 반경·필터·시점이 바뀌면 이전 마커를 내리고 선택을 푼다 (BE 감사 4번) |
| 2026-11-12 | 주변 점포·시점 조회·지도 정보창도 **결측을 "정보 없음"·사유로** 표시 | 이력과 같은 `src/utils/storeDisplay.ts`·`MESSAGES.store`를 같이 씀. 마커 `title`·버튼 이름에 `null`·빈칸 금지 (BE 감사 5번) |
| 2026-11-12 | 시점 범위(`data-range`)는 **주변 조회와 같은 업종·세부 업종**으로 요청, `min_month=null`이면 과거 선택을 막는다 | 최소 월을 임의로 채우지 않음. 좌표 미확보 수는 서울 전체 범위라 반경 점포 수와 합치지 않음 (표시 문구는 BE와 합의 대기) |
| 2026-11-12 | **상권 `unverified`는 "공식 상권 적용 기준 확인 중"으로 따로 표시** — 상권 안·밖으로 확정하지 않음 | 지금 BE는 항상 `unverified`. 상권 밖으로 바꿔 보이지 않게 종합 진단(`MarketCard`)·진단서가 같은 기준. `spatial_candidate`(경계 파일 형상 후보)는 확정 상권이 아니라 화면에 쓰지 않음 |
| 2026-11-12 | **AI 해석 요청은 원래 조회 조건만 보낸다 (query-only)** | Risk 응답·화면 수치·주소·건물 키·층 전송 금지, `include_unknown` 하나만, 최신 조회는 `as_of` 생략. 422는 입력 형식 오류로 안내(지표 재조회 없음), 재시도는 사용자 버튼만 |
| 2026-11-12 | 지표 사유는 **코드 → 문구**로 바꿔 보여준다 (`indicatorReasonText`) | 영문 코드를 화면에 그대로 보이지 않게. 모르는 코드는 일반 문구 |
| 2026-11-12 | **점포 식별 = `source` + `license_no`** (`"${source}:${license_no}"`, `src/utils/storeKey.ts`) | 일반음식점·휴게음식점 원천마다 관리번호가 따로 매겨져 같은 번호가 있을 수 있음 (BE DB `UNIQUE(source, license_no)`). 같은 관리번호·다른 원천은 합치지 않고 두 점포로 둔다. 이력·주변 점포·시점 조회·지도 모두 같은 규칙 |
| 2026-11-12 | 점포 이력의 **결측은 "정보 없음"·사유로 표시** (0·빈칸·`null` 금지) | 개업일 미확인은 맨 뒤, 0개월(fact)과 미산정(no_data)을 구분, 폐업인데 폐업일 없음은 사유별 문구. 이력 표와 진단서가 같은 함수를 씀 (정렬 `utils/history.ts`, 결측 문구 `utils/storeDisplay.ts`) |
| 2026-11-11 | STEP 02 탭 제목은 **"입지 정보 분석 \| Spot:ON"으로 고정** | 보고 있는 섹션과 관계없이 같은 제목 (PR #16) |
| 2026-11-11 | **CI가 develop 대상 PR에서도 돈다** (해결) | 커밋 312bfe7로 `branches: [main, develop]` 수정됨, 저장소 기본 브랜치도 develop |
| 2026-11-10 | **FE PR은 류민지가 merge commit으로 머지**한다 | 커밋 기록 보존. BE 머지 방식은 BE가 정한다 (BE 작업계획서는 Squash) |
| 2026-11-10 | FE 커밋 메시지는 **`타입: 내용`** 형식 | 타입: feat, fix, refactor, perf, docs, style, chore |
| 2026-11-10 | 배포 위치는 **개발 완료 후 결정**. 최종 제출은 공공 GitLab | FE·BE 별도 저장소로 이관 |
| 2026-11-10 | **모바일 전용 대응은 범위 밖**, 데스크톱 1440 기준으로 개발 | 접근성 기본 규칙은 계속 지킨다 |
| 2026-11-10 | 랜딩은 디자인대로 **전국 지도 그림** 사용 | 서비스 범위(서울)는 문구로 안내 |
| 2026-11-10 | 카카오맵 JavaScript 키는 FE 환경변수 **`VITE_KAKAO_JS_KEY`** 로 두고, 카카오 개발자 콘솔에서 **허용 도메인을 제한**한다 | 브라우저 공개용 키라 예외 허용 (07 데이터 활용 명세서 8.4). 다른 키는 모두 BE |
| 2026-11-10 | 업종은 **카페(세부 업종 없음) + 음식점 4종(한식·중식·일식·양식)** | 키즈카페·라이브카페·분식·치킨·주점·기타 음식점·제과점 제외. BE 작업계획서 기준 |
| 2026-11-10 | 통합 브랜치는 **`develop`** (원격 `dev` 삭제됨). FE PR 대상은 `develop` | CLAUDE.md 반영 |
| 2026-11-10 | 기준 우선순위: 팀 최신 결정 > BE 작업계획서 > PDF | [README.md](README.md) |
| 2026-11-10 | 시설 규모 필터는 **하나만 선택** (기본: 전체 `all`). 값은 API `area`와 같은 `lt33`/`33to66`/`66to99`/`gte99`. "정보 없음 포함"은 별도 옵션(`include_unknown`, 기본 `true`) | API `area`가 하나만 받기 때문. **여러 개 선택은 BE 확인 후 결정**. URL 쿼리: `area`(전체면 생략), `includeUnknown=false`(기본값이면 생략) |
| 2026-11-10 | **결과 라우트를 디자인 4단계로 재구성**: `/result/analysis`(STEP 02, `#history`·`#nearby`·`#activity`) · `/result/summary`(STEP 03) · `/result/share`(STEP 04) | 화면 7종 기능은 그대로. 예전 `/result/history|nearby|activity|risk`는 쿼리를 유지한 채 새 경로로 리다이렉트 → [screens.md](screens.md) |
| 2026-11-10 | 결과 화면은 URL 쿼리 `address`·`category`·`lat`·`lng`·`bk`가 모두 있어야 열린다 (`floor`·`gu`는 선택) | 입력 화면에서 `/geocode` 결과로 채운다 |
| 2026-11-10 | 디자인 6번의 "창업 위험도 점수(72.6점)·⚠주의 등급"과 참고지표의 빨강·초록 배경은 **만들지 않는다** | 자체 종합 점수·등급 금지, 참고지표 등급 색 금지 원칙. 공식/참고 지표 카드 분리 + 중립 색 + 상태 라벨로 대신 |

## 2. BE 확인 대기

| # | 항목 | FE가 궁금한 것 | FE 임시 기준 |
|---|---|---|---|
| 2 | **`official_risk` 형식** | PDF(`no_data` + `source_url`)와 BE 보완안(`link_only` + `link` + `copy_text`) 중 무엇인지 | 두 형식 모두 처리, 링크 안내만 |
| 3 | **상태값 목록** | `fact`/`estimate`/`no_data`/`pending`/`unknown`/`location_unverified` + `link_only` 확정 여부, `pending`과 `no_data` 구분 규칙 | PDF 6종 + `link_only` |
| 4 | **`error.detail`·오류 시 `meta` 형식** | `detail`이 항상 있는지, 오류 시 `meta`가 `null`인지 `{}`인지 | 둘 다 처리 |
| 5 | **핵심 API 완성 예정일** | geocode·history·nearby·snapshot·data-range·activity·risk·interpret·support-links 각각 언제 쓸 수 있는지 | 그 전까지 목업(`VITE_USE_MOCK=true`)으로 개발 |
| 6 | **API 명세서 PDF 갱신** | v1.2 PDF 공유 여부, 업종·LQ·`market_change`·`official_risk`·이력 `category` 의미 반영 | [api-contract.md 차이 표](api-contract.md#명세서pdf-v11-vs-be-작업계획서-차이) |

### 함께 확인하면 좋은 것

- 기준일 필드 이름: PDF v1.1 `meta.as_of` vs 회의 자료의 "v1.2 `effective_as_of`"
- 시설 규모 `area` 다중 선택 여부와 배열 표현 (FE는 현재 단일 선택)
- `market_change`를 공식 지표 영역에 둘지 (BE: 서울시 원천 유형 그대로 = 공식)
- 이력 화면에 다른 지원 업종 점포가 나오는 방향 확정 여부
- 생활인구 안내 페이지(R12) URL
- 배포 도메인이 정해지면 `index.html`의 `og:image`·`twitter:image`를 절대 주소(https://도메인/og-image.png)로 바꾸기 (지금은 상대 경로라 일부 공유 미리보기에서 그림이 안 보일 수 있음)
