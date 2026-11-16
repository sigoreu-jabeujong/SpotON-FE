# CLAUDE.md — SpotON-FE

사용자 후속 승인 #94/#202: [주소 상세 확인](docs/address-detail.md)을 구현·배포한다. 후보 선택→상세 확인→확정을 분리하고 입력/URL/출력에서 층·호를 보존한다. BE 정규화 API와 독립 같은층 관계를 사용하며 기존 AI 같은자리 판정은 유지한다. BE 선배포 후 FE main release를 공개 검증한다.

2026-11-16 #81은 [위치 참고자료3카드 연결](docs/location-reference.md)이다. BE #190의 `/api/v2/location-reference`를 기존 분석·요약·PDF에 연결하고 실제 매출분기/행정동 내국인 관측일·지역 범위·미적용필터를 표시한다. 금액/인구는 서버 문자열을 그대로 사용한다. 기존AI·격자 부분자료와 구분하고 화면 구성/랜딩·배포프로필은 유지한다. 최신 사용자 지시에 따른 FE·BE 구현·배포 범위이며 실제 공개 확인은 연결PR/BE실행기록을 따른다.

2026-11-16 #76은 [공개 부분자료 AI 호환 연결](docs/population-ai.md)이다. BE #184의 실제 v2 AI 연결을 위해 promptv1/필드없음과 promptv2/정합한 population evidence를 함께 허용한다. 정보창/보고서에 AI 관측일·원천별 부분 상태와 제한을 표시하고 고정 미확보 문구의 모순을 제거한다. 기존키/.env/사용자폴더/호스팅설정은 보존하며 호환 FE를 main/Vercel에 먼저 배포한 뒤 BE가 배포된다. 실제 검수/CI/공개검증은 연결PR 기록을 따른다.

