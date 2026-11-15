# 브랜드·체인 v2 공개 활성화

2026-11-15 사용자는 PR60 병합·공개 v1 배포 확인 후 다음 단계인 운영 BE v2 배포와 공개 FE 활성화를 승인했다. 따라서 이전 `brand-chain-v2.md`의 별도 승인 대기 경계는 이번 운영 전환에 한해 충족됐다. BE 운영 백업·0012·publication·조회권한·실제 API/AI 검증을 완료한 후 이 PR을 develop에 병합한다. 검증 전 병합하지 않는다.

Vercel 전용 `npm run build:vercel`은 공식 시스템 변수 VERCEL_ENV로 빌드 프로필을 고정한다. production은v2, preview/development는v1이다. 기존 대시보드의 VITE_ANALYSIS_API_VERSION보다 이 실행 프로세스의 값이 우선하며, 다른 환경값·Kakao 공개 키·BE 주소·원래.env는 바꾸지 않는다. 값이 없거나 모르는 VERCEL_ENV이면 빌드를 실패시킨다. 일반 `npm run build`와 로컬 프로필 기본v1은 유지한다. 기존 SPA rewrite는 유지한다.

근거는 [Vercel buildCommand](https://vercel.com/docs/project-configuration/vercel-json)와 [VERCEL_ENV](https://vercel.com/docs/environment-variables/system-environment-variables) 공식 문서다. 배포 구분에 브라우저 URL을 사용하지 않는다. Preview는 기존v1 목업이며 운영 DB에 접속하지 않는다.

검증은 기존159개 회귀·배포 구분4개·린트/타입·Vercel production(v2)/preview(v1) 실제 빌드와 잘못된 환경 빌드 실패, 실제 Claude 정적 검수, PR CI와 공개 브라우저 v2 분석/필터/AI·보고서·모바일을 포함한다. 실제 수행 결과는 운영 검증 후 기록한다. 되돌릴 때는 이 활성화 변경을 revert해 기존v1로 빌드하고 BE0012/원본 데이터를 보존한다. 긴급 복구는 접근 가능한 운영 콘솔의 직전 Vercel production 배포 복구를 사용할 수 있으나 수행하지 않은 절차를 검증됐다고 주장하지 않는다.
