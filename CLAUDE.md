# CLAUDE.md — SpotON-FE

## 프로젝트 개요
- **Spot:ON**: 예비 창업자에게 창업 입지(자리)를 진단해 주는 공공서비스
- 팀: 시고르자브종 (청년공공AX서포터즈)
- 이 저장소: **프론트엔드(웹 화면)**. 백엔드는 `../SpotON-BE`
- 공공서비스이므로 누구나 쓰기 쉬운 화면(접근성, 모바일 대응)을 우선한다

## 기술 스택
- React + TypeScript, Vite
- 패키지 매니저: **npm** (`package-lock.json` 반드시 커밋)
- 검사 도구: ESLint, TypeScript 타입 검사(`npm run build`에 포함)

## 폴더 구조
```
src/
├── pages/         # 화면 단위 컴포넌트 (라우트 1개 = 파일 1개)
├── components/    # 재사용 UI 컴포넌트
├── api/           # 백엔드 호출 함수 (fetch 래퍼, 엔드포인트별 함수)
├── types/         # API 응답 등 공통 타입 정의
├── hooks/         # 커스텀 훅
└── utils/         # 순수 함수 유틸
```
- 컴포넌트 안에서 직접 fetch 하지 말고 `src/api/` 함수를 통해 호출

## 자주 쓰는 명령어
```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL 확인
npm run dev              # http://localhost:5173
npm run lint
npm run build            # 타입 검사 + 빌드
```

## API 응답 형식 (BE와 반드시 동일하게 유지)
```ts
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};
```
- 이 타입은 `src/types/api.ts`에 두고 모든 API 함수가 사용
- 형식을 바꾸면 `../SpotON-BE/CLAUDE.md`도 함께 수정한다
- API 경로는 `/api/v1/...`, 기본 주소는 `import.meta.env.VITE_API_BASE_URL`

## 코딩 규칙
- `any` 사용 금지, props와 API 응답에 타입 명시
- 함수형 컴포넌트 + Hooks 사용
- 로딩·에러·빈 결과 상태를 화면에 항상 처리
- 이미지에 alt, 버튼에 명확한 텍스트 등 기본 접근성 지키기
- 파일명: 컴포넌트는 PascalCase(`StoreCard.tsx`), 그 외 camelCase

## Git 규칙
- 브랜치: `main`(최종) ← `dev`(통합) ← `feat/기능명`, `fix/버그명`, `docs/문서명`
- `main`, `dev`에 직접 커밋·push 하지 않는다. 작업은 항상 새 브랜치에서
- 커밋 메시지: `타입: 내용` (예: `feat: 입지 진단 결과 화면 추가`)
  - 타입: feat, fix, refactor, docs, style, chore

## 절대 하지 말 것
- **API 키·비밀값을 프론트 코드나 `VITE_` 환경변수에 넣지 않는다** (브라우저에 그대로 노출됨). 외부 API 호출이 키를 필요로 하면 백엔드를 거친다
- `.env` 파일 내용을 출력하거나 커밋하지 않는다
- 유료 라이브러리·유료 API를 추가하지 않는다
- `git push --force`, 브랜치 삭제 등 되돌리기 어려운 명령은 사람에게 확인받기 전에 실행하지 않는다