2026-11-16 사용자 최신 요청이 API 구현·FE 수정·운영 배포를 승인했다. [FE #73 공개자료 주야간 비교](docs/population-reference.md)는 BE #180의 새 `/api/v2/population-reference`를 프로필과 무관하게6개 입력만으로 요청한다. 원천별 부분 비교·decimal/display·0/null·편향/범위·날짜를 유지하고 분석/종합/보고서에 같은 계약을 쓴다. Report만 인구를 조회하며 실제 fetch 중 인쇄를 기다리고 핵심 표는 표시한다. 기존 전체 living_pop/Risk/AI 입력은 유지한다. 로컬 환경파일/키·사용자 폴더는 보존하고 BE 준비 후 develop/main 정상 PR로 공개한다. 실제 CI·배포 결과는 각 PR 실행 기록을 따른다. 과거 FE 수정/배포 승인 대기는 이번 요청에 한해 충족됐다.

2026-11-15 운영 v2 전환 완료. BE PR154의 성능 보완/0012·publication·조회 권한 검증 뒤 FE PR62를 공개 활성화했다. Production=v2, Preview/development=v1, 일반 로컬 기본v1이다. 공개 필터·실제 AI·보고서·모바일390/360·키보드·오류/취소를 확인했다. [운영 실행·검수·복구 기록](https://github.com/sigoreu-jabeujong/SpotON-BE/blob/develop/docs/designs/production-chain-v2-rollout.md)을 따른다. 아래 과거 진행/승인 대기 문구는 이 전환에 관해 완료된 이력이다.

2026-11-15 PR60 병합 뒤 사용자 후속 승인으로 [운영 v2 전환](docs/production-chain-v2.md)을 진행한다. 운영 BE0012/publication/조회권한/실제 AI 검증 후 production만v2로 활성화한다. Vercel 전용 빌드가 production=v2/preview·development=v1을 고정하고 일반 로컬 기본v1을 유지한다. 이번 승인으로 앞선 develop 병합/공개 v2 별도 승인 대기는 충족됐으며 검증·실제 Claude 검수·PR CI 후 병합한다.

2026-11-15 #59 사용자 승인으로 [브랜드·체인 v2 연동](docs/brand-chain-v2.md)을 구현한다. VITE_ANALYSIS_API_VERSION은 기본v1/명시v2이며 로컬5180↔BE8001을 검증한다. v2는 독립 브랜드·미확인·근거와 면적 조건,무브랜드 이력,추정/미확인/충돌 표시,같은 자료의 AI/진단서 캐시를 따른다. legacy 가맹 규칙은 v1에만 적용한다. 원래.env·기존5173·운영 BE/Render를 유지한다. develop 병합은 공개 Vercel 자동 배포이므로 사용자 확인 전 병합하지 않는다.

## 프로젝트 개요

- 2026-11-14 최신 사용자 요청: AI 해석을 연결 문단과 정보 팝오버로 개편하고 FE·BE를 함께 수정하며 이번 화면은 휴대폰에서도 화면 안에 들어가게 한다. [AI 문단 계약/화면](docs/ai-narrative.md)을 따른다. body는 서버 검증 후 plain text로 표시하고 공식/참고 계산·근거는 evidence에 보존한다. 부족한 자료·한계는 제목 옆 팝오버로 옮긴다. 캐시 키는 주소·건물·층호까지 포함하고 조건 변경 시 요청을 취소한다. 기존 query-only/history·수동 요청·지표 독립 오류 처리는 유지한다.
- **Spot:ON**: 예비 창업자에게 창업 입지(자리)를 진단해 주는 공공서비스
- 팀: 시고르자브종 (청년공공AX서포터즈)
- 이 저장소: **프론트엔드(웹 화면)**. 백엔드는 `../SpotON-BE`
- 공공서비스이므로 누구나 쓰기 쉬운 화면(접근성, 모바일 대응)을 우선한다 (데스크톱 1440 기준으로 개발, 휴대폰은 깨짐·가로 넘침 없는 최소 대응(2026-11-15))

## 작업 전 참고 문서
- 작업 전 `docs/` 폴더 문서를 먼저 읽는다
  - [docs/README.md](docs/README.md) — 문서 안내·기준 우선순위
  - [docs/api-contract.md](docs/api-contract.md) — API 계약 요약 (FE 관점)
  - [docs/screens.md](docs/screens.md) — 화면별 요구사항
  - [docs/display-rules.md](docs/display-rules.md) — 화면 표시 원칙
  - [docs/decisions.md](docs/decisions.md) — 결정·미결 사항
- 기준 우선순위: `SpotON-BE/docs/be-work-plan.md`(BE 작업계획서) > 팀 산출물 PDF. 다르면 BE 작업계획서를 따르고 docs에 "동기화 대기"로 표시한다

## 기술 스택
- React + TypeScript, Vite
- 스타일: Tailwind CSS (디자인 토큰은 `src/index.css`의 `@theme`)
- 라우팅: React Router / 서버 데이터: TanStack Query (`src/api/queryClient.ts`)
- 패키지 매니저: **npm** (`package-lock.json` 반드시 커밋)
- 검사 도구: ESLint, Prettier, TypeScript 타입 검사(`npm run build`에 포함)
- 줄바꿈은 LF로 통일 (`.gitattributes`, `.editorconfig`)

## 폴더 구조
```
src/
├── pages/         # 화면 단위 컴포넌트 (라우트 1개 = 파일 1개)
├── components/    # 재사용 UI 컴포넌트 (layout/, common/ 등 영역별)
├── api/           # 백엔드 호출 함수 (fetch 래퍼, 엔드포인트별 함수, mocks/)
├── types/         # API 응답 등 공통 타입 정의
├── hooks/         # 커스텀 훅
├── constants/     # 진단 조건(반경·업종·시설 규모), 상태 라벨, 화면 문구, 경로
├── utils/         # 순수 함수 유틸
└── router.tsx     # 화면 경로 정의
```
- 컴포넌트 안에서 직접 fetch 하지 말고 `src/api/` 함수를 통해 호출
- 화면 7종: 랜딩 `/` → 입력 `/diagnose`(STEP 01) → 결과 `/result/analysis`(STEP 02: `#history`·`#nearby`·`#activity`) · `/result/summary`(STEP 03) · `/result/share`(STEP 04). 화면 7종 기능은 그대로이고 결과 라우트만 디자인 4단계로 묶었다 (예전 `/result/history|nearby|activity|risk`는 새 경로로 리다이렉트)
- 진단 조건(주소·업종·반경·기준 시점·필터)은 URL 쿼리로 유지한다 → `useDiagnosisQuery` 훅 사용

## 자주 쓰는 명령어
```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL 확인
npm run dev              # http://localhost:5173
npm run lint
npm run format           # Prettier 자동 정리 (커밋 전)
npm run build            # 타입 검사 + 빌드
npm run test             # 핵심 함수 단위 테스트 (Vitest, src/**/*.test.ts)
```
- 백엔드 없이 화면을 개발할 때는 `.env`에 `VITE_USE_MOCK=true` → `src/api/mocks/index.ts`에 명세서 예시 응답 등록
- **BE 단계 연결**: 목업 모드에서도 `VITE_REAL_API_PATHS`(쉼표 목록, 예: `/geocode,/support-links`)에 적은 경로만 실제 BE로 보낸다 (`src/api/client.ts`). BE가 꺼져 있으면 실행 환경에서만 값을 바꾸고 `.env`는 수정·출력하지 않는다
- 개발 서버 포트는 `npx vite --port 5180` (카카오 지도 허용 도메인이 5180)

## API 응답 형식 (BE와 반드시 동일하게 유지)
```ts
// 06 API 명세서 기준 (BE app/schemas/common.py의 공통 외피와 같음). 상세: docs/api-contract.md
type ApiResponse<T> = {
  data: T | null;          // data와 error 중 하나만 값이 있다
  meta: {
    source?: string[] | null; as_of?: string | null; space?: string | null;
    denominator?: number | null; data_updated_at?: string | null; collected_at?: string | null;
    is_demo?: boolean | null; data_version?: { /* 배치 ID·기준 분기·매핑/규칙 버전 */ } | null;
    // + API별 선택 필드 (collection_reason, optional_data, prioritization 등 — 다른 API에 필수로 강제하지 않음)
  } | null; // 오류 시 BE는 {}
  error: { code: string; message: string; detail?: Record<string, unknown> | null } | null;
  // detail은 지금 BE가 보내지 않는다 (없을 때도 화면이 동작해야 함)
};
```
- 이 타입은 `src/types/api.ts`에 두고 모든 API 함수가 사용 (`src/api/client.ts`의 `apiGet`/`apiPost`)
- API 명세서 v1.2가 FE↔BE 계약 기준. 필드·파라미터를 바꾸려면 명세서 수정 → FE·BE 합의 → 코드 수정 순서
- 형식을 바꾸면 `../SpotON-BE/CLAUDE.md`도 함께 수정한다
- API 경로는 `/api/...` (예: `/api/geocode`), 기본 주소는 `import.meta.env.VITE_API_BASE_URL` (경로 접두사 없이 서버 주소만 지정)
- 지원 업종은 카페와 음식점(한식·중식·일식·양식)이다. 카페는 별도 세부 업종을 선택하지 않는다.
- **점포 식별은 `source` + `license_no`** (`src/utils/storeKey.ts`). 관리번호는 원천마다 따로 매겨져 겹칠 수 있다 — 이력·주변·시점 표, 지도 마커·선택, React key 모두 같은 규칙, 같은 번호·다른 원천을 합치지 않는다
- **프랜차이즈는 근거대로 표시** (`storeDisplay.storeFranchise`): 목록명 일치는 "프랜차이즈(추정)" + 기준년도·"실제 계약·과거 소속 아님", 기존 분류는 값 그대로, 미확인은 "정보 없음"(개인 매장으로 바꾸지 않음). 가맹 필터를 고르면 `include_unknown_franchise=false`, 0건은 "점포가 없다"가 아니라 "분류 자료가 없어 0곳"으로 안내
- null은 "값 없음"이다. 상호·날짜·기간이 null이면 0이나 빈칸 대신 "정보 없음"·사유(`src/utils/storeDisplay.ts`)를 보여주고, BE 사유 코드는 문구로 바꿔 보여준다 (영문 코드·문자열 `null` 노출 금지)
- 키즈카페·라이브카페·분식·치킨·주점·기타 음식점·제과점은 분석 대상에서 제외한다.

## 코딩 규칙
- `any` 사용 금지, props와 API 응답에 타입 명시
- 함수형 컴포넌트 + Hooks 사용
- 로딩·에러·빈 결과 상태를 화면에 항상 처리
- 이미지에 alt, 버튼에 명확한 텍스트 등 기본 접근성 지키기
- 파일명: 컴포넌트는 PascalCase(`StoreCard.tsx`), 그 외 camelCase

## Spot:ON 화면 원칙 (분석 로직 정의서 5장)
- **프론트에서 지표를 계산하지 않는다.** 서버가 준 값을 표시만 한다 (날짜·숫자 형식 변환은 예외)
- 서울시 **공식 지표**와 **Spot:ON 참고지표**는 영역과 라벨을 분리해 표시한다
- 모든 수치에 출처·기준일·공간 단위(반경/상권/격자)·상태 라벨을 함께 표시한다 (`src/constants/labels.ts`)
- 판단 보류·정보 없음·상세 위치 미확인 상태를 빠뜨리지 않는다
- AI 해석은 "AI 해석" 라벨로 계산 결과와 구분하고, 실패해도 지표는 그대로 보여준다
- 화면 문구는 `src/constants/messages.ts`에 모아 관리한다
- 반경·업종·시설 규모 등 진단 조건 값은 `src/constants/diagnosis.ts`만 수정한다

## Git 규칙
- 브랜치: `main`(최종) ← `develop`(통합) ← `feat/기능명`, `fix/버그명`, `docs/문서명`
- `main`, `develop`에 직접 커밋·push 하지 않는다. 작업은 항상 새 브랜치에서
- 커밋 메시지: `타입: 내용` (예: `feat: 입지 진단 결과 화면 추가`)
  - 타입: feat, fix, refactor, perf, docs, style, chore

## 절대 하지 말 것
- **API 키·비밀값을 프론트 코드나 `VITE_` 환경변수에 넣지 않는다** (브라우저에 그대로 노출됨). 외부 API 호출이 키를 필요로 하면 백엔드를 거친다
  - 단, 카카오맵 JavaScript 키(`VITE_KAKAO_JS_KEY`)는 브라우저 공개용 키라 예외로 허용하며 카카오 개발자 콘솔에서 허용 도메인을 반드시 등록한다 (07 데이터 활용 명세서 8.4)
- `.env` 파일 내용을 출력하거나 커밋하지 않는다
- 유료 라이브러리·유료 API를 추가하지 않는다
- `git push --force`, 브랜치 삭제 등 되돌리기 어려운 명령은 사람에게 확인받기 전에 실행하지 않는다
