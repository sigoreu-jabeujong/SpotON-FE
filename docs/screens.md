# 화면별 요구사항

> 마지막 갱신: 2026-11-10
> 기준: 02 기능 명세서, 06 API 명세서 v1.1, 08 분석 로직 정의서, BE 작업계획서, 디자인 초안(Figma)
> 화면 크기: **데스크톱 1440×900 기준**. 모바일 전용 대응은 이번 개발 범위 밖이다.

## 1. 디자인 구조

- Figma: <https://www.figma.com/design/NnOnbI1G4Lv0p0tniHlJbl/Spot-ON_Draft_1>
- 색·간격 같은 세부 값은 화면 PNG를 받으면 이 문서와 `src/index.css`의 `@theme`에 추가한다.

### 1-1. 왼쪽 4단계 사이드바

| 단계 | 이름 | 포함 내용 |
|---|---|---|
| STEP 01 | 주소·업종 선택 | 주소 입력, 카페/음식점 선택 |
| STEP 02 | 입지 정보 분석 | 과거 점포 이력 · 주변 점포 분석 · 상권 활동 분석 |
| STEP 03 | 종합 진단 결과 | 공식/참고 지표, AI 해석, 체크리스트 |
| STEP 04 | 결과 저장 및 상담 | PDF 저장, 상담·지원 링크, 다시 진단 |

### 1-2. Figma 프레임

| 프레임 | 내용 |
|---|---|
| `1.Home` | 랜딩. **디자인대로 전국 지도 그림 사용** (서비스 범위는 서울이지만 랜딩 그림은 디자인을 따른다) |
| `2-1` / `2-2` / `2-3` | 주소·업종 입력 — 기본 / 오류 / 완료 상태 |
| `3.Store History` | 입지 정보 분석. 지도·차트가 포함된 **긴 화면** |
| `6.Business Risk Analysis` | 종합 진단(위험도·지표·AI 해석) |
| `7.Share&Consultation` (2종) | 결과 저장·상담 |
| `Spot:ON_Color` | 색상 페이지 (디자인 토큰 기준) |

### 1-3. 라우트 ↔ 디자인 단계

2026-11-10에 결과 라우트를 디자인 4단계로 재구성했다. **화면 7종의 기능은 그대로**이고, 라우트만 4단계로 묶었다.

| 라우트 | 화면 (최종본 6번) | 디자인 단계 | Figma 프레임 |
|---|---|---|---|
| `/` | ① 랜딩 | (사이드바 밖) | 1.Home |
| `/diagnose` | ② 주소·업종 입력 | STEP 01 | 2-1 / 2-2 / 2-3 |
| `/result/analysis#history` | ③ 과거 점포 이력 | STEP 02 | 3.Store History |
| `/result/analysis#nearby` | ④ 주변 점포 현황 | STEP 02 | 3.Store History |
| `/result/analysis#activity` | ⑤ 상권 활동 분석 | STEP 02 | 3.Store History |
| `/result/summary` | ⑥ 창업 위험도 분석 → "종합 진단 결과" | STEP 03 | 6.Business Risk Analysis |
| `/result/share` | ⑦ 저장·공유·상담 | STEP 04 | 7.Share&Consultation |

- STEP 02는 **한 페이지에 섹션 3개를 세로로** 둔다. 섹션 컴포넌트: `src/components/analysis/{History,Nearby,Activity}Section.tsx`. 사이드바 하위 메뉴를 누르면 해당 섹션으로 부드럽게 스크롤하고, 보고 있는 섹션을 강조한다.
- 예전 경로는 새 경로로 리다이렉트한다 (쿼리 유지): `/result/history|nearby|activity` → `/result/analysis#해당 섹션`, `/result/risk` → `/result/summary`.
- 진단 조건(주소·업종·반경·기준 시점·필터)과 `/geocode` 결과(`lat`·`lng`·`bk`·`floor`·`gu`)는 URL 쿼리로 유지한다 (`useDiagnosisQuery`). 결과 화면은 `address`·`category`·`lat`·`lng`·`bk`가 모두 있어야 열린다.

## 2. 모든 결과 화면 공통

- 상태 4가지를 항상 처리한다: **로딩 / 오류 / 빈 결과 / 판단 보류(`pending`)**. 문구는 `src/constants/messages.ts`에 둔다.
- 모든 수치에 출처·기준일·공간 단위·분모·상태 라벨을 붙인다 → [display-rules.md](display-rules.md)
- 화면 아래에 면책 문구, `is_demo`면 "시연 데이터" 표시.
- 진단 조건(주소·업종·좌표·건물 키)이 없으면 입력 화면으로 보낸다 (`ResultLayout`).

