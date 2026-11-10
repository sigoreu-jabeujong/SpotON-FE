# CLAUDE.md — SpotON-FE

## 프로젝트 개요
- **Spot:ON**: 예비 창업자에게 창업 입지(자리)를 진단해 주는 공공서비스
- 팀: 시고르자브종 (청년공공AX서포터즈)
- 이 저장소: **프론트엔드(웹 화면)**. 백엔드는 `../SpotON-BE`
- 공공서비스이므로 누구나 쓰기 쉬운 화면(접근성, 모바일 대응)을 우선한다 (이번 개발은 데스크톱 1440 기준, 모바일 전용 대응은 범위 밖)

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
- 화면 7종: 랜딩 `/` → 입력 `/diagnose` → 결과 `/result/history|nearby|activity|risk|share`
- 진단 조건(주소·업종·반경·기준 시점·필터)은 URL 쿼리로 유지한다 → `useDiagnosisQuery` 훅 사용

## 자주 쓰는 명령어
```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL 확인
npm run dev              # http://localhost:5173
npm run lint
npm run format           # Prettier 자동 정리 (커밋 전)
npm run build            # 타입 검사 + 빌드
```
- 백엔드 없이 화면을 개발할 때는 `.env`에 `VITE_USE_MOCK=true` → `src/api/mocks/index.ts`에 명세서 예시 응답 등록

## API 응답 형식 (BE와 반드시 동일하게 유지)
```ts
// 06 API 명세서 기준 (기존 success 필드 형식에서 변경 — BE CLAUDE.md 동기화 필요). 상세: docs/api-contract.md
type ApiResponse<T> = {
  data: T | null;
  meta: {
    source?: string[] | null; as_of?: string | null; space?: string | null;
    denominator?: number | null; data_updated_at?: string | null; collected_at?: string | null;
    is_demo?: boolean | null; data_version?: { /* 배치 ID·기준 분기·매핑/규칙 버전 */ } | null;
  } | null; // 오류 시 null 또는 {}
  error: { code: string; message: string; detail?: Record<string, unknown> | null } | null;
};
```
- 이 타입은 `src/types/api.ts`에 두고 모든 API 함수가 사용 (`src/api/client.ts`의 `apiGet`/`apiPost`)
- API 명세서 v1.2가 FE↔BE 계약 기준. 필드·파라미터를 바꾸려면 명세서 수정 → FE·BE 합의 → 코드 수정 순서
- 형식을 바꾸면 `../SpotON-BE/CLAUDE.md`도 함께 수정한다
- API 경로는 `/api/...` (예: `/api/geocode`), 기본 주소는 `import.meta.env.VITE_API_BASE_URL` (경로 접두사 없이 서버 주소만 지정)
- 지원 업종은 카페와 음식점(한식·중식·일식·양식)이다. 카페는 별도 세부 업종을 선택하지 않는다.
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
  - 타입: feat, fix, refactor, docs, style, chore

## 절대 하지 말 것
- **API 키·비밀값을 프론트 코드나 `VITE_` 환경변수에 넣지 않는다** (브라우저에 그대로 노출됨). 외부 API 호출이 키를 필요로 하면 백엔드를 거친다
  - 단, 카카오맵 JavaScript 키(`VITE_KAKAO_JS_KEY`)는 브라우저 공개용 키라 예외로 허용하며 카카오 개발자 콘솔에서 허용 도메인을 반드시 등록한다 (07 데이터 활용 명세서 8.4)
- `.env` 파일 내용을 출력하거나 커밋하지 않는다
- 유료 라이브러리·유료 API를 추가하지 않는다
- `git push --force`, 브랜치 삭제 등 되돌리기 어려운 명령은 사람에게 확인받기 전에 실행하지 않는다
