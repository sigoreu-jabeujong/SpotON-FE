# 브랜드·체인 v2 공개 활성화

2026-11-15 운영 v2 전환 완료. BE PR154의 성능 보완/0012·publication·조회 권한 검증 뒤 FE PR62를 공개 활성화했다. Production=v2, Preview/development=v1, 일반 로컬 기본v1이다. 공개 필터·실제 AI·보고서·모바일390/360·키보드·오류/취소를 확인했다. [운영 실행·검수·복구 기록](https://github.com/sigoreu-jabeujong/SpotON-BE/blob/develop/docs/designs/production-chain-v2-rollout.md)을 따른다. 아래 과거 진행/승인 대기 문구는 이 전환에 관해 완료된 이력이다.

2026-11-15 사용자는 PR60 병합·공개 v1 배포 확인 후 다음 단계인 운영 BE v2 배포와 공개 FE 활성화를 승인했다. 따라서 이전 `brand-chain-v2.md`의 별도 승인 대기 경계는 이번 운영 전환에 한해 충족됐다. BE 운영 백업·0012·publication·조회권한·실제 API/AI 검증을 완료한 후 이 PR을 develop에 병합한다. 검증 전 병합하지 않는다.

Vercel 전용 `npm run build:vercel`은 공식 시스템 변수 VERCEL_ENV로 빌드 프로필을 고정한다. production은v2, preview/development는v1이다. 기존 대시보드의 VITE_ANALYSIS_API_VERSION보다 이 실행 프로세스의 값이 우선하며, 다른 환경값·Kakao 공개 키·BE 주소·원래.env는 바꾸지 않는다. 값이 없거나 모르는 VERCEL_ENV이면 빌드를 실패시킨다. 일반 `npm run build`와 로컬 프로필 기본v1은 유지한다. 기존 SPA rewrite는 유지한다.

근거는 [Vercel buildCommand](https://vercel.com/docs/project-configuration/vercel-json)와 [VERCEL_ENV](https://vercel.com/docs/environment-variables/system-environment-variables) 공식 문서다. 배포 구분에 브라우저 URL을 사용하지 않는다. Preview는 기존v1 목업이며 운영 DB에 접속하지 않는다.

검증은 기존159개 회귀·배포 구분4개·린트/타입·Vercel production(v2)/preview(v1) 실제 빌드와 잘못된 환경 빌드 실패, 실제 Claude 정적 검수, PR CI와 공개 브라우저 v2 분석/필터/AI·보고서·모바일을 포함한다. 실제 수행 결과는 운영 검증 후 기록한다. 되돌릴 때는 이 활성화 변경을 revert해 기존v1로 빌드하고 BE0012/원본 데이터를 보존한다. 긴급 복구는 접근 가능한 운영 콘솔의 직전 Vercel production 배포 복구를 사용할 수 있으나 수행하지 않은 절차를 검증됐다고 주장하지 않는다.


## 실제 완료 결과

FE PR62 활성화 commit93099f1/Production 배포 성공, BE71eaef9/dep-dbslqv5ckfvc73dbu6a0/schema0012를 확인했다. FE 회귀159+배포 구분4·린트/타입·양 프로필 빌드와 잘못된 환경 실패·실제 Claude FE 검수PASS·CI/CodeQL/Preview를 통과했다. BE는 일반1957/PostGIS298·24필터×4종 수 일치·이력10건 불변·실제 카페/음식점 AI 및 음식점 non_chain AI19.031초/4문단/검증 통과를 확인했다. 관측 시간은 SLA가 아니다.

실제 공개 브라우저의 분석 요청은 모두v2였고 legacy 가맹 파라미터가 없었다. 범위/소속 미확인 선택 독립성·기존 링크 변환/안내·확인 근거 부족0건 설명, 모바일390/360 가로 넘침 없음·키보드/팝오버, 실제 AI200/4문단/숫자39개 검증, 보고서 캐시 재사용/자동POST 없음·조건 변경/요청 취소를 확인했다.503·세대 혼합·AI 불일치는 브라우저 응답 대체로만 검증했다. 원본.env·사용자 미추적 자료·기존 로컬 서버/BE 환경은 보존했다. 이후 문서 전용 배포는 앱 코드가 같으며 공개 활성화 기준 commit과 구분한다.