## 3. 화면별 요구사항

### ① 랜딩 `/`

| 항목 | 내용 |
|---|---|
| 기능 | 브랜드·슬로건·시작 버튼 |
| API | 없음 |
| 필수 문구 | 슬로건 "Is your spot on? — 내 자리, 딱 맞는 자리일까요?", **"만 18세 이상 예비창업자 대상"** 안내, 면책 문구 |
| 디자인 | 전국 지도 그림 사용 (1.Home) |

### ② 주소·업종 입력 `/diagnose` — STEP 01

| 항목 | 내용 |
|---|---|
| 기능 | F-01 (주소 검색·좌표화, 카페/음식점 필수 선택) |
| API | `GET /api/geocode` (`query`, `category`) |
| 로딩 | 주소 검색 중 버튼 비활성 + 로딩 표시 |
| 오류 | 주소·업종 누락 → 진행 차단(FE 1차 검증) / `ADDRESS_NOT_FOUND` / `OUT_OF_SEOUL` → 진행 차단 / `UPSTREAM_ERROR` → 다시 시도 |
| 빈 결과 | 주소 결과 없음 = `ADDRESS_NOT_FOUND` 안내 |
| 여러 결과 | `candidates[]`(최대 5건)를 보여주고 사용자가 고르게 한다 |
| 상태 디자인 | 기본 2-1 / 오류 2-2 / 완료 2-3 |
| 필수 문구 | "지금은 서울특별시 주소만 진단할 수 있어요", 도로명·지번 예시 |
| 메모 | 음식점 세부 업종(한식·중식·일식·양식)은 F-04 필터에서 고른다. 카페는 세부 업종 없음. `geocode` 결과의 `lat`·`lng`·`building_key`·`floor_unit`·`sigungu`를 이후 화면에서 쓰므로 URL 쿼리에 담을 방법을 API 연동 작업에서 정한다 |

### ③ 과거 점포 이력 `/result/analysis#history` — STEP 02

| 항목 | 내용 |
|---|---|
| 기능 | F-02 |
| API | `GET /api/stores/history` (`building_key`, `floor_unit`, `category`) |
| 표시 | 시간순 목록: 상호, 업종, 개업일, 폐업일, 영업 기간("n년 m개월"), 영업 상태, 프랜차이즈(추정), 층·호실, 위치 일치(`location_match`) |
| 로딩 | 목록 자리 스켈레톤 |
| 오류 | 오류 문구 + 다시 시도 |
| 빈 결과 | `total: 0` → "이 건물에서 확인된 음식점·카페 인허가 기록이 없어요" (서버 `message`) |
| 판단 보류·미확인 | `location_match: unverified` → **"상세 위치 미확인"** 라벨, 목록에서 빼지 않는다 ("건물 단위 이력 / 상세 위치 미확인") |
| 필수 문구 | "폐업은 행정상 신고 기록 기준이에요", 건물 주소가 같아도 층·호실이 다르면 다른 자리라는 안내 |
| 메모 | 이력에는 진단 업종과 다른 지원 업종 점포도 나올 수 있다 (BE 기준, 확인 대기) |

### ④ 주변 점포 현황 `/result/analysis#nearby` — STEP 02

| 항목 | 내용 |
|---|---|
| 기능 | F-03 지도, F-04 세부 필터, F-05 시점 조회 |
| API | `GET /api/stores/nearby`, `GET /api/stores/snapshot`, `GET /api/meta/data-range` |
| 지도 | 카카오맵 JS SDK. 입력 위치, 반경 원(`radius_m`), 마커(`current_status`로 영업 중/폐업 구분) |
| 필터 | 필수: 반경 300/500/1000m(기본 500), 음식점 세부 업종 4종 / 선택: 시설 규모, 프랜차이즈 |
| 시점 조회 | 연·월 선택. `data-range`의 `min_month`~`max_month` 밖은 비활성. 결과는 `summary_text`(예: "2023.10 시점 동일 업종 12곳 → 지금도 운영 중 7곳 · 폐업 5곳") |
| 로딩 | 지도·목록 로딩 표시 (필터 바꿀 때도) |
| 오류 | `AS_OF_OUT_OF_RANGE` → "선택한 시점은 데이터 제공 범위 밖이에요" / 지도 SDK 로드 실패 → 목록만이라도 표시 |
| 빈 결과 | `count: 0` → "조건에 맞는 점포가 없어요" |
| 정보 없음 | 면적·프랜차이즈 값이 없는 점포 → "정보 없음" |
| 필수 문구 | 기준일, 반경, `excluded_no_coord` > 0이면 "좌표가 없어 지도에서 제외된 점포 n곳" |

