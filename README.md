# SpotON-FE

**Spot:ON(스팟온) 프론트엔드** — 계약하려는 주소 하나를 입력하면, 그 자리를 거쳐 간 점포의 이력과 주변 동일 업종의 생존 기록을 근거와 함께 보여주는 공공데이터 기반 창업 입지 진단 웹서비스

> **Is your spot on? — 내 자리, 딱 맞는 자리일까요?**

- 대상: 서울특별시에서 **카페·음식점**(한식·중식·일식·양식) 창업을 준비하는 **만 18세 이상 예비창업자**
- 팀: 시고르자브종 (청년 공공AX 서포터즈)
- 백엔드 저장소: [SpotON-BE](https://github.com/sigoreu-jabeujong/SpotON-BE)

## 주요 기능

| ID | 기능 | 설명 |
|---|---|---|
| F-01 | 주소·업종 입력 | 도로명·지번 주소 검색과 좌표 변환, 카페/음식점 선택, 서울 밖·누락 시 진행 차단 |
| F-02 | 과거 점포 이력 | 같은 건물을 거쳐 간 점포의 개업·폐업일, 영업 기간, 업종, 프랜차이즈(추정) 여부를 시간순으로 |
| F-03 | 주변 동일 업종 지도 | 정한 시점·반경 안의 같은 업종 점포를 지도에 표시 (영업 중/폐업 구분) |
| F-04 | 세부 필터 | 반경(300/500/1,000m), 음식점 세부 업종 / 선택: 시설 규모·프랜차이즈 |
| F-05 | 시점 조회 | 과거 특정 연·월에 있던 점포가 지금도 영업 중인지 확인 |
| F-06 | 점포 변동·상권지표 | 최근 12개월 개업·폐업 수와 연도별 추이 / 조건부: 상권별 추정매출·격자 생활인구 |
| F-07 | 위험도·정량지표 | 서울시 공식 지표와 Spot:ON 참고지표를 나눠 표시, 표본이 부족하면 "판단 보류" |
| F-08 | AI 해석·체크리스트 | 서버가 계산한 지표만으로 유리·불리 요인과 계약 전 확인사항 정리 ("AI 해석 보기" 클릭 시) |
| F-09 | 결과 저장·공유 | PDF 진단서 우선, 요약 이미지는 그다음 (선택 기능) |
| F-10 | 공공 상담·지원 연결 | 공공 창업상담·소상공인 지원기관 링크, 다른 주소 다시 진단 |

### 화면

화면 캡처는 추후 추가 예정이에요.

| 경로 | 화면 |
|---|---|
| `/` | ① 랜딩 |
| `/diagnose` | ② 주소·업종 입력 |
| `/result/history` | ③ 과거 점포 이력 |
| `/result/nearby` | ④ 주변 점포 현황 (지도·필터·시점 조회) |
| `/result/activity` | ⑤ 상권 활동 분석 |
| `/result/risk` | ⑥ 창업 위험도 분석 (공식/참고 지표, AI 해석) |
| `/result/share` | ⑦ 저장·공유·상담 |

## 기술 스택

| 구분 | 사용 |
|---|---|
| 프레임워크 | React 19 + TypeScript 5.9, Vite |
| 스타일 | Tailwind CSS v4 (디자인 토큰: `src/index.css`의 `@theme`) |
| 라우팅 | React Router |
| 서버 데이터 | TanStack Query |
| 지도 | 카카오맵 JavaScript SDK (연동 예정) |
| 검사 도구 | ESLint, Prettier, TypeScript 타입 검사 |
| 패키지 매니저 | npm (`package-lock.json` 커밋) |

## 시작하기

Node.js 20 이상이 필요해요.

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 파일 만들기 (.env는 커밋하지 않아요)
cp .env.example .env

# 3. 개발 서버 실행 → http://localhost:5173
npm run dev
```

5173 포트를 이미 다른 프로그램이 쓰고 있다면 다른 포트로 실행하세요.

```bash
npx vite --port 5180
```

### 환경변수 (`.env`)

| 이름 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 서버 주소만 적어요 (예: `http://localhost:8000`). `/api`는 코드가 붙여요 |
| `VITE_USE_MOCK` | `true`면 백엔드 없이 `src/api/mocks/`의 예시 응답으로 화면을 개발할 수 있어요 |
| `VITE_KAKAO_JS_KEY` | (지도 연동 시 추가 예정) 카카오맵 JavaScript 키. 브라우저 공개용 키라서 카카오 개발자 콘솔에 **허용 도메인을 꼭 등록**해요 |

> ⚠️ `VITE_`로 시작하는 값은 브라우저에 그대로 보여요. 카카오맵 JavaScript 키를 뺀 나머지 API 키·비밀값은 절대 넣지 말고 백엔드에서 처리해요.

### 자주 쓰는 명령어

```bash
npm run lint          # 코드 검사 (ESLint)
npm run format        # 코드 자동 정리 (Prettier)
npm run format:check  # 정리 상태 확인
npm run build         # 타입 검사 + 빌드
```

## 폴더 구조

```text
SpotON-FE/
├── docs/              # 팀 정리 문서 (API 계약, 화면 요구사항, 표시 원칙, 결정 사항)
├── public/
└── src/
    ├── pages/         # 화면 단위 컴포넌트 (라우트 1개 = 파일 1개)
    ├── components/    # 재사용 UI 컴포넌트 (layout/, common/ 등)
    ├── api/           # 백엔드 호출 함수 (client.ts, mocks/)
    ├── types/         # API 응답 등 공통 타입
    ├── hooks/         # 커스텀 훅 (useDiagnosisQuery: 진단 조건을 URL에 유지)
    ├── constants/     # 진단 조건, 상태 라벨, 화면 문구, 경로
    ├── utils/         # 순수 함수 유틸 (필요할 때 추가)
    └── router.tsx     # 화면 경로 정의
```

개발 규칙과 문서 안내는 [CLAUDE.md](CLAUDE.md)와 [docs/README.md](docs/README.md)를 참고하세요.

## 브랜치·커밋 규칙

- 브랜치: `main`(최종) ← `develop`(통합) ← `feat/기능명`, `fix/버그명`, `docs/문서명`, `chore/작업명`
- `main`, `develop`에 직접 커밋·push 하지 않아요. 기능 하나 = 브랜치 하나 = PR 하나 (`develop` 대상)
- 커밋 메시지: `타입: 내용` (예: `feat: 입지 진단 결과 화면 추가`)
  - 타입: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`
- PR 전에 `npm run lint`, `npm run format:check`, `npm run build`를 모두 통과해요
- FE PR은 merge commit으로 머지해요 (커밋 기록 보존)

## 사용한 공공데이터와 출처

화면에 표시되는 출처 번호(R번호)와 같아요. 전체 표는 [docs/display-rules.md](docs/display-rules.md#7-출처-번호-표)에 있어요.

| 번호 | 데이터 | 제공 | 링크 | 이용 조건 |
|---|---|---|---|---|
| R5 | 일반음식점 인허가 | 행정안전부 (공공데이터포털) | [15154916](https://www.data.go.kr/data/15154916/openapi.do) | 이용허락범위 제한 없음 |
| R6 | 휴게음식점 인허가 | 행정안전부 (공공데이터포털) | [15154921](https://www.data.go.kr/data/15154921/openapi.do) | 이용허락범위 제한 없음 |
| R1 | 서울시 상권분석서비스 (창업위험도 등) | 서울신용보증재단 | [상권별 현황](https://golmok.seoul.go.kr/stateDistrict.do) | 출처 표시, 공표값 인용 |
| R11 | 서울시 창업위험도 지표 정의 | 서울신용보증재단 | [산정 방식](https://golmok.seoul.go.kr/images/seoul_info.pdf) | 출처 표시 |
| R2 | 점포-상권 | 서울 열린데이터광장 | [OA-15577](https://data.seoul.go.kr/dataList/OA-15577/F/1/datasetView.do) | 공공누리 1유형 |
| R15 | 영역-상권 (상권 경계) | 서울 열린데이터광장 | [OA-15560](https://data.seoul.go.kr/dataList/OA-15560/S/1/datasetView.do) | 확인 중 |
| R3 | 추정매출-상권 (조건부) | 서울 열린데이터광장 | [OA-15572](https://data.seoul.go.kr/dataList/OA-15572/S/1/datasetView.do) | 확인 중 |
| R4 | 생활인구 250m 격자 (조건부) | 서울 열린데이터광장 | [OA-22784](https://data.seoul.go.kr/dataList/OA-22784/S/1/datasetView.do) | 확인 중 |
| R16 | 상권변화지표 (조건부) | 서울 열린데이터광장 | [OA-15576](https://data.seoul.go.kr/dataList/OA-15576/S/1/datasetView.do) | 확인 중 |
| R9 | 가맹정보 (프랜차이즈 추정) | 공정거래위원회 | [15143693](https://www.data.go.kr/data/15143693/openapi.do) · [15143710](https://www.data.go.kr/data/15143710/openapi.do) | 확인 중 |
| R19 | 주소·좌표 API | 행정안전부 | [15057017](https://www.data.go.kr/data/15057017/openapi.do) · [15056663](https://www.data.go.kr/data/15056663/openapi.do) | — |
| R8 | 카카오 로컬·지도 | 카카오 | [로컬](https://developers.kakao.com/docs/latest/ko/local/dev-guide) · [지도](https://apis.map.kakao.com) | 카카오 운영정책·약관 |
| R17 | 상담·지원기관 링크 | 서울시 자영업지원센터 외 3곳 | [docs 출처 표](docs/display-rules.md#7-출처-번호-표) | 링크 연결만 |
| R18 | AI 해석 | Google Gemini API | [AI Studio](https://aistudio.google.com) | Gemini API 약관 |

## 팀 시고르자브종

| 이름 | 역할 |
|---|---|
| 권민수 | 팀장·PM (기획·총괄) |
| 윤희은 | UI/UX 디자인 |
| 류민지 | 프론트엔드 |
| 최호림 | 백엔드 (서버·DB·API) |
| 김승은 | 백엔드 (AI·데이터) |

## 유의사항

- Spot:ON의 결과는 공공데이터를 바탕으로 한 **참고용 정보**예요. 창업의 **성공·실패를 판정하지 않으며**, 사업주의 역량은 반영하지 않아요.
- **폐업은 행정상 신고 기록 기준**이라 실제 영업 종료 시점과 다를 수 있어요.
- 추정매출(상권 단위)과 생활인구(250m 격자 단위)는 추정치이며, 특정 점포의 실제 매출·고객 수가 아니에요.
- **만 18세 이상 예비창업자**를 대상으로 해요.
- AI 해석은 서버가 계산한 지표만을 바탕으로 만든 참고 문장이며, 전문적인 조언을 대신하지 않아요.
- 시연용 가상 데이터를 쓴 화면에는 "시연 데이터"라고 표시해요.
