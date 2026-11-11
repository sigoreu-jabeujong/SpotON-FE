# API 계약 요약 (FE 관점)

> 마지막 갱신: 2026-11-10
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
| `include_unknown` | bool | 선택 | `true` | 면적·프랜차이즈가 "정보 없음"인 점포 포함 여부 |

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

### 2-2. `GET /api/stores/history` — 같은 건물의 과거 점포 (F-02)

| 요청 | 필수 | 설명 |
|---|---|---|
| `building_key` | 필수 | `/geocode` 결과 |
| `floor_unit` | 선택 | 있으면 점포별 `location_match` 판정에 사용 |
| `category` | 선택 | 진단 맥락 업종. 의미는 [차이 표](#명세서pdf-v11-vs-be-작업계획서-차이) 참고 |

| 응답 `data` | 설명 |
|---|---|
| `total` | 이력 점포 수 |
| `stores[]` | 인허가일 오름차순: `license_no`, `name`, `category`, `sub_category`, `open_date`, `close_date`, `operating_months`, `store_status`, `franchise`, `floor_unit`, `location_match` |
| `message` | 0건일 때 안내 문구, 아니면 `null` |

| 예외 | 응답 |
|---|---|
| 이력 0건 | 200, `total: 0`, `message: "이 건물에서 확인된 음식점·카페 인허가 기록이 없어요"` |
| 층·호실 미확인 | 200, 그 점포 `location_match: "unverified"` (화면: "건물 단위 이력 / 상세 위치 미확인") |
| `building_key` 누락 | 400 `INVALID_PARAM` |

- 건물 주소가 같아도 층·호실이 다르면 같은 자리가 아니다. 인허가번호가 다르면 다른 점포다.
- 폐업은 **행정상 신고 기록 기준**이다.

### 2-3. `GET /api/stores/nearby` — 반경 안 동일 업종 점포 (F-03·F-04)

요청: 공통 조회 파라미터 전체.

| 응답 `data` | 설명 |
|---|---|
| `center` | `{ lat, lng }` 입력 위치 |
| `radius_m` | 적용 반경 (지도 원 그리기용) |
| `as_of` | 기준일 T |
| `count` | 마커 수 |
| `excluded_no_coord` | 좌표가 없어 제외된 점포 수 → 화면에 함께 안내 |
| `markers[]` | `license_no`, `name`, `sub_category`, `lat`, `lng`, `distance_m`, `open_date`, `close_date`, `operating_months`, `current_status`, `franchise`, `area_m2` |
| `message` | 0건이면 "조건에 맞는 점포가 없어요" |

| 예외 | 응답 |
|---|---|
| 조건에 맞는 점포 0건 | 200, `count: 0`, `markers: []`, `message` |
| `category` 누락 | 400 `CATEGORY_REQUIRED` |
| `radius` 허용값 외 | 400 `INVALID_PARAM` |
| `as_of` 범위 밖 | 422 `AS_OF_OUT_OF_RANGE` |

- 기준 시점 T에 영업 중 = `인허가일 ≤ T` 그리고 (`폐업일 없음` 또는 `폐업일 > T`). 반경 경계(거리 = 반경)는 포함.
- 마커 색은 `current_status`(지금 상태)로 구분한다.

### 2-4. `GET /api/stores/snapshot` — 과거 시점 점포의 지금 상태 (F-05)

요청: 공통 조회 파라미터 전체, **`as_of` 필수**.

| 응답 `data` | 설명 |
|---|---|
| `as_of` | 기준일 T |
| `total_at_as_of` | N: T 시점 동일 업종 점포 수 |
| `still_open` | A: 지금도 운영 중 |
| `closed_since` | B: 이후 폐업 |
| `other` | 휴업 등 기타 |
| `stores[]` | `license_no`, `name`, `sub_category`, `lat`, `lng`, `open_date`, `close_date`, `operating_months`, `current_status` |
| `summary_text` | 예: "2023.10 시점 동일 업종 12곳 → 지금도 운영 중 7곳 · 폐업 5곳" |

- 항상 `N = A + B + other`. FE는 계산하지 않고 받은 값을 그대로 쓴다.

| 예외 | 응답 |
|---|---|
| `as_of` 누락·형식 오류 | 400 `INVALID_PARAM` |
| 가장 이른 인허가일 이전 / 미래 월 | 422 `AS_OF_OUT_OF_RANGE`, `detail`에 `min_month`·`max_month` |

### 2-5. `GET /api/meta/data-range` — 시점 선택 가능 범위 (F-05)

| 요청 | `category` |
|---|---|
| 응답 `data` | `min_month`(`YYYY-MM`), `max_month`(`YYYY-MM`), `data_updated_at`, `collected_at` |

- 시점 선택 UI에서 범위 밖 월을 비활성화하는 데 쓴다. 유효 표본이 없으면 BE가 날짜를 만들어내지 않는다.

### 2-6. `GET /api/market/activity` — 개·폐업 변화와 상권 지표 (F-06)

요청: 공통 조회 파라미터 전체 + `include`(선택 항목: `sales`, `living_pop`, 쉼표 구분).

| 응답 `data` | 설명 |
|---|---|
| `recent_12m` | `{ period, opened, closed }` 최근 12개월 개업·폐업 수 |
| `yearly_trend[]` | `{ year, opened, closed }` 데이터 있는 연도만 |
| `by_sub_category[]` | `{ sub_category, open_count, avg_operating_months }` |
| `sales` | (조건부) `{ markets: [{ market_code, market_name, quarter, est_sales, unit }], status: "estimate", meta }` — **상권별로 따로**, 합산 금지 |
| `living_pop` | (조건부) `{ date, total, grid_count, missing_grid_count, status: "estimate", meta }` — 250m 격자 |
| `flags` | `{ missing: string[] }` 자료가 없는 선택 항목 (`sales`, `living_pop`) |

- 요청하지 않았거나 자료가 없으면 `sales`/`living_pop`은 `null`이고 `flags.missing`에 이름이 들어간다.
- BE 작업계획서: 조건부 지표는 자료 확보 전에는 `value = null`, `status = pending` + 사유로 준다 (동기화 대기).

### 2-7. `GET /api/risk` — 공식 지표 + 참고지표 (F-07)

요청: 공통 조회 파라미터 전체 + `include`(선택 지표). 응답 `data` = `query`, `market`, `indicators[]`, `flags`.

**`data.market` (상권 판정)**

| 필드 | 설명 |
|---|---|
| `status` | `in_market` / `outside` |
| `market_code`, `market_name`, `market_type` | 판정된 상권 (`outside`면 `null`) |
| `also_in[]` | 함께 속한 관광특구 `{ market_code, market_name }` |
| `nearby_markets[]` | `outside`일 때 반경에 걸친 상권 `{ market_code, market_name }` |

- 상권 밖이면 공식 수치는 `null`/`no_data` + "상권 밖 주소" 사유. 가까운 상권 수치로 대신하지 않는다.

**`indicators[]` 지표 객체**

| 필드 | 설명 |
|---|---|
| `id`, `type` | 지표 ID, `official` / `reference` |
| `value` | 숫자·문자열·`null` (산정 안 하면 `null`) |
| `unit` | `%`, `개`, `배`, `grade`, `type` |
| `seoul_avg`, `seoul_avg_reason` | 서울 비교값과 미산정 사유 (예: "서울 평균 산정 전") |
| `numerator`, `denominator` | 분자·분모(표본) |
| `space`, `period` | 공간 단위, 분석 기간 |
| `source`, `source_url` | 출처 번호(예: `"R5,R6"` — 문자열), 공식 지표 원문 URL |
| `status`, `reason` | 상태 라벨, 보류·결측 사유 |

**지표 ID (BE 작업계획서 기준)**

| id | type | 내용 | 값이 없을 때 |
|---|---|---|---|
| `official_closure_rate` | official | 서울시 공표 폐업률 그대로 인용, **정수 %**, 분기 단위 | 상권 밖·일치 행 없음 → `null` + `no_data` + 사유. 이전 분기로 대체 안 함 |
| `market_change` | official (동기화 대기) | 서울시 원천 상권변화 유형 그대로 (조건부) | 자료 확보 전 `pending` |
| `official_risk` | official | 서울시 창업위험도 — 수치 대신 **링크 안내** (案) | 아래 link_only 형식 |
| `closure_rate_12m` | reference | 최근 12개월 참고 폐업률, 소수 첫째 자리 % | 표본 부족·분모 0 → `pending`/판단 보류 |
| `survival_rate_1y`, `survival_rate_3y` | reference | 1년·3년 생존율 | 신규 점포 표본 부족 → `pending` |
| `competitor_count` | reference | 반경 안 동종업체 수 (`/stores/nearby`의 `count`와 같은 집합) | — |
| `day_night_ratio` | reference | 주야간 생활인구 비 (조건부) | 생활인구 결측 → `pending` |
| ~~`lq`~~ | — | **제외** (BE 작업계획서) | 화면에 만들지 않음 |

`official_risk` 링크 전용 보완안 (案, 확인 대기):

```json
{
  "id": "official_risk",
  "type": "official",
  "value": null,
  "status": "link_only",
  "link": "https://golmok.seoul.go.kr/stateDistrict.do",
  "copy_text": "상권명 · 업종명"
}
```

- `copy_text`는 "복사" 버튼용. 사용자 주소·좌표는 들어가지 않는다. 상권 밖이면 이름을 만들지 않는다.
- PDF v1.1 형식(`status: "no_data"`, `reason`, `source_url`)이 올 수도 있으니 FE는 두 형식을 모두 처리할 수 있게 만든다 (확정 전까지).

`flags`: `{ insufficient_sample: bool, missing: string[] }`

### 2-8. `POST /api/risk/interpret` — AI 해석 (F-08)

사용자가 **"AI 해석 보기"를 눌렀을 때만** 호출한다.

| 요청 본문 | 필수 | 설명 |
|---|---|---|
| `query` | 필수 | `/risk` 응답의 `data.query` |
| `market` | 필수 | `/risk` 응답의 `data.market` |
| `indicators` | 필수 | `/risk` 응답의 `data.indicators` |
| `flags` | 필수 | `/risk` 응답의 `data.flags` |
| `context` | 선택 | 이력 점포 수·12개월 개폐업 수 등 요약 (案) |

- 서버는 FE가 보낸 숫자를 믿지 않고 다시 계산해 맞을 때만 AI에 넘긴다. 주소 원문은 AI에 보내지 않는다.

| 응답 `data` | 설명 (화면 순서) |
|---|---|
| `label` | 항상 `"AI 해석"` |
| `official_values[]` | (1) 공식 통계·계산값 요약 `{ text, indicator_ids[] }` |
| `favorable[]` | (2) 유리하게 볼 요인 `{ text, indicator_ids[], sources[] }` |
| `unfavorable[]` | (3) 불리하게 볼 요인 (같은 구조) |
| `missing_data[]` | (4) 부족한 자료 `{ text, reason }` |
| `checklist[]` | (5) 계약 전 현장 확인사항 `{ item, why }` |
| `verification` | `{ passed, checked_numbers, mismatches, regenerated }` |
| `model`, `generated_at` | 모델명, 생성 시각 |

- `indicator_ids[]`로 **근거 지표 칩**을 그린다 (예: [동종업체 수] [참고 폐업률]).

| 예외 | 응답 | FE 처리 |
|---|---|---|
| 본문 형식 오류·재계산 값과 불일치 | 400 `INVALID_PARAM` | 지표 다시 조회 |
| LLM 실패·타임아웃·한도 초과(429 포함) | 503 `AI_UNAVAILABLE` | 지표는 그대로 두고 "AI 해석을 불러오지 못했어요" |
| 재생성 후에도 검증 실패 | 503 `AI_VERIFY_FAILED` | 위와 같음 |

### 2-9. `GET /api/support-links` — 상담·지원 링크 (F-10)

| 요청 | 설명 |
|---|---|
| `sigungu` (선택) | 자치구. 지정하면 그 지역 센터를 앞에 정렬 |
| `category` (선택) | 업종 관련 지원사업 우선 정렬 |

응답 `data.links[]` = `{ id, org_name, title, description, url, type(consulting / support_program), region, last_checked }`. 출처 R17.
초기 목록 4곳: 서울시 자영업지원센터, 소상공인아카데미, 서울시 소상공인 지원사업 안내, 소상공인24.

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
