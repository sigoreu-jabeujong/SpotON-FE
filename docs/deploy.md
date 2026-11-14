# 배포 안내 (SpotON-FE)

> 지금 미리보기 배포는 **Vercel** (5장). 1~4장은 어디에 올리든 공통으로 필요한 것이다.
> 호스팅 설정 파일은 실제로 쓰는 Vercel용 `vercel.json`만 둔다.

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

호스팅별 설정 예:
- **Vercel: 저장소 루트 `vercel.json`** (5장) — 이미 들어 있음
- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: `FallbackResource /index.html`
- 정적 호스팅 서비스: "SPA 모드"·"모든 경로를 index.html로 rewrite" 옵션 (서비스마다 이름이 다름)

캐시: `assets/` 파일은 이름에 해시가 붙어 길게 캐시해도 되고, `index.html`은 새 배포가 바로 보이도록 짧게(또는 캐시 안 함) 둔다.

## 4. 배포 후 할 일

- [ ] **카카오 개발자 콘솔** → 앱 → 플랫폼 → Web에 배포 도메인(예: `https://spoton.예시.kr`) 추가 — 안 하면 지도 자리에 "지도를 불러오지 못했어요"만 보인다
- [x] **og:image 절대 주소**: `index.html`의 `og:image`·`twitter:image` = `https://spot-on-fe.vercel.app/og-image.png` (배포 주소가 바뀌면 이 두 줄도 바꾸고 다시 빌드 — 상대 경로면 일부 메신저 공유 미리보기에 그림이 안 나옴)
- [ ] **BE `CORS_ORIGINS`에 FE 도메인 추가** (BE 담당 — 쉼표 목록, 예: `https://spoton.예시.kr`). 빠지면 모든 API가 "서버에 연결할 수 없어요"로 보인다
- [ ] **`src/constants/links.ts` 저장소 주소**를 최종 제출 저장소(공공 GitLab) 주소로 바꾸기 (푸터·랜딩의 소스 코드 링크)
- [ ] 배포 주소에서 확인: 주소 검색 → STEP 02~04, 결과 화면에서 새로고침, PDF 인쇄·요약 이미지 저장, 화면에 "시연 데이터" 표시가 없는지
- [ ] BE를 잠깐 멈췄을 때 "서버에 연결할 수 없어요" 안내가 나오는지 (배포 BE 주소가 틀려도 같은 안내)

## 5. Vercel (미리보기 배포)

- 배포 주소: **https://spot-on-fe.vercel.app**
- Production Branch = **`develop`** — develop에 PR을 머지하면 자동으로 다시 빌드·배포된다. PR마다 미리보기 주소도 달린다
- 빌드: Vercel이 `npm install` → `npm run build` → `dist/`를 올린다 (Vite 기본 설정 인식)
- **새로고침 404 방지 `vercel.json`**: 실제 파일이 없는 모든 경로를 `/index.html`로 돌려준다 (`/assets/…`·`/og-image.png`·`/favicon.png` 같은 실제 파일은 Vercel이 먼저 그대로 내보낸다)

  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

**Vercel 환경변수** (프로젝트 Settings → Environment Variables, 값은 이 문서에 쓰지 않는다)

| 이름 | 지금 (BE 배포 전) | BE 배포 후 |
|---|---|---|
| `VITE_USE_MOCK` | `true` (목업 — 화면에 "시연 데이터" 표시) | `false` |
| `VITE_API_BASE_URL` | (목업이라 쓰이지 않음) | 배포한 BE 주소 |
| `VITE_KAKAO_JS_KEY` | 카카오맵 JavaScript 키 | 그대로 |

- `VITE_` 값은 **빌드할 때** 들어가므로, 바꾼 뒤에는 Vercel에서 다시 배포(Redeploy)해야 반영된다
- 카카오 개발자 콘솔 JavaScript SDK 도메인에 `https://spot-on-fe.vercel.app` **등록 완료** (지도 표시 확인됨)

**BE 배포 후 할 일**
- [x] Vercel Production 환경변수 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=<BE 주소>`로 바꾸고 Redeploy (Render BE는 6장)
- [ ] BE `CORS_ORIGINS`에 `https://spot-on-fe.vercel.app` 추가 (BE 담당)
- [ ] 배포 주소에서 4장 확인 항목(주소 검색 → STEP 02~04, 새로고침, "시연 데이터" 표시 없음) 다시 확인

## 6. Render BE 연결

