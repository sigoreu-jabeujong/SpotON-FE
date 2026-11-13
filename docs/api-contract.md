# API 계약 요약 (FE 관점)

> 마지막 갱신: 2026-11-12
> 기준: 06 API 명세서 v1.1(PDF, 2026-11-09) + BE 작업계획서(`SpotON-BE/docs/be-work-plan.md`). 둘이 다르면 BE 작업계획서를 따른다 → [차이 표](#명세서pdf-v11-vs-be-작업계획서-차이)
> 응답 예시 숫자는 모두 시연용 가상 값이다.

## 1. 공통 규칙

| 항목 | 내용 |
|---|---|
| Base 경로 | `/api` (예: `GET /api/geocode`). `.env`의 `VITE_API_BASE_URL`에는 서버 주소만 적고, `/api`는 `src/api/client.ts`가 붙인다 |
| 형식 | REST · JSON · UTF-8. 조회는 `GET`, AI 해석만 `POST` |
| 인증 | 없음 (로그인·회원가입 없음, 개인정보 수집 안 함) |
| 키 | 공공데이터·카카오 REST·LLM 키는 BE에만 있다. FE에는 카카오맵 JavaScript 키(`VITE_KAKAO_JS_KEY`, 허용 도메인 제한)만 둔다 |
| 실시간 외부 호출 | 주소 검색(카카오 로컬)과 AI 해석(LLM)뿐. 나머지는 BE가 미리 적재한 DB를 조회한다 |

### 1-1. 응답 공통 형식 `{ data, meta, error }`

```json
{
  "data": {},
  "meta": {
    "source": ["R5", "R6"],
    "as_of": "2026-10-31",
    "space": "radius_500m",
    "denominator": 46,
    "data_updated_at": "2026-11-08",
    "collected_at": "2026-11-09",
    "is_demo": false,
    "data_version": {
      "stores_batch_ids": ["rest_20261108-0300", "general_20261109-0300"],
      "trdar_quarter": "20262",
      "map_version": "v1.1",
      "rule_version": "v1.1"
    }
  },
  "error": null
}
```

| 필드 | 뜻 | 화면에서 |
|---|---|---|
| `data` | 결과. 오류면 `null` | — |
| `meta.source` | 출처 번호 **배열** (R1~R19) | 출처 표시 → [display-rules.md 출처 번호 표](display-rules.md#7-출처-번호-표) |
| `meta.as_of` | 기준일 (기준 시점 **월의 말일**, `YYYY-MM-DD`) | "기준일 YYYY.MM.DD" |
| `meta.space` | 공간 단위: `point` / `radius_{n}m` / `market` / `grid` / `seoul` | "반경 500m", "상권", "250m 격자" 등 |
| `meta.denominator` | 표본·분모. 없으면 `null` | "표본 n곳" |
| `meta.data_updated_at` | 원천 데이터 갱신 시점 최댓값(날짜) | "데이터 기준일" |
| `meta.collected_at` | 수집 배치 완료일 | "(수집 YYYY.MM.DD)" |
| `meta.is_demo` | 시연용 가상 데이터·수기 인용값이면 `true` | "시연 데이터" 표시 |
| `meta.data_version` | 배치 ID·공식 지표 분기(`trdar_quarter`, 미사용 시 `null`)·매핑/규칙 버전 | 화면 표시 안 함 (캐시·디버깅용) |
| `error` | 오류 시 `{ code, message, detail }` | [오류 코드](#5-오류-코드) |

- `/market/activity`의 `sales`·`living_pop` 블록은 집계 단위가 달라 **블록마다 자기 `meta`** 를 따로 가진다.
- ⚠️ 확인 대기: 현재 FE 타입(`src/types/api.ts`)은 `effective_as_of`라는 이름을 쓰고, 회의 자료는 "API v1.2의 현재월 `effective_as_of`"를 언급한다. 하지만 손에 있는 PDF는 v1.1이고 필드 이름이 `as_of`다. **FE 적용 기준: PDF v1.1의 `as_of`** (BE 확인 후 타입 수정).

### 1-2. 공통 조회 파라미터

`/stores/nearby`, `/stores/snapshot`, `/market/activity`, `/risk`에 공통으로 쓴다.

| 파라미터 | 타입 | 필수 | 기본값 | 값 |
|---|---|---|---|---|
| `lat`, `lng` | number | 필수 | — | `/geocode` 결과 좌표 (WGS84) |
| `category` | enum | 필수 | — | `cafe` / `restaurant` |
| `radius` | int(m) | 선택 | `500` | `300` / `500` / `1000`. 모든 수치의 공간 기준 |
| `sub_category` | string[] (쉼표 구분) | 선택 | 음식점: 전체 | 음식점: `korean`, `chinese`, `japanese`, `western` (BE 기준 4종). 카페는 세부 업종 없음 |
| `as_of` | string | 선택 (`snapshot`은 필수) | 현재 월 | `YYYY-MM`. 서버는 그 달 말일을 기준일로 계산 |
| `area` | enum | 선택 | `all` | `lt33` / `33to66` / `66to99` / `gte99` / `all` (신고 면적 ㎡) |
| `franchise` | enum | 선택 | `all` | `all` / `franchise`(프랜차이즈 추정) / `independent`(개인 매장) |
| `include_unknown_area` | bool | 선택 | `true` | 면적 "정보 없음" 점포 포함 (화면 "정보 없음 점포 포함" 체크박스) |
| `include_unknown_franchise` | bool | 선택 | `true` | 가맹 "정보 없음" 점포 포함 — 가맹 필터가 "전체"면 체크박스 값, **프랜차이즈·개인 매장이면 항상 `false`** (BE 가맹 추정 요청서 3장) |

- FE는 legacy `include_unknown`을 더 쓰지 않는다 (개별 플래그와 섞으면 422). 변환은 `src/api/params.ts` `toCommonQueryParams` 한 곳 — nearby·snapshot·activity·risk·AI 본문이 같은 값.

- 확인 대기: 시설 규모 **다중 선택** 여부와 배열 표현(BE 작업계획서 9절 "필터"). FE 적용 기준: API `area`가 단일값이므로 **하나만 선택**(URL 쿼리 `area`) → [decisions.md](decisions.md)

## 2. 엔드포인트 9개

| No | 메서드·경로 | 화면 | 기능 ID |
|---|---|---|---|
| 1 | `GET /api/geocode` | 주소·업종 입력 | F-01 |
| 2 | `GET /api/stores/history` | 과거 점포 이력 | F-02 |
| 3 | `GET /api/stores/nearby` | 주변 점포 지도·필터 | F-03, F-04 |
| 4 | `GET /api/stores/snapshot` | 시점 조회 | F-05 |
| 5 | `GET /api/meta/data-range` | 시점 선택 범위 | F-05 |
| 6 | `GET /api/market/activity` | 상권 활동 분석 | F-06 |
| 7 | `GET /api/risk` | 창업 위험도 분석 | F-07 |
| 8 | `POST /api/risk/interpret` | AI 해석 | F-08 |
| 9 | `GET /api/support-links` | 저장·상담 | F-10 |

- F-09(PDF·요약 이미지 저장)는 API 없이 FE에서 위 응답으로 만든다 (print CSS 등).
- "다른 주소 재진단"은 API 없이 입력 화면 초기화로 처리한다.
- 점포 조회는 모두 `category IN (cafe, restaurant)`이고, 검토 대상(`review`)·제외(`excluded`) 점포는 응답에 나오지 않는다.

### 2-1. `GET /api/geocode` — 주소 → 좌표·건물 키 (F-01)

| 요청 | 설명 |
|---|---|
| `query` (필수) | 도로명 또는 지번 주소. 층·호실 포함 가능 (예: "○○로 12 2층 201호") |
| `category` (필수) | `cafe` / `restaurant` |

| 응답 `data` | 타입 | 설명 |
|---|---|---|
| `address_road` / `address_jibun` | string | 도로명 / 지번 주소 |
| `lat`, `lng` | number | WGS84 좌표 |
| `category` | enum | 선택 업종 |
| `is_seoul` | bool | 서울 여부 (`false`면 오류로 응답) |
| `sigungu` | string | 자치구명 (상담 링크 정렬에 사용) |
| `building_key` | string | 지번 기준 건물 키 `{자치구}-{법정동}-{본번}-{부번}` (예: `마포구-서교동-123-4`) → `/stores/history`에 사용 |
| `floor_unit` | string \| null | 층·호실 (예: "1층"). 못 찾으면 `null` |
| `candidates` | object[] | 결과가 여러 개일 때만, 최대 5건. 각 항목은 위와 같은 구조 → FE가 사용자에게 고르게 한다 |

| 예외 | 응답 | FE 처리 |
|---|---|---|
| `query` 누락·빈 값 | 400 `INVALID_PARAM` | FE에서 먼저 막는다 |
| 업종 미선택 | 400 `CATEGORY_REQUIRED` | 다음 단계 진행 차단 |
| 검색 결과 없음 | 404 `ADDRESS_NOT_FOUND` | 주소 다시 입력 안내 |
| 서울 외 | 422 `OUT_OF_SEOUL` | 다음 단계 진행 차단 |
| 카카오 오류·쿼터 초과 | 502 `UPSTREAM_ERROR` | 잠시 후 다시 시도 |

### 2-1-1. 프랜차이즈 추정 — 이력·주변·시점 공통 (BE PR #93)

> 2026-11-12 BE `docs/fe-franchise-classification-api-request.md` 반영 (BE 요청서 최신본 11/12 17:38 기준)

공정위 기준년도(지금 2025년) 브랜드 목록과 인허가 상호가 **정확히 일치**한 기록을 "프랜차이즈(추정)"으로 준다. 실제 가맹계약·직영/가맹·현재 소속·개업 당시 소속을 확인한 값이 아니다. FE는 이름 매칭을 다시 하지 않는다.

| 행 필드 (history·nearby·snapshot) | 값 | 화면 (`utils/storeDisplay.storeFranchise`, `common/StoreFranchiseCell`) |
|---|---|---|
| `franchise` | `franchise` / `independent` / `unknown` | snapshot에도 신규 추가 |
| `franchise_basis` | `catalog_exact_name` | "프랜차이즈(추정)" + "2025년 브랜드 목록과 상호 일치 · 실제 계약·과거 소속 아님" |
|  | `external_classification` | 기존 분류 값 그대로 ("프랜차이즈"/"개인 매장") + "기존 분류 자료 기준" — 자동 일치·계약 증빙이라고 설명하지 않음 |
|  | `null` | `unknown` → "정보 없음" (개인 매장으로 바꾸지 않음) |
| `franchise_reference_year` | 정수(2025) 또는 null | 추정 도움말의 연도 |

- 표 아래 안내(`common/FranchiseNote`): 추정 행이 있으면 "프랜차이즈(추정)은 2025년 공정위 브랜드 목록과 상호가 같은 점포예요. 실제 가맹계약·직영 여부·개업 당시 소속을 확인한 값은 아니에요." — 이력·주변·시점 표, 진단서 이력 표 같은 문구. 지도 정보창도 같은 근거 문구.
- "당시 프랜차이즈였다" 같은 과거 소속 표현 금지. 과거 이력의 연도와 기준년도가 달라도 오류가 아님.

**필터** (요청 인자 추가 없음)

| 화면 선택 | 요청 |
|---|---|
| 전체 | `franchise=all`, `include_unknown_franchise`=체크박스 |
| 프랜차이즈(추정)만 | `franchise=franchise` + `include_unknown_franchise=false` |
| 개인 매장 | `franchise=independent` + `include_unknown_franchise=false` — 기존 외부 분류(false)만 고르므로 지금 자료로는 거의 0건 |

- **개인 매장 선택지는 남겨 두고 0건을 오해하지 않게 안내** (선택지를 막으면 기존 분류 자료가 생겼을 때 다시 바꿔야 해서): 조회 조건 옆 도움말 "기존 분류 자료가 있는 점포만 · 0곳으로 보일 수 있어요", 0건이면 "개인 매장 분류 자료가 아직 없어 0곳으로 보여요. 이 조건의 점포가 없다는 뜻은 아니에요" (주변 표·시점 조회), 상권 활동·종합 진단·진단서에 기준 안내 (`common/FranchiseFilterNotice`).
- 프랜차이즈만 0건이면 "브랜드 목록과 상호가 일치한 점포가 없어 0곳으로 보여요. 프랜차이즈 점포가 없다는 뜻은 아니에요".
- history는 가맹 필터를 받지 않는다 (건물 이력 그대로).

**meta·Risk·AI**

- `meta.franchise_classification`: 미적용 `pending`/`brand_mapping_blocked` → "프랜차이즈 분류 확인 중" 안내, 적용 `estimate`/`reference_catalog_name_match` + `reference_year`·`coverage=partial` 등 → 가맹 필터 시 "프랜차이즈(추정) 조건은 2025년 브랜드 목록과 상호가 같은 점포만 골라 계산해요…" 안내. 지표 상태(fact·pending)·상권 unverified와 다른 축.
- `meta.data_version.brand_mapping`(UUID·hash)은 화면에 표시하거나 조회 조건·AI 본문으로 다시 보내지 않는다.
- Risk `meta.limitations`에 `franchise_name_match_not_contract_or_history`가 올 수 있다 (오류 아님 — 가맹 필터 안내로 반영).
- 가맹 필터의 참고 폐업률·생존율은 목록명 일치로 고른 기록의 계산이며 당시 실제 프랜차이즈 코호트가 아님 (종합 진단·진단서 안내).
- AI `missing_data`의 `reason=franchise_name_match_estimate`(적용) / `classification_unverified`(미적용) → 사유 문구 (`MESSAGES.summary.reasonCodes`), 서버 `text`는 그대로.
- 진단서·요약 이미지는 가맹 필터를 골랐을 때만 조건에 "프랜차이즈(추정)/개인 매장"을 덧붙인다 (기본 "전체"는 전과 같음).

### 2-2. `GET /api/stores/history` — 같은 건물의 과거 점포 (F-02)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-store-history-api-request.md`, `docs/fe-system-audit-request.md` 3·4·5번)

| 요청 | 필수 | 설명 |
|---|---|---|
| `building_key` | 필수 | `/geocode` 결과 그대로. 잘못된 값·지원하지 않는 파라미터는 422 `INVALID_PARAM` |
| `floor_unit` | 선택 | 확인된 상세 위치만. 없으면 생략 |
| `category` | 선택 | 진단 맥락 업종 — 이력 업종 필터가 **아님** (`cafe`로 요청해도 같은 건물의 지원 음식점 이력이 함께 나온다) |

| 응답 `data` | 설명 |
|---|---|
| `total` | 이력 점포 수 |
| `stores[]` | 개업일 오름차순, **개업일 미확인은 마지막** (BE 정렬: null 마지막 → 날짜 → source → license_no) |
| `message` | 0건일 때 안내 문구, 아니면 `null` |

`stores[]` 항목 (`src/types/stores.ts`의 `HistoryStore`) — **null은 키 생략이 아니라 "값 없음"**

| 필드 | 타입 | 화면 |
|---|---|---|
| `source` | `general_restaurant` \| `rest_cafe` | 점포 식별에 함께 사용 (아래) |
| `license_no` | string | 단독 고유 식별자로 쓰지 않는다 |
| `name` | string \| null | null → "정보 없음" |
| `open_date` | `YYYY-MM-DD` \| null | null → "정보 없음"(`missing_open_date`) / "개업일 확인 필요"(`invalid_open_date`) |
| `close_date` | `YYYY-MM-DD` \| null | 영업 중이면 null. **폐업인데 null**이면 상태는 폐업 유지 + 사유별 문구(아래) |
| `operating_months` | 0 이상 정수 \| null | `0` + `fact` → "0개월" / `null` + `no_data` → "정보 없음" + 사유 |
| `operating_period_status` | `fact` \| `no_data` | 기간 계산 완료 / 미산정 |
| `operating_period_reason` | 사유 코드 \| null | 아래 표. `fact`면 null |
| `category`, `sub_category`, `store_status`, `franchise`, `floor_unit`, `location_match` | (기존과 같음) | 서버 값 그대로 (FE에서 다시 판정하지 않음) |

기간 미산정 사유 → 화면 문구 (`MESSAGES.history.periodReasons`)

| 코드 | 문구 |
|---|---|
| `missing_open_date` | 개업일 정보가 없어 기간을 확인할 수 없어요 |
| `invalid_open_date` | 개업일 확인이 필요해요 |
| `missing_close_date` | 폐업일 정보가 없어 기간을 확인할 수 없어요 |
| `invalid_close_date` | 폐업일 확인이 필요해요 |
| `missing_source_date` | 데이터 기준일 확인이 필요해요 |
| `invalid_date_order` | 개업일과 폐업일 확인이 필요해요 |
| `other_status` | 영업 상태 확인이 필요해요 |

폐업인데 `close_date=null`인 폐업일 칸: `missing_close_date` → "폐업일 정보 없음", `invalid_date_order` → "개업일·폐업일 확인 필요", 그 밖(`invalid_close_date` 등) → "폐업일 확인 필요". null만 보고 원자료가 없었다고 단정하지 않는다.

FE 처리 (이력 표·출력용 진단서 공통 — 정렬 `src/utils/history.ts`, 결측 문구 `src/utils/storeDisplay.ts`는 주변 점포·시점 조회·지도와 같이 씀)

- **점포 식별 = `source` + `license_no`** (`src/utils/storeKey.ts` → `"${source}:${license_no}"`). 관리번호가 같아도 원천이 다르면 두 행을 그대로 둔다 (BE DB `UNIQUE(source, license_no)`).
- 정렬: 최근 개업 순, 개업일 미확인 맨 뒤, 같은 날짜는 source → license_no. API·캐시 배열은 복사 후 정렬.
- 날짜·기간을 프론트에서 만들거나 채우지 않는다. 화면·`title`에 문자열 `null`·빈칸이 나오지 않게 한다.
- `meta.collected_at=null`(+ `collection_reason`)이면 수집일을 표시하지 않는다 (오늘 날짜로 채우지 않음).

| 예외 | 응답 |
|---|---|
| 이력 0건 | 200, `total: 0`, `message: "이 건물에서 확인된 음식점·카페 인허가 기록이 없어요"` |
| 층·호실 미확인 | 200, 그 점포 `location_match: "unverified"` (화면: "건물 단위 이력 / 상세 위치 미확인") |
| `building_key` 누락·잘못된 값, 지원하지 않는 파라미터 | 422 `INVALID_PARAM` |

- 건물 주소가 같아도 층·호실이 다르면 같은 자리가 아니다.
- 폐업은 **행정상 신고 기록 기준**이다.
- 목업 규칙: `bk`에 `missing` → 결측·미산정·원천 중복 경계 응답, `empty` → 0건, `error` → 500.

### 2-3. `GET /api/stores/nearby` — 반경 안 동일 업종 점포 (F-03·F-04)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-nearby-api-request.md`, `docs/fe-system-audit-request.md` 4·5번)

요청: 공통 조회 파라미터 전체. unknown 토글은 `include_unknown_area`·`include_unknown_franchise` 두 개 (1-2 참고, legacy `include_unknown`과 섞으면 422).

| 응답 `data` | 설명 |
|---|---|
| `center` | `{ lat, lng }` 입력 위치 |
| `radius_m` | 적용 반경 (지도 원 그리기용) |
| `as_of` | 실제 적용 기준일 (과거 월은 월말, 최신 월은 원천 갱신일 — FE가 월말로 바꾸지 않음) |
| `count` | 마커 수 |
| `excluded_no_coord` | 좌표가 없어 제외된 점포 수 — **반경 안 수가 아니라 서울 전체의 같은 비공간 조건 범위** (`meta.excluded_no_coord_scope=seoul_nonspatial_cohort`). 주변 점포 수와 합치지 않는다 |
| `markers[]` | 아래 표. **BE의 실제 거리 순서 그대로** (표시 거리로 다시 정렬·필터하지 않음) |
| `message` | 0건이면 안내 문구 |

| `markers[]` 필드 | 설명 |
|---|---|
| `source` | `general_restaurant` / `rest_cafe` — **`license_no`와 함께 식별** |
| `license_no` | 관리번호 (원천마다 따로 매겨져 겹칠 수 있음) |
| `name` | 상호 또는 `null` → "정보 없음" |
| `sub_category`, `lat`, `lng`, `distance_m` | 세부 업종, 좌표, 서버 계산 거리 |
| `open_date` | 시점 판단을 통과한 유효 개업일 (null 아님) |
| `close_date` | 날짜 또는 `null` |
| `operating_months` | **최신 데이터 기준 전체 영업 기간** (`meta.operating_period_basis=latest_data`, 과거 T까지로 자르지 않음). `0`은 실제 0개월, `null`은 미산정 |
| `operating_period_status`, `operating_period_reason` | `fact`/`no_data`, 이력 API와 같은 사유 코드 7종 또는 `null` |
| `current_status` | 최신 데이터 기준 상태 (선택한 과거 시점의 상태로 바꾸지 않음) |
| `franchise` | `franchise`/`independent`/`unknown` (unknown을 개인 매장으로 바꾸지 않음) |
| `area_m2` | ㎡ 또는 `null` (원본 0㎡도 `null` = 정보 없음) |

FE 처리 (지도·표 공통)

- **점포 식별 = `storeKey(source, license_no)`** — 지도 마커 관리(`overlaysRef`) 키, 마커 클릭 인자, 선택 강조, 정보창 점포 찾기, 표의 React key·선택 비교·행/버튼 클릭 인자 모두 같은 값. 같은 관리번호·다른 원천은 서로 다른 점포.
- 반경·필터·시점이 바뀌면 이전 마커를 지도에서 내리고 선택(강조·정보창)을 푼다 (조건을 되돌려도 이전 선택이 살아나지 않음).
- 상호·기간 결측은 `src/utils/storeDisplay.ts`로 표시: 상호 `null` → "정보 없음", 기간 `null` → "정보 없음" + 사유. 표·정보창·마커 `title`·"지도에서 보기" 버튼 이름에 문자열 `null`·빈 제목이 나오지 않는다.

| 예외 | 응답 |
|---|---|
| 조건에 맞는 점포 0건 | 200, `count: 0`, `markers: []`, `message` |
| `category` 누락·잘못된 업종 | 422 `CATEGORY_REQUIRED` |
| 그 밖의 잘못된 인자 (`radius` 허용값 외, 중복·미지원 인자 등) | 422 `INVALID_PARAM` |
| `as_of` 범위 밖 | 422 `AS_OF_OUT_OF_RANGE` |
| 기준일·배치 미준비, DB 오류 | 500 `INTERNAL_ERROR` — 0건으로 바꾸지 않음 (화면: 오류 안내 + 다시 시도) |

- 기준 시점 T에 영업 중 = `인허가일 ≤ T` 그리고 (`폐업일 없음` 또는 `폐업일 > T`). 반경 경계(거리 = 반경)는 포함.
- 마커 색은 `current_status`(지금 상태)로 구분한다.
- 목업 규칙: 결과 화면 주소의 `bk` 또는 `address`에 `dup` → 300m 안에 경계 점포 4곳 추가 (같은 관리번호·다른 원천 2곳(좌표 다름, 표시 거리 같음) + 상호 `null` + 기간 `no_data`). nearby 요청에는 `bk`가 없어 목업이 화면 주소를 읽는다.

### 2-4. `GET /api/stores/snapshot` — 과거 시점 점포의 지금 상태 (F-05)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-store-snapshot-api-request.md`)

요청: 공통 조회 파라미터 전체, **`as_of` 필수**.

| 응답 `data` | 설명 |
|---|---|
| `as_of` | 실제 적용 기준일 T |
| `total_at_as_of` | N: T 시점 동일 업종 점포 수 |
| `still_open` | A: 최신 데이터 기준 영업 |
| `closed_since` | B: T 이후 폐업 |
| `other` | 휴업 등 기타/미확인 |
| `stores[]` | `source`, `license_no`, `name`(null 가능), `sub_category`, `lat`, `lng`, `open_date`, `close_date`, `operating_months`(null 가능), `operating_period_status`, `operating_period_reason`, `current_status` — nearby의 거리·가맹·면적은 없음 |
| `summary_text` | 서버 문장 그대로 (FE가 다시 만들지 않음) |
| `excluded_no_coord` | 좌표 미확보 수 (서울 전체 범위, N에 포함하지 않음) |

- 항상 `N = A + B + other = stores.length`. FE는 계산하지 않고 받은 값을 그대로 쓴다.
- 표는 nearby와 같은 식별(`storeKey`)·결측 표시(`storeDisplay`). 폐업인데 폐업일이 없으면 이력과 같은 사유별 문구.
- 같은 조건이면 snapshot `stores`와 nearby `markers`의 점포·순서·기간이 같다 (FE가 다시 거르거나 정렬하지 않음).

| 예외 | 응답 |
|---|---|
| `category` 누락·잘못된 업종 | 422 `CATEGORY_REQUIRED` |
| `as_of` 누락·형식 오류, 일반 입력 오류 | 422 `INVALID_PARAM` |
| 허용 월 밖 | 422 `AS_OF_OUT_OF_RANGE`, `detail`에 `min_month`·`max_month` |
| 출처·기준일 미준비, DB 실패 | 500 `INTERNAL_ERROR` |

### 2-5. `GET /api/meta/data-range` — 시점 선택 가능 범위 (F-05)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-data-range-api-request.md`)

| 요청 | `category`(필수), `sub_category`(선택, 쉼표) — **주변 조회와 같은 업종 조건** (`toDataRangeParams`: 음식점에서 세부 업종을 골랐을 때만, 카페는 생략). 좌표·반경·시점·면적·가맹은 보내지 않음 |
|---|---|
| 응답 `data` | `min_month`(`YYYY-MM` 또는 **`null`**), `max_month`(`YYYY-MM`), **`max_date`**(최신 월의 실제 기준일), `data_updated_at`, `collected_at`(현재 `null`) |

- 시점 선택 UI에서 범위 밖 월을 비활성화하는 데 쓴다. 세부 업종이 바뀌면 다시 요청한다 (query key에 포함).
- **`min_month=null`(유효 표본 없음)** 이면 연·월·빠른 선택을 모두 막고 "선택한 업종은 과거 시점 자료가 없어 현재 기준으로만 볼 수 있어요" 안내. `max_month`로 채우지 않는다.
- 범위 조회 오류(500)는 빈 범위로 바꾸지 않고 "기간을 불러오지 못해 현재 기준으로만" 안내.
- 최신 월의 기준일은 월말이 아니라 `max_date`·각 조회 응답의 `as_of`. `collected_at=null`을 오늘 날짜로 채우지 않는다.

### 2-6. `GET /api/market/activity` — 개·폐업 변화와 상권 지표 (F-06)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-market-activity-api-request.md`)

요청: 공통 조회 파라미터 전체 + `include`(선택 항목 `sales`, `living_pop`, 쉼표 구분). 미요청이면 **생략** (빈 문자열·빈 토큰·중복·대문자·모르는 항목은 422). FE는 `ACTIVITY_INCLUDE`로 두 항목을 항상 요청한다.

| 응답 `data` | 설명 |
|---|---|
| `recent_12m` | `{ period, opened, closed }` — `period`는 `(시작일, 종료일]` 실제 기간, 개·폐업 **사건 수** (폐업한 점포 기록 포함) |
| `yearly_trend[]` | `{ year, opened, closed }` — **사건 기록이 있는 연도만** (없는 연도를 0으로 채우지 않음). 비교 기간은 `meta.yearly_comparison_basis`·`yearly_periods` |
| `by_sub_category[]` | `{ sub_category, open_count, avg_operating_months }` — T에 유효한 점포 수, 그 점포들이 **T까지 경과한 개월의 평균(버림)**. `0` = 실제 0개월, `null` = 계산 불가(정보 없음) |
| `sales` | (선택) `{ markets[], status: "estimate", meta }` — 상권별로 따로, 합산 금지. **지금 BE는 항상 `null`** |
| `living_pop` | (선택) `{ date, total, grid_count, missing_grid_count, status: "estimate", meta }` — 250m 격자. **지금 BE는 항상 `null`** |
| `flags.missing` | **요청했지만** 미산정인 선택 항목만 (미요청 항목은 넣지 않음) |

| `meta` (활동 전용, 선택 필드) | 설명 · FE 처리 |
|---|---|
| `denominator` | `null` — 활동 응답 전체의 분모 없음 (평균의 분모는 업종별 `open_count`) |
| `cohort_size` | 폐업 기록 포함 활동 집계 대상 수 — 현재 영업 점포 수로 표시하지 않음 (화면에 안 씀) |
| `yearly_comparison_basis`, `yearly_periods` | `same_month_day_ytd`면 연도별 추이 아래 "매년 1월 1일부터 M월 D일까지 같은 기간끼리 비교" 안내 (서버 기간을 읽기만 함) |
| `operating_period_basis` | `elapsed_months_of_active_at_as_of` — 평균 영업 기간 카드 설명 "기준 시점까지 경과 기간 평균". 이력·주변의 전체 영업 기간과 합치지 않음 |
| `franchise_classification` | 지금 `{ status: "pending", reason: "brand_mapping_blocked" }` — 프랜차이즈 조건을 고르면 "프랜차이즈 분류 확인 중… 점포가 없다는 뜻은 아니에요" 안내 |
| `optional_data` | 요청한 선택 항목의 `{ status, reason }`. `pending`이면 블록에 **"자료 확인 중" + 사유 문구** (숫자 안 만듦) |
| `excluded_no_coord` | 서울 전체 범위 좌표 미확보 수 (T 이전 개업 기록) — 화면에 안 씀, 점포 수와 합치지 않음 |
| `collected_at` | `null` — 오늘 날짜로 채우지 않음 |

선택 항목 표시 (`src/components/analysis/activity/optionalData.ts` — 화면 블록·진단서 공통)

| 상태 | 화면 | 진단서 |
|---|---|---|
| 값 있음 | 상권별 추정매출 / 생활인구 카드 | 값 그대로 |
| `optional_data[item].status = pending` | "자료 확인 중" + 사유 (`source_period_and_boundary_unverified` → 매출 집계 기간과 적용 경계를 확인하고 있어요, `population_aggregation_and_grid_time_unverified` → 생활인구 집계 기준을 확인 중이에요) | "자료 확인 중 (사유)" |
| 그 밖에 값 없음 | "자료 없음 · 아직 확보하지 못한 자료예요" | "자료 없음" |

- 오류: 입력 422 `INVALID_PARAM`·`CATEGORY_REQUIRED`, 범위 밖 422 `AS_OF_OUT_OF_RANGE`, 자료 준비 실패 500 `INTERNAL_ERROR` (화면: 오류 안내 + 다시 시도).
- 목업 규칙: 기준 시점 2025-01 이전 → 추정매출 없음, 2021-01 이전 → 생활인구 없음 (자료 없음). 결과 화면 주소의 `bk`·`address`에 `pending` → 실제 BE처럼 두 항목 null + `optional_data` pending. 가맹 분류는 항상 pending, `denominator`는 null.

### 2-7. `GET /api/risk` — 공식 지표 + 참고지표 (F-07)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-risk-reference-api-request.md`, `docs/fe-system-audit-request.md` 2번)

요청: 공통 조회 파라미터 전체 + `include`(선택 지표 `market_change`·`day_night_ratio`, 미요청이면 생략). 응답 `data` = `query`, `market`, `indicators[]`, `flags`.
지금 FE는 Risk GET에 `include`를 넣지 않는다 (실제 BE는 이때 선택 지표 2개를 돌려주지 않을 수 있다 — 화면은 받은 지표만 그린다).

**`data.market` (상권 판정)**

| 필드 | 설명 |
|---|---|
| `status` | `in_market` / `outside` / **`unverified`(공식 상권 적용 기준 확인 중)** — 지금 BE는 항상 `unverified` |
| `market_code`, `market_name`, `market_type` | 판정된 상권 (`outside`·`unverified`면 `null`) |
| `also_in[]` | 함께 속한 관광특구 (`unverified`면 `[]`) |
| `nearby_markets[]` | `outside`일 때 반경에 걸친 상권 (`unverified`면 `[]`) |
| `reason` | 미확인 사유 코드 (예: `boundary_period_not_verified`) |
| `spatial_candidate` | (선택) 지정 경계 파일 형상에 대한 **후보** — 확정 상권이 아니다. **FE는 화면에 쓰지 않는다** |

- **`unverified`는 상권 안·밖으로 확정하지 않는다** — "공식 상권 적용 기준을 확인 중이에요" 안내 (`MarketCard`·진단서 같은 기준). 상권 밖으로 바꿔 표시하지 않는다.
- 상권 밖이면 공식 수치는 `null`/`no_data`. 가까운 상권 수치로 대신하지 않는다.

**`indicators[]` 지표 객체**

| 필드 | 설명 |
|---|---|
| `id`, `type` | 지표 ID, `official` / `reference` |
| `value` | 숫자·문자열·`null`. **실제 0은 `0` + `fact`**, 표본 부족·0분모는 `null` + `pending` |
| `unit` | `%`, `개`, `배`, `grade`, `type` |
| `seoul_avg`, `seoul_avg_reason` | 서울 비교값(같은 필터·좌표 확보 기록의 분자합/분모합)과 미산정 사유 코드. 동종업체 수는 `not_applicable` |
| `seoul_numerator`, `seoul_denominator` | 서울 비교의 분자·분모 (FE에서 역산하지 않음) |
| `numerator`, `denominator` | 분자·분모. 표본 부족이면 `numerator=null`, `denominator`=실제 표본 수 |
| `space`, `period` | 공간 단위, 분석 기간 (참고지표는 `(L, U]` — 시작일 제외·종료일 포함) |
| `source`, `source_url` | 출처 번호 **배열** (예: `["R5","R6"]`), 원문/안내 URL 또는 `null` |
| `status`, `reason` | 상태 라벨, 보류·결측 **사유 코드** |

사유 코드 → 화면 문구 (`MESSAGES.summary.reasonCodes`, `indicatorReasonText`). 모르는 영문 코드는 일반 문구("자료를 확인 중이에요")로, 문장이면 그대로.

| 코드 | 문구 |
|---|---|
| `insufficient_sample` | 표본이 적어 판단을 보류했어요 |
| `zero_denominator` | 계산 대상 점포가 없어요 |
| `boundary_period_not_verified` | 공식 상권 적용 기준을 확인 중이에요 |
| `boundary_version_not_selected` | 공식 상권 경계를 확인 중이에요 |
| `population_aggregation_and_grid_time_unverified` | 생활인구 집계 기준을 확인 중이에요 |
| `not_applicable` (서울 비교) | 서울 비교 대상이 아니에요 |

**지표 ID와 지금 BE 동작**

| id | type | 내용 | 지금 BE |
|---|---|---|---|
| `official_closure_rate` | official | 서울시 공표 폐업률 그대로 인용, **정수 %** | `null` + `pending` (`boundary_period_not_verified`) |
| `official_risk` | official | 서울시 창업위험도 — 수치 대신 **링크 안내** | `link_only` + `link`, `copy_text=null` |
| `closure_rate_12m` | reference | 최근 12개월 참고 폐업률, 소수 첫째 자리 % | 기간 분모 10건 미만 → `pending` |
| `survival_rate_1y`, `survival_rate_3y` | reference | 개업 1·3주년 생존율 (고정 관측 — 현재 잔존율 아님) | 코호트 5건 미만 → `pending` |
| `competitor_count` | reference | 반경 안 동종업체 수 (0도 `fact`) | 서울 비교 `not_applicable` |
| `market_change` | official | 서울시 원천 상권변화 유형 (요청 시) | `pending` (`boundary_period_not_verified`) |
| `day_night_ratio` | reference | 주야간 생활인구 비 (요청 시) | `pending` (`population_aggregation_and_grid_time_unverified`) |
| ~~`lq`~~ | — | **제외** | 화면에 만들지 않음 |

- `official_risk`는 PDF v1.1 형식(`no_data` + `source_url`)도 FE가 계속 처리한다 (목업의 상권 안 카페 예시).
- `flags`: `{ insufficient_sample, missing }` — `insufficient_sample`은 참고 폐업률·생존율 표본 미달일 때만, `missing`은 공식 폐업률 검증 경계·요청한 선택 항목만.
- 준비/DB 실패는 500 `INTERNAL_ERROR`. 정상 0건으로 바꾸지 않는다 (로컬 DB가 비어 있으면 500이 정상).

### 2-8. `POST /api/risk/interpret` — AI 해석 (F-08)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-risk-interpret-api-request.md`, `docs/fe-system-audit-request.md` 1번)

사용자가 **"AI 해석 보기"를 눌렀을 때만** 호출한다. 자동 재호출하지 않고, 다시 시도는 사용자 버튼으로만.

**요청 본문 = 원래 조회 조건만 (query-only)** — `{ "query": { ... } }`

| `query` 필드 | 설명 |
|---|---|
| `lat`, `lng` | JSON 숫자 |
| `category` | `cafe` / `restaurant` |
| `radius` | `300` / `500` / `1000` (응답의 `radius_m` 아님) |
| `sub_category` | 음식점 세부 업종 배열 (있을 때만) |
| `as_of` | `YYYY-MM` — **최신 조회면 생략** (오늘 월을 넣지 않음, 응답의 일 단위 날짜를 자르지 않음) |
| `area`, `franchise` | Risk GET과 같은 값 |
| `include_unknown_area`, `include_unknown_franchise` | Risk GET과 같은 값 (legacy `include_unknown`과 섞으면 422) |
| `include` | Risk GET에 넣었을 때만 같은 값 (지금 FE는 Risk GET에 쓰지 않아 생략) |

- 보내지 않는 것: Risk 응답의 `market`·`indicators`·`flags`·`context`, 응답 `query`(`radius_m`·`filters`), `building_key`·`floor_unit`, 주소·상호·화면 수치. 서버가 같은 조건으로 Risk를 다시 계산해 문장을 조립한다.
- 코드: `AiInterpretation`이 `SummaryPage`의 `params`(Risk GET과 같은 조건)로 본문을 만든다. 전송 대기 25초 (서버 예산 20초 + 여유).

| 응답 `data` | 설명 (화면 순서) |
|---|---|
| `label`, `method` | `"AI 해석"`, `server_sentences_model_ordering` (서버가 검증한 문장을 모델이 정렬) |
| `official_values[]` | (1) **확인된 계산값 요약** — 참고지표도 있으므로 "공식 통계"라고 부르지 않는다. BE #96부터 끝에 상권 활동 **참고 계산 문장**(최근 개폐업 1개 + 세부 업종마다 평균 경과 기간 1개 — 카페 1개, 음식점 전체 4개)이 붙는다 |
| `favorable[]` / `unfavorable[]` | (2)(3) 서울 비교가 가능한 비율만. 비어 있어도 채우지 않는다 |
| `missing_data[]` | (4) 부족한 자료 `{ text, reason }` |
| `checklist[]` | (5) 계약 전 현장 확인사항 1~3개 |
| `verification` | 형식·문장 안전성 검사 표시 — **정확도 점수 아님**. `regenerated` = 이번 요청에서 1회 재생성 여부 |
| `model`, `generated_at` | 모델명, **이번 응답의 서버 문장 조립 시각(UTC)** — 새 모델 호출 시각 아님 (화면: "응답 시각") |

**근거 칩 (`indicator_ids`, `EvidenceChips` · `ai/evidenceChip.ts`)**

| ID | 칩 이름 | 누르면 |
|---|---|---|
| Risk 지표 ID (`closure_rate_12m` 등) | 지표 이름 (`INDICATOR_NAME`) | 종합 진단의 그 지표 카드로 이동 |
| `recent_open_close` (BE #96) | 최근 개폐업 기록 | **이동하지 않는 글자 칩** — 해당 카드는 STEP 02 상권 활동에 있어 옮겨 가면 보고 있던 AI 해석이 사라짐 |
| `avg_operating_months` (BE #96) | 평균 경과 기간 | 이동하지 않는 글자 칩 |
| 그 밖의 새 ID | 기타 근거 | 이동하지 않음 (영문 코드 노출 금지) |

- `avg_operating_months`는 여러 문장에 반복되므로 목록 key는 문장 text, 칩 key는 `ID-순서`.
- 평균 경과 기간 = 기준일에 영업 중인 기록의 개업 후 경과 개월 평균(버림). 점포 수명·생존 기간·영업 성과로 바꿔 쓰지 않고 서버 문장 그대로.
- favorable/unfavorable의 `indicator_ids`는 기존 Risk 지표 ID만 온다. 활동 집계와 Risk가 맞지 않으면 서버 500 → 기존 AI 실패 처리(지표 유지).

| 예외 | 응답 | FE 처리 |
|---|---|---|
| 본문 형식 오류 | 422 `INVALID_PARAM` | 입력 형식 오류 안내 (지표 재조회 안 함), 지표 그대로 |
| 서버 DB·준비 오류 | 500 `INTERNAL_ERROR` | 지표 그대로 + "AI 해석을 불러오지 못했어요" + 다시 시도 버튼 |
| 공급자·한도·예산 실패 | 503 `AI_UNAVAILABLE` | 위와 같음 |
| 검증 2회 실패 | 503 `AI_VERIFY_FAILED` | 위와 같음 |

- 조건(필터·시점)이 바뀌면 AI 영역을 새로 만들어 이전 결과를 보이지 않게 한다 (`key={search}`).
- 목업: 본문이 query-only가 아니면 422, `radius=1000` → 503 `AI_UNAVAILABLE`, `radius=300` → 503 `AI_VERIFY_FAILED`.

### 2-9. `GET /api/support-links` — 상담·지원 링크 (F-10)

> 2026-11-12 BE 실제 계약 반영 (BE `docs/fe-support-links-api-request.md`, support-links-v2). DB 없이 동작

| 요청 | 설명 |
|---|---|
| `sigungu` (선택) | 서울 25개 구의 정확한 이름 (예: `마포구`). "서울특별시" 접두사·빈 값·`null` 문자열은 422 → FE는 값이 없으면 보내지 않음 (client가 null·빈 값 생략) |
| `category` (선택) | `cafe` / `restaurant`. **목록·순서에 영향 없음** (`category_applied: false`) |

- 주소·좌표·건물 키는 보내지 않는다.
- 응답 `data.links[]` = `{ id, org_name, title, description, url, type(consulting / support_program), region, last_checked }` (모든 키 있음). 출처 R17.
- 구 생략: 공통 4곳 (서울시 자영업지원센터 → 소상공인아카데미 → 서울시 소상공인 지원사업 안내 → 소상공인24).
- **구 지정: 관할 지역센터 1곳(`semas-seoul-*`)이 맨 앞 + 공통 4곳 = 5곳.** 서버 순서 그대로, 자르거나 다시 정렬하지 않음. key는 `id` (관할 센터 URL은 모두 같은 중기부 공고라 URL로 합치지 않음).
  - 관할: jungbu 중구·종로구·성북구·동대문구 / dongbu 광진구·성동구·강동구·중랑구 / seobu 강서구·양천구·영등포구 / nambu 강남구·서초구·송파구 / bukbu 노원구·도봉구·강북구 / dongjak 동작구·용산구 / gwanak 관악구·구로구·금천구 / seodaemun 서대문구·은평구·마포구 (2026-10-01 공고 기준, 거리 순 아님)
- 설명·확인일(`last_checked`)은 서버 값 그대로. "맞춤 지원사업·신청 가능·자격" 표현을 쓰지 않는다. 외부 링크는 새 창(`rel="noopener noreferrer"`).

| `meta` (선택 필드) | 설명 · FE 처리 |
|---|---|
| `link_catalog_version` | `support-links-v2` |
| `prioritization` | `not_applied`/`general_links_only` 또는 `applied`/`district_contact_first`(+`category_applied:false`) — `applied`면 첫 항목에 "관할 지역센터 연락처" 배지 |
| `district_contact_source` | 구 지정 시만 `{ url, published_on, checked_on, page, table }` → "관할 연락처는 중소벤처기업부 공고(공고일) 첨부 N쪽 기준이에요 · 확인일" |
| `data_updated_at` | 링크 확인일 최댓값 — 분석 기준일과 합치지 않음 (화면에 안 씀) |

- 링크 아래 "모집 기간·지원 조건은 연결된 공식 사이트에서 확인해 주세요" 안내.
- 오류: 422 `INVALID_PARAM`, 500 → 오류 안내 + 다시 시도.
- 목업은 같은 구조 (관할 센터 문구는 2026-11-12 로컬 BE 응답을 옮김).

## 3. 열거값

| 필드 | 값 → 화면 표시 |
|---|---|
| `status` (지표·항목 상태) | `fact` 확인된 사실 / `estimate` 통계적 추정 / `no_data` 자료 없음 / `pending` 판단 보류 / `unknown` 정보 없음 / `location_unverified` 상세 위치 미확인 |
| `type` (지표 구분) | `official` "서울시 공식" / `reference` "Spot:ON 참고지표" |
| `store_status`, `current_status` | `open` 영업 중 / `closed` 폐업 / `other` 기타(휴업 등) |
| `franchise` (점포) | `franchise` 프랜차이즈(추정) / `independent` 개인 매장 / `unknown` 정보 없음 |
| `location_match` | `same_spot` 같은 자리 / `same_building` 같은 건물 다른 위치 / `unverified` 상세 위치 미확인 |
| `market.status` | `in_market` 상권 안 / `outside` 상권 밖 |

- 확인 대기: BE 작업계획서는 `pending`(자료 미확보)과 `no_data`(확보했지만 결측)를 구분하고, `official_risk`에 `link_only`를 새로 제안했다. 전체 상태값 목록은 BE와 맞춘 뒤 확정한다.

> 📝 **반영 완료 (작업 2)**: `src/constants/labels.ts`의 상태 키를 API 값(`pending`·`unknown`·`location_unverified`)으로 바꾸고 `link_only`를 추가했다. `src/types/api.ts`의 meta는 `as_of` 기준으로 정리했고 `effective_as_of`는 "v1.2 이름 확인 대기" 선택 필드로 남겼다.
>
> 코드 위치: 공통 타입 `src/types/api.ts`, 엔드포인트별 타입 `src/types/{geocode,stores,market,risk,support,meta}.ts`, 호출 함수 `src/api/*.ts`, 쿼리 훅 `src/hooks/use*.ts`, 목업 `src/api/mocks/`.

## 4. 값 형식

| 대상 | API | 화면 |
|---|---|---|
| 날짜 | `YYYY-MM-DD` | `YYYY.MM.DD` |
| 영업 기간 | `operating_months` (정수, 개월, 소수점 버림) | "n년 m개월" |
| 참고지표 비율 | 소수 첫째 자리 % | 그대로 |
| 공식 폐업률 | 공표값 정수 % | 그대로 |
| 점포 수 | 정수 | 그대로 |
| 산정 안 한 값 | `null` + `status` + `reason` | 0이 아니라 사유를 표시 |

## 5. 오류 코드

| HTTP | code | 상황 | FE 안내 문구 |
|---|---|---|---|
| 400 | `INVALID_PARAM` | 필수 파라미터 누락, 허용 범위 밖 값 | 입력값을 다시 확인해 주세요. |
| 400 | `CATEGORY_REQUIRED` | 업종 미선택 | 카페 또는 음식점을 선택해 주세요. |
| 404 | `ADDRESS_NOT_FOUND` | 주소 검색 결과 없음 | 주소를 찾지 못했어요. 도로명 또는 지번 주소로 다시 입력해 주세요. |
| 422 | `OUT_OF_SEOUL` | 서울특별시 외 주소 | 현재는 서울특별시 주소만 진단할 수 있어요. |
| 422 | `AS_OF_OUT_OF_RANGE` | 기준 시점이 데이터 제공 범위 밖 | 선택한 시점은 데이터 제공 범위 밖이에요. |
| 502 | `UPSTREAM_ERROR` | 카카오 로컬 등 외부 API 오류·쿼터 초과 | 잠시 후 다시 시도해 주세요. |
| 503 | `AI_UNAVAILABLE` | LLM 응답 실패·한도 초과 | AI 해석을 불러오지 못했어요. (지표는 그대로 표시) |
| 503 | `AI_VERIFY_FAILED` | 재생성 후에도 숫자·출처 불일치 | AI 해석을 불러오지 못했어요. (지표는 그대로 표시) |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 | 일시적인 오류가 발생했어요. |

### BE 단계 연결 (API별 목업 스위치)

- `.env`에 `VITE_USE_MOCK=true`를 두고 `VITE_REAL_API_PATHS`에 BE가 완성한 경로만 쉼표로 적는다 (예: `VITE_REAL_API_PATHS=/geocode,/stores/history`). 적은 경로는 `VITE_API_BASE_URL` 서버로, 나머지는 목업으로 호출한다.
- 경로는 `src/api/mocks/index.ts`의 `mockRoutes` 키와 같은 형식이다. 빈 값이면 전부 목업, `VITE_USE_MOCK=false`면 이 값은 무시되고 전부 실제 서버로 간다.
- `.env`를 바꾸면 개발 서버를 다시 시작한다. 개발 모드에서는 콘솔에 `[api] 실제 서버: …`로 어떤 경로가 실제 서버로 가는지 표시된다.

FE 전용 오류 (`src/api/client.ts`): `TIMEOUT`(15초 초과), `NETWORK_ERROR`(서버 연결 실패), `INVALID_RESPONSE`(형식 오류), `EMPTY_DATA`(`data`가 `null`).

오류 응답 예시 (PDF v1.1):

```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "OUT_OF_SEOUL",
    "message": "현재는 서울특별시 주소만 진단할 수 있어요.",
    "detail": { "region_1depth": "경기도" }
  }
}
```

## 명세서(PDF v1.1) vs BE 작업계획서 차이

| 항목 | 명세서 PDF v1.1 | BE 작업계획서 | FE 적용 기준 | 상태 |
|---|---|---|---|---|
| 지원 업종 | 음식점 8종(`korean`·`chinese`·`japanese`·`western`·`snack`·`chicken`·`pub`·`etc`) + 카페 3종(`cafe`·`kids_cafe`·`live_cafe`) | 음식점 4종(한식·중식·일식·양식) + 카페 단일(세부 선택 없음). 분식·치킨·주점·기타·키즈카페·라이브카페·제과점 제외 | **BE 작업계획서** (`src/constants/diagnosis.ts`에 반영됨) | 동기화 대기 (PDF 갱신 필요) |
| LQ | 선택 지표로 포함 | 제외 지표 | **제외** — 화면·타입에 만들지 않음 | 동기화 대기 |
| `market_change` | `reference`, 영업 기간 기반 자체 계산(HH/HL/LH/LL) | 서울시 원천 상권변화 유형을 그대로 쓰는 **공식 지표** | **공식 지표 영역**에 표시, 조건부(자료 확보 후) | 확인 대기 |
| `official_risk` | `value: null`, `status: no_data`, `reason`, `source_url` (시연 주소만 수기 인용) | 링크 전용 `status: link_only`, `link`, `copy_text` (案) | 두 형식 모두 처리. 수치·등급은 만들지 않음 | 확인 대기 |
| 이력 `category` | "지정 시 해당 업종만, 생략 시 전체" (필터) | **진단 맥락**. 지원 업종(카페·음식점 4종) 전체 이력을 보여주고 다른 지원 업종을 걸러내지 않음. 제외 업종은 포함하지 않음 | 이력에는 다른 지원 업종 점포도 나올 수 있게 화면 구성 | 확인 대기 |
| `error.detail` | `{ code, message, detail }` (`detail`은 상황별 객체) | `code`·`message`만 언급 | `detail`은 **있을 수도 없을 수도** 있는 선택 필드로 처리 | 확인 대기 |
| 오류 시 `meta` | `null` | health 예시는 성공 시 `meta: {}`. 오류 시 형식 언급 없음 | `null`과 `{}` 둘 다 처리 | 확인 대기 |
| 조건부 지표 미확보 | `null` + `flags.missing` | `value: null`, `status: pending` + 사유 | 둘 다 처리. `pending`이면 "판단 보류" | 동기화 대기 |
| 기준일 필드명 | `meta.as_of` | 언급 없음 | `as_of` (FE 타입의 `effective_as_of`는 다음 작업에서 정리) | 확인 대기 |
| 명세서 버전 | PDF는 v1.1 | "API 명세서 v1.2가 FE↔BE 계약" | v1.2 PDF를 받으면 이 문서를 갱신 | 확인 대기 |
