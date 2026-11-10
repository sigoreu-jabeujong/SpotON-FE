# 결정 사항과 미결 사항

> 마지막 갱신: 2026-11-10
> 새 결정은 날짜와 함께 위에 추가하고, 관련 문서([api-contract.md](api-contract.md), [screens.md](screens.md), [display-rules.md](display-rules.md))를 따라 고친다.

## 1. 결정됨

| 날짜 | 결정 | 메모 |
|---|---|---|
| 2026-11-10 | **FE PR은 류민지가 merge commit으로 머지**한다 | 커밋 기록 보존. BE 머지 방식은 BE가 정한다 (BE 작업계획서는 Squash) |
| 2026-11-10 | FE 커밋 메시지는 **`타입: 내용`** 형식 | 타입: feat, fix, refactor, docs, style, chore |
| 2026-11-10 | 배포 위치는 **개발 완료 후 결정**. 최종 제출은 공공 GitLab | FE·BE 별도 저장소로 이관 |
| 2026-11-10 | **모바일 전용 대응은 범위 밖**, 데스크톱 1440 기준으로 개발 | 접근성 기본 규칙은 계속 지킨다 |
| 2026-11-10 | 랜딩은 디자인대로 **전국 지도 그림** 사용 | 서비스 범위(서울)는 문구로 안내 |
| 2026-11-10 | 카카오맵 JavaScript 키는 FE 환경변수 **`VITE_KAKAO_JS_KEY`** 로 두고, 카카오 개발자 콘솔에서 **허용 도메인을 제한**한다 | 브라우저 공개용 키라 예외 허용 (07 데이터 활용 명세서 8.4). 다른 키는 모두 BE |
| 2026-11-10 | 업종은 **카페(세부 업종 없음) + 음식점 4종(한식·중식·일식·양식)** | 키즈카페·라이브카페·분식·치킨·주점·기타 음식점·제과점 제외. BE 작업계획서 기준 |
| 2026-11-10 | 통합 브랜치는 **`develop`** (원격 `dev` 삭제됨). FE PR 대상은 `develop` | CLAUDE.md 반영 |
| 2026-11-10 | 기준 우선순위: 팀 최신 결정 > BE 작업계획서 > PDF | [README.md](README.md) |

## 2. BE 확인 대기

| # | 항목 | FE가 궁금한 것 | FE 임시 기준 |
|---|---|---|---|
| 1 | **CI의 develop 브랜치 반영** | `.github/workflows/ci.yml`이 `branches: [main, dev]`라 develop 대상 PR에서 CI가 돌지 않는다 | 호림님께 수정 요청함. 그 전까지 PR 본문에 로컬 검사 결과를 적는다 |
| 2 | **`official_risk` 형식** | PDF(`no_data` + `source_url`)와 BE 보완안(`link_only` + `link` + `copy_text`) 중 무엇인지 | 두 형식 모두 처리, 링크 안내만 |
| 3 | **상태값 목록** | `fact`/`estimate`/`no_data`/`pending`/`unknown`/`location_unverified` + `link_only` 확정 여부, `pending`과 `no_data` 구분 규칙 | PDF 6종 + `link_only` |
| 4 | **`error.detail`·오류 시 `meta` 형식** | `detail`이 항상 있는지, 오류 시 `meta`가 `null`인지 `{}`인지 | 둘 다 처리 |
| 5 | **핵심 API 완성 예정일** | geocode·history·nearby·snapshot·data-range·activity·risk·interpret·support-links 각각 언제 쓸 수 있는지 | 그 전까지 목업(`VITE_USE_MOCK=true`)으로 개발 |
| 6 | **API 명세서 PDF 갱신** | v1.2 PDF 공유 여부, 업종·LQ·`market_change`·`official_risk`·이력 `category` 의미 반영 | [api-contract.md 차이 표](api-contract.md#명세서pdf-v11-vs-be-작업계획서-차이) |

### 함께 확인하면 좋은 것

- 기준일 필드 이름: PDF v1.1 `meta.as_of` vs 회의 자료의 "v1.2 `effective_as_of`"
- 시설 규모 `area` 다중 선택 여부와 배열 표현
- `market_change`를 공식 지표 영역에 둘지 (BE: 서울시 원천 유형 그대로 = 공식)
- 이력 화면에 다른 지원 업종 점포가 나오는 방향 확정 여부
- 생활인구 안내 페이지(R12) URL