### ⑤ 상권 활동 분석 `/result/analysis#activity` — STEP 02

| 항목 | 내용 |
|---|---|
| 기능 | F-06 |
| API | `GET /api/market/activity` (+ `include=sales,living_pop`) |
| 표시 | 최근 12개월 개업·폐업 수, 연도별 추이 차트, 세부 업종별 점포 수·평균 영업 기간 / 조건부: 상권별 추정매출, 250m 격자 생활인구 |
| 로딩 | 카드·차트 스켈레톤 |
| 오류 | 오류 문구 + 다시 시도 |
| 빈 결과 | 연도별 추이 데이터 없음 → 차트 대신 안내 |
| 판단 보류·자료 없음 | `sales`/`living_pop`이 `null`이거나 `flags.missing`에 있으면 "자료 없음" 또는 `pending`이면 "판단 보류" + 사유. 0으로 그리지 않는다 |
| 필수 문구 | 점포 수(반경)·매출(상권)·생활인구(격자) **카드 분리**, 단위명을 카드 제목에. 매출·생활인구에 "추정치"와 상권명/격자·기준일. "점포의 실제 매출·실제 고객 수가 아니에요". 생활인구 `missing_grid_count` 표시 |

### ⑥ 종합 진단 결과 `/result/summary` — STEP 03

| 항목 | 내용 |
|---|---|
| 기능 | F-07 지표, F-08 AI 해석·체크리스트 |
| API | `GET /api/risk`, `POST /api/risk/interpret` ("AI 해석 보기" 클릭 시에만) |
| 표시 | 상권 판정(상권명·유형, 관광특구 `also_in`) / **서울시 공식** 영역: 공식 폐업률, 상권변화지표(조건부), 공식 창업위험도 링크 / **Spot:ON 참고지표** 영역: 참고 폐업률(12개월), 1·3년 생존율, 동종업체 수, 주야간 인구비(조건부) |
| AI 해석 | "AI 해석" 라벨. 순서: 공식·계산값 요약 → 유리 요인 / 불리 요인(나란히) → 부족한 자료 → 계약 전 현장 확인사항. 각 문장에 근거 지표 칩 |
| 로딩 | 지표 로딩 / AI 해석 생성 중(최대 20초 안팎) 별도 로딩 |
| 오류 | 지표 오류 → 다시 시도 / AI 오류(`AI_UNAVAILABLE`·`AI_VERIFY_FAILED`) → 지표는 그대로 + "AI 해석을 불러오지 못했어요" |
| 빈 결과·상권 밖 | `market.status: outside` → 공식 지표 "자료 없음 (상권 밖 주소)" + `nearby_markets` 참고 안내 |
| 판단 보류 | `status: pending` → "판단 보류" + `reason` (예: "생존율 계산 대상 신규 점포 5건 미만"). `seoul_avg`가 `null`이면 `seoul_avg_reason` 표시 |
| 필수 문구 | 공식 창업위험도는 "서울시 상권분석서비스에서 확인" + 링크·복사 버튼. 성공·실패 확률이 아니라는 면책. LQ는 표시하지 않는다 |

### ⑦ 저장·공유·상담 `/result/share` — STEP 04

| 항목 | 내용 |
|---|---|
| 기능 | F-09 결과 저장(PDF 우선, 요약 이미지는 그다음, 선택), F-10 상담·지원 연결 + 다른 주소 재진단 |
| API | `GET /api/support-links` (`sigungu`, `category`). PDF는 API 없이 앞 화면 응답으로 생성 |
| 로딩 | 링크 목록 로딩 / PDF 생성 중 표시 |
| 오류 | 링크 불러오기 실패 → 다시 시도 / PDF 생성 실패 → 재시도 안내 |
| 빈 결과 | 링크 0건 → 안내 문구 |
| 필수 문구 | PDF에 출처·기준일·면책 문구 포함(잘림 없이). 외부 링크는 새 창 + 링크 확인일(`last_checked`) |
| 다시 진단 | 입력 화면으로 이동하고 입력값 초기화 |
| 디자인 | 7.Share&Consultation 2종 |