BE가 Render 무료 플랜에 올라가 있고, Vercel 운영 주소가 이 BE에 연결돼 있다 (확인일 2026-11-14).

- BE 주소: **https://spoton-be-free.onrender.com** (API 문서 `/docs`) — 예전 검증 주소는 더 이상 쓰지 않는다
- API 형식은 그대로다 (`{data, meta, error}`, 경로 `/api/...`)

**Vercel 현재 설정** (Settings → Environment Variables, 키 값은 이 문서에 쓰지 않는다)

| 환경 | `VITE_USE_MOCK` | `VITE_API_BASE_URL` | 결과 |
|---|---|---|---|
| **Production** (https://spot-on-fe.vercel.app, develop) | `false` | `https://spoton-be-free.onrender.com` (Config) | 실제 BE 연결 |
| **Preview** (PR 미리보기) | 미설정 → 목업 | 미설정 | BE에 연결하지 않는다 — BE CORS가 운영 도메인만 허용하고, 미리보기 주소는 PR마다 달라 넣을 수 없다 |

**설정을 바꿀 때 순서**
1. `VITE_USE_MOCK` = `false`
2. `VITE_API_BASE_URL` = `https://spoton-be-free.onrender.com` — **끝에 `/api`를 붙이지 않는다** (FE가 `/api`를 붙인다)
3. `VITE_KAKAO_JS_KEY`는 그대로
4. **Redeploy** — `VITE_` 값은 빌드할 때 들어가므로 다시 배포해야 반영된다
5. 배포 주소에서 주소 검색 → STEP 02~04 → 새로고침을 확인하고, "시연 데이터" 배지가 없는지 본다

**CORS (BE 담당)**
- BE `CORS_ORIGINS`에 운영 도메인 `https://spot-on-fe.vercel.app`(과 로컬 확인용 주소)이 들어 있어야 한다. 도메인이 바뀌면 BE에 추가를 요청하고 BE를 재배포한다
- 실제 BE 확인은 운영 주소(develop 배포)나 로컬에서 한다

**알아둘 것**
- **AI 해석은 꺼져 있을 수 있다** (LLM 키 없음) → "AI 해석 보기"를 누르면 503 `AI_UNAVAILABLE` 안내가 나오는 것이 정상이다. 지표 카드는 그대로 보인다
- 공식 창업위험도는 링크 안내(`link_only`), 상권변화지표 등은 "확인 중"(pending) 그대로다 — 배포로 수치가 생긴 것이 아니다

**무료 BE의 특성과 FE 대응**
- **15분 동안 요청이 없으면 잠든다** → 깨어나는 첫 요청이 30초~1분 걸린다
- **DB 연결이 1개(풀 1)** → 결과 화면이 처음 열릴 때 부르는 요청 5개(history·data-range·nearby·activity·risk)가 줄을 서서 하나씩 처리된다. 첫 접속에 요청 하나가 8~11초까지 걸린 적이 있다 (2026-11-14 측정)
- FE 대응
  - 미리 깨우기: 랜딩·입력 화면이 열리면 `GET /api/health`를 탭당 한 번 조용히 보낸다 (실제 서버 모드에서만, `src/api/health.ts`)
  - 첫 주소 검색은 60초까지 기다리고, 3초가 넘으면 버튼에 "서버 준비 중…"
  - 나머지 요청 제한은 **45초** (`DEFAULT_TIMEOUT_MS`, `src/api/client.ts`), AI 해석도 45초
  - 조회가 시간 초과·연결 실패면 **1번 자동 재시도** (`src/api/retry.ts`) — 재시도 중에도 로딩 화면 그대로. 서버 오류 응답(4xx·5xx)과 AI 해석·주소 검색은 자동 재시도 없음
  - 로딩이 5초를 넘으면 "처음 불러올 때는 시간이 조금 걸려요" 안내 (한 화면에 하나)
  - 그래도 시간이 넘으면 "서버를 준비하는 중이에요. 잠시 후 다시 시도해 주세요." + [다시 시도]

**시연 전 체크**
- [ ] **시연 5분 전에 운영 사이트를 열어 서버를 깨운다** (랜딩만 열어도 미리 깨우기가 나간다). 시연 주소로 결과 화면까지 한 번 열어 두면 DB 연결도 미리 데워져 더 빠르다
- [ ] 시연 중 15분 넘게 비우지 않기 (다시 잠든다)
- [ ] "AI 해석 보기"는 503 안내가 나오는 것이 정상이라고 미리 말해 둔다 (LLM 키가 없을 때)
