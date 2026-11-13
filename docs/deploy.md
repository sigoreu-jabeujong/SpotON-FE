# 배포 안내 (SpotON-FE)

> 배포 위치는 개발 완료 후 결정한다 (docs/decisions.md). 이 문서는 어디에 올리든 공통으로 필요한 것만 적는다.
> 특정 호스팅 서비스용 설정 파일은 저장소에 넣지 않는다.

## 1. 빌드

```bash
npm ci                                   # package-lock.json 그대로 설치
cp .env.production.example .env.production   # 값 채우기 (커밋 금지 — .gitignore가 막음)
npm run build                            # 타입 검사 + 빌드 → dist/
npm run preview -- --port 5180           # (선택) 배포 결과물을 로컬에서 확인
```

- 결과물은 `dist/` 폴더 하나다 (정적 파일: `index.html`, `assets/`, 이미지·파비콘). 서버 코드는 없다.
- `npm run build`는 `.env.production`(없으면 `.env`)과 실행 환경 변수를 읽는다. **실행 환경 변수가 파일보다 우선**한다.
- `VITE_USE_MOCK=false`로 빌드하면 목업 코드·시연용 점포 데이터가 결과물에서 빠진다 (`src/api/client.ts`의 동적 import). 확인: `dist/assets`에서 목업 점포 이름(예: `○○로스터스`)을 검색했을 때 나오지 않아야 한다.

## 2. 환경변수 (`.env.production.example`)

| 이름 | 배포 값 | 설명 |
|---|---|---|
| `VITE_API_BASE_URL` | 배포한 BE 주소 (예: `https://api.예시.kr`) | 서버 주소만. `/api`는 코드가 붙인다 |
| `VITE_USE_MOCK` | `false` | 반드시 false (true면 화면이 시연용 가상 데이터로 동작) |
| `VITE_REAL_API_PATHS` | 비움 | 목업 모드 전용 |
| `VITE_KAKAO_JS_KEY` | 카카오맵 JavaScript 키 | 브라우저 공개용 키 (유일하게 허용된 키). 카카오 콘솔에 배포 도메인 등록 필수 |

- `VITE_`로 시작하는 값은 빌드 결과(브라우저)에 그대로 들어간다. 다른 키·비밀값은 넣지 않는다 (CLAUDE.md).

## 3. 새로고침 대비 (SPA 경로)

화면 경로는 브라우저 안에서 바뀌는 주소(React Router)라 실제 파일이 없다. 사용자가 결과 화면에서 새로고침하거나 주소를 직접 열면 서버가 그 경로를 찾지 못해 404가 날 수 있다.

**요구사항: 실제 파일이 없는 모든 경로를 `index.html`로 돌려준다** (`/assets/...`·이미지 등 실제 파일은 그대로).

| 경로 예 | 돌려줄 파일 |
|---|---|
| `/`, `/diagnose`, `/result/analysis?…#nearby`, `/result/summary?…`, `/result/share?…`, `/result/report?…` | `index.html` |
| 예전 주소 `/result/history`·`/result/risk` 등 | `index.html` (화면이 새 경로로 옮겨 줌) |
| 없는 주소 | `index.html` (화면이 404 페이지를 보여줌) |
| `/assets/index-xxxx.js`, `/og-image.png`, `/favicon.png` | 그 파일 그대로 |

호스팅별 설정 예 (참고용 — 해당 서비스를 고르면 그때 설정):
- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: `FallbackResource /index.html`
- 정적 호스팅 서비스: "SPA 모드"·"모든 경로를 index.html로 rewrite" 옵션 (서비스마다 이름이 다름)

캐시: `assets/` 파일은 이름에 해시가 붙어 길게 캐시해도 되고, `index.html`은 새 배포가 바로 보이도록 짧게(또는 캐시 안 함) 둔다.

## 4. 배포 후 할 일

- [ ] **카카오 개발자 콘솔** → 앱 → 플랫폼 → Web에 배포 도메인(예: `https://spoton.예시.kr`) 추가 — 안 하면 지도 자리에 "지도를 불러오지 못했어요"만 보인다
- [ ] **og:image 절대 주소**: `index.html`의 `og:image`·`twitter:image`를 `https://배포-도메인/og-image.png`로 바꾸고 다시 빌드 (상대 경로면 일부 메신저 공유 미리보기에 그림이 안 나옴)
- [ ] **BE `CORS_ORIGINS`에 FE 도메인 추가** (BE 담당 — 쉼표 목록, 예: `https://spoton.예시.kr`). 빠지면 모든 API가 "서버에 연결할 수 없어요"로 보인다
- [ ] **`src/constants/links.ts` 저장소 주소**를 최종 제출 저장소(공공 GitLab) 주소로 바꾸기 (푸터·랜딩의 소스 코드 링크)
- [ ] 배포 주소에서 확인: 주소 검색 → STEP 02~04, 결과 화면에서 새로고침, PDF 인쇄·요약 이미지 저장, 화면에 "시연 데이터" 표시가 없는지
- [ ] BE를 잠깐 멈췄을 때 "서버에 연결할 수 없어요" 안내가 나오는지 (배포 BE 주소가 틀려도 같은 안내)
