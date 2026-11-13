# 화면별 요구사항

> 마지막 갱신: 2026-11-11 (PR #16 디자인 이미지·배치 반영)
> 기준: 02 기능 명세서, 06 API 명세서 v1.1, 08 분석 로직 정의서, BE 작업계획서, 디자인 초안(Figma)
> 화면 크기: **데스크톱 1440×900 기준**. 모바일 전용 대응은 이번 개발 범위 밖이다.

## 0. 구현 상태 (2026-11-12, 목업 모드 기준 + BE 실제 계약 반영 PR #28~#31)

모든 화면은 `VITE_USE_MOCK=true`의 목업 응답으로 동작을 확인했다. **BE 실제 API와 연결해 확인하는 일은 아직 남아 있다.**

| 화면 | 상태 | 구현 위치 | 남은 일 |
|---|---|---|---|
| ① 랜딩 `/` | ✅ 완료 (히어로 + 소개 섹션: 차별점·이용 3단계·데이터 출처·CTA, 공통 푸터) | `pages/LandingPage.tsx`, `components/landing/LandingSections.tsx`, `components/layout/SiteFooter.tsx` | — |
| ② 입력 `/diagnose` | ✅ 완료 (geocode·후보 선택·오류 안내) | `pages/InputPage.tsx`, `components/input/` | — |
| ③ 과거 점포 이력 `#history` | ✅ 완료 (점포 식별 `source`+`license_no`, 결측 "정보 없음"·사유 — PR #28) | `components/analysis/HistorySection.tsx`, `analysis/history/`, `utils/history.ts`, `utils/storeDisplay.ts` | 실제 데이터로 위치 일치 판정 확인 |
| ④ 주변 점포 `#nearby` | ✅ 완료 (카카오 지도 → 아래 필터 바·점포 표, 시점 조회. 지도·표 선택도 `storeKey`, 결측 표시, `data-range` 세부 업종·`min_month=null` — PR #30) | `components/analysis/NearbySection.tsx`, `ConditionFilterBar.tsx`, `AsOfPicker.tsx`, `analysis/nearby/`, `components/map/` | 배포 도메인을 카카오 콘솔 허용 도메인에 등록 |
| ⑤ 상권 활동 `#activity` | ✅ 완료 (점포 현황·연도별 차트·조건부 지표. 선택 항목 "자료 확인 중"+사유, YTD 안내, 가맹 분류 확인 중 안내 — PR #31) | `components/analysis/ActivitySection.tsx`, `analysis/activity/` | 추정매출·생활인구는 BE 수치 활성화 후 실제 값 확인 |
| ⑥ 종합 진단 `/result/summary` | ✅ 완료 (상권 판정 3가지(in_market·unverified·outside)·공식/참고 지표·서울 평균 비교·AI 해석(query-only)·체크리스트 — PR #29) | `pages/SummaryPage.tsx`, `components/summary/` | 실제 데이터 적재 후 Risk 200·AI 503 확인 |
| ⑦ 저장·상담 `/result/share` | ✅ 완료 (PDF 진단서·요약 이미지·상담 링크(구 관할 센터 포함, 실제 BE 확인)·재진단 — PR #31) | `pages/SharePage.tsx`, `pages/ReportPage.tsx`, `components/share/` | — |
| 공통 | ✅ | 사이드바 레이아웃, 진단 조건 요약 바(`ConditionBar`, STEP 02~04 상단 고정 + [조건 바꾸기]), 탭 제목, 404, 화면별 나눠 불러오기, 스켈레톤 로딩(`common/Skeleton`), 오류 경계(라우터 `RouteErrorPage` + 섹션별 `SectionErrorBoundary`), 모션(동작 줄이기 대응) | — |

## 1. 디자인 구조

- Figma: <https://www.figma.com/design/NnOnbI1G4Lv0p0tniHlJbl/Spot-ON_Draft_1>
- 색·간격 같은 디자인 토큰은 `src/index.css`의 `@theme`에 반영되어 있다. 이미지 경로는 `src/assets/images.ts` 한 곳에서 관리한다.

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

- STEP 02는 **탭 3개**([과거 점포 이력] [주변 점포] [상권 활동])로 한 번에 하나만 보여준다 (`AnalysisTabs`, `role=tablist`, 좌우 화살표·Home·End). 열린 탭은 URL `#해시`로 정해 예전 주소·다른 화면 링크도 그 탭으로 열리고, 조건을 바꿔도(`updateQuery`) 보던 탭에 머문다. 탭 바는 진단 조건 바 바로 아래에 붙는다. 사이드바 하위 메뉴는 탭을 바꾸고, 열린 탭을 강조한다. 맨 아래 "종합 진단 결과 보기 →"(`StepNav`).
- 탭 내용 컴포넌트: `src/components/analysis/{History,Nearby,Activity}Section.tsx`. 공통 틀은 `PageHeader`(제목) → `SummaryStats`(서버 값 요약 숫자, 값 없으면 카드 생략) → `SectionCard`(내용 카드) → `SourceLine`(기준일·공간 단위·표본 한 줄 + "출처 자세히" 펼치기). 간격은 `@theme`의 `--spacing-stack-1~4`(8px 단위)
  - 이력: 요약(기록 수·데이터 기준일) → 이력 표(더보기) → 출처 한 줄 → "알아두세요"(유의사항 접기, `KnowMore`)
  - 주변 점포: 요약(점포 수·반경·기준일) → 지도(520px) → 조건 칩 + [조건 변경] 패널(필터 UI 그대로, 적용하면 닫힘) → 점포 표 → 시점 조회
  - 상권 활동: 요약(점포 현황 카드 4개) → 연도별 추이 → 조건부 지표(추정매출·생활인구) → 출처 한 줄
- 예전 경로는 새 경로로 리다이렉트한다 (쿼리 유지): `/result/history|nearby|activity` → `/result/analysis#해당 탭`, `/result/risk` → `/result/summary`.
- 진단 조건(주소·업종·반경·기준 시점·필터)과 `/geocode` 결과(`lat`·`lng`·`bk`·`floor`·`gu`)는 URL 쿼리로 유지한다 (`useDiagnosisQuery`). 결과 화면은 `address`·`category`·`lat`·`lng`·`bk`가 모두 있어야 열린다.

## 2. 모든 결과 화면 공통

- 상태 4가지를 항상 처리한다: **로딩 / 오류 / 빈 결과 / 판단 보류(`pending`)**. 문구는 `src/constants/messages.ts`에 둔다.
- 모든 수치에 출처·기준일·공간 단위·분모·상태 라벨을 붙인다 → [display-rules.md](display-rules.md)
- 화면 아래에 면책 문구, `is_demo`면 "시연 데이터" 표시.
- 진단 조건(주소·업종·좌표·건물 키)이 없으면 입력 화면으로 보낸다 (`ResultLayout`).
- STEP 02~04 위에 **진단 조건 요약 바**(`ConditionBar`)를 고정해 주소·업종·반경·기준 시점·필터를 보여주고 [조건 바꾸기]로 입력 화면에 돌아간다.
- 로딩은 영역 모양 스켈레톤, 화면 일부가 깨지면 그 섹션만 오류 안내(`SectionErrorBoundary`)하고 나머지는 그대로 보인다.
- 점포 목록(이력·주변·시점·지도)은 **`source`+`license_no`**(`utils/storeKey.ts`)로 식별하고, 상호·날짜·기간이 없으면 "정보 없음"·사유(`utils/storeDisplay.ts`)로 표시한다. 사유 코드는 문구로 바꿔 보여준다 (영문 코드 노출 금지).

## 3. 화면별 요구사항

### ① 랜딩 `/`

| 항목 | 내용 |
|---|---|
| 기능 | 브랜드·슬로건·시작 버튼 + 소개 섹션(차별점 4·이용 3단계·데이터 출처·CTA) + 공통 푸터(`SiteFooter`, 랜딩·입력) |
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
| 결측 | 상호·개업일·기간 null → "정보 없음"(+ 기간 미산정 사유), 폐업인데 폐업일 없음 → 사유별 "폐업일 정보 없음/확인 필요". 0개월은 실제 "0개월" |
| 메모 | 이력에는 진단 업종과 다른 지원 업종 점포도 나올 수 있다 (BE 기준, 확인 대기) |

### ④ 주변 점포 현황 `/result/analysis#nearby` — STEP 02

| 항목 | 내용 |
|---|---|
| 기능 | F-03 지도, F-04 세부 필터, F-05 시점 조회 |
| API | `GET /api/stores/nearby`, `GET /api/stores/snapshot`, `GET /api/meta/data-range` |
| 배치 | 지도 먼저 → 아래 필터 바 + 점포 표. 반경 필터는 지도에도 적용된다 |
| 지도 | 카카오맵 JS SDK. 입력 위치, 반경 원(`radius_m`), 마커(`current_status`로 영업 중/폐업 구분) |
| 필터 | 필수: 반경 300/500/1000m(기본 500), 음식점 세부 업종 4종 / 선택: 시설 규모, 프랜차이즈 |
| 시점 조회 | 연·월 선택. `data-range`(같은 업종·세부 업종으로 요청)의 `min_month`~`max_month` 밖은 비활성, `min_month=null`이면 과거 선택을 막고 안내. 결과는 서버 `summary_text` 그대로 |
| 선택·식별 | 표 행·마커 선택은 `storeKey(source, license_no)`. 조건이 바뀌면 선택·정보창을 풀고 이전 마커를 지운다 |
| 로딩 | 지도·목록 로딩 표시 (필터 바꿀 때도) |
| 오류 | `AS_OF_OUT_OF_RANGE` → "선택한 시점은 데이터 제공 범위 밖이에요" / 지도 SDK 로드 실패 → 목록만이라도 표시 |
| 빈 결과 | `count: 0` → "조건에 맞는 점포가 없어요" |
| 정보 없음 | 면적·프랜차이즈 값이 없는 점포 → "정보 없음" |
| 정보 없음(점포) | 상호·기간 null → "정보 없음"(+ 사유). 지도 정보창·마커 title·버튼 이름에도 같은 규칙 (`null`·빈칸 금지) |
| 필수 문구 | 기준일, 반경, `excluded_no_coord` > 0이면 "서울 전체 동일 조건 중 좌표 미확보 n건 (지도·반경 점포 수에 포함하지 않아요)" — 반경 안 수가 아니라 서울 전체 범위 |
| 메모 | 지도 반경 고정 여부: 팀장 확인 대기 (디자인 요청) |

### ⑤ 상권 활동 분석 `/result/analysis#activity` — STEP 02

| 항목 | 내용 |
|---|---|
| 기능 | F-06 |
| API | `GET /api/market/activity` (+ `include=sales,living_pop`) |
| 표시 | 최근 12개월 개업·폐업 수, 연도별 추이 차트, 세부 업종별 점포 수·평균 영업 기간 / 조건부: 상권별 추정매출, 250m 격자 생활인구 |
| 로딩 | 카드·차트 스켈레톤 |
| 오류 | 오류 문구 + 다시 시도 |
| 빈 결과 | 연도별 추이 데이터 없음 → 차트 대신 안내 |
| 자료 확인 중·자료 없음 | `sales`/`living_pop`이 `null`이고 `meta.optional_data`가 `pending`이면 **"자료 확인 중" + 사유**, 그 밖에 값이 없으면 "자료 없음". 0으로 그리지 않는다 (진단서 같은 기준) |
| 연도별·평균 | 연도별 추이는 서버가 준 연도만 (YTD 기준이면 비교 기간 안내). 평균 영업 기간 = 기준 시점까지 경과 기간 평균 |
| 가맹 분류 | `franchise_classification` pending + 프랜차이즈 조건 → "점포가 없다는 뜻은 아니에요" 안내 |
| 필수 문구 | 점포 수(반경)·매출(상권)·생활인구(격자) **카드 분리**, 단위명을 카드 제목에. 매출·생활인구에 "추정치"와 상권명/격자·기준일. "점포의 실제 매출·실제 고객 수가 아니에요". 생활인구 `missing_grid_count` 표시 |

### ⑥ 종합 진단 결과 `/result/summary` — STEP 03

| 항목 | 내용 |
|---|---|
| 기능 | F-07 지표, F-08 AI 해석·체크리스트 |
| API | `GET /api/risk`, `POST /api/risk/interpret` ("AI 해석 보기" 클릭 시에만) |
| 표시 | 상권 판정(상권 안: 상권명·유형·관광특구 `also_in` / **확인 중(`unverified`)**: "공식 상권 적용 기준을 확인 중이에요" — 안·밖으로 확정하지 않음 / 상권 밖) / **서울시 공식** 영역: 공식 폐업률, 상권변화지표(조건부), 공식 창업위험도 링크 / **Spot:ON 참고지표** 영역: 참고 폐업률(12개월), 개업 1·3주년 생존율, 동종업체 수, 주야간 인구비(조건부) |
| AI 해석 | "AI 해석" 라벨. 요청은 원래 조회 조건만(query-only). 순서: 확인된 계산값 요약 → 유리 요인 / 불리 요인(나란히) → 부족한 자료 → 계약 전 현장 확인사항. 각 문장에 근거 지표 칩, "응답 시각" |
| 로딩 | 지표 로딩 / AI 해석 생성 중(전송 대기 최대 25초) 별도 로딩 |
| 오류 | 지표 오류 → 다시 시도 / AI 오류(`AI_UNAVAILABLE`·`AI_VERIFY_FAILED`·500) → 지표는 그대로 + "AI 해석을 불러오지 못했어요" / 422 → 요청 형식 오류 안내 |
| 빈 결과·상권 밖 | `market.status: outside` → 공식 지표 "자료 없음 (상권 밖 주소)" + `nearby_markets` 참고 안내 |
| 판단 보류 | `status: pending` → "판단 보류" + 사유 문구 (BE 사유 코드 → `indicatorReasonText`). `seoul_avg`가 `null`이면 `seoul_avg_reason` 문구 |
| 필수 문구 | 공식 창업위험도는 "서울시 상권분석서비스에서 확인" + 링크·복사 버튼. 성공·실패 확률이 아니라는 면책. LQ는 표시하지 않는다 |

### ⑦ 저장·공유·상담 `/result/share` — STEP 04

| 항목 | 내용 |
|---|---|
| 기능 | F-09 결과 저장(PDF 우선, 요약 이미지는 그다음, 선택), F-10 상담·지원 연결 + 다른 주소 재진단 |
| API | `GET /api/support-links` (`sigungu`, `category` — 값이 없으면 생략, 주소·좌표 안 보냄). PDF는 API 없이 앞 화면 응답으로 생성 |
| 상담 링크 | 구 지정 시 관할 지역센터 1곳 + 공통 4곳 (서버 순서 그대로). 관할 센터에 "관할 지역센터 연락처" 배지 + 공고일·확인일 안내, "모집 기간·지원 조건은 공식 사이트에서 확인" 안내 |
| 로딩 | 링크 목록 로딩 / PDF 생성 중 표시 |
| 오류 | 링크 불러오기 실패 → 다시 시도 / PDF 생성 실패 → 재시도 안내 |
| 빈 결과 | 링크 0건 → 안내 문구 |
| 필수 문구 | PDF에 출처·기준일·면책 문구 포함(잘림 없이). 외부 링크는 새 창 + 링크 확인일(`last_checked`) |
| 다시 진단 | 입력 화면으로 이동하고 입력값 초기화 |
| 디자인 | 7.Share&Consultation 2종 |
