# AI 해석 3영역 구현 기록

사용자 그림에 따라 한 결과 블록 안에 이점/유의점 두 카드를 배치하고 아래에 수치 해석·근거 카드 및 기존 계약 전 확인사항 3개를 표시한다. 모바일은 한 단이다. 체크 상태는 저장하지 않는다.

BE 계약과 설계는 [AI 해석 API](https://github.com/sigoreu-jabeujong/SpotON-BE/blob/feat/ai-sections-report/docs/fe-ai-sections-api.md), [설계·검수](https://github.com/sigoreu-jabeujong/SpotON-BE/blob/feat/ai-sections-report/docs/designs/ai-three-section-implementation.md)를 따른다. v2만 새 화면을 사용하고 v1은 기존 해석을 유지한다.

수동 POST 1건 안에서 BE가 Gemini 3역할을 각각 한 번 호출한다. FE 자동 POST/재시도는 없고, 정상 캐시 및 PDF는 Gemini를 다시 호출하지 않는다. GET baseline 검증으로 현재 화면과 다른 자료의 해석이 섞이지 않도록 한다. 자료 재조회 동안 마지막 성공 토큰이 같으면 결과와 체크 상태를 유지하고, 요청 중 토큰이 바뀌면 명시적으로 자료 변경을 안내한다.

필수 한계 안내는 독립 limitations를 검증해 유의점 역할이 실패해도 표시한다. 각 수치는 표시값·기준일·공간·대상·출처·반올림을 함께 보여준다. 행정동 이름 area_label은 서버의 표시 전용 필드이며 모델 입력에 넣지 않는다. 카페 이력 요청의 업종을 음식점으로 대체하지 않는다.

Claude Code 실제 구현 정적 검수는 1차 NEEDS_CHANGES, 2차 PASS였다. 1차 필수 한계 안내 누락은 보완했고, 2차의 배경 조회 시 결과 언마운트/자료 변경 무안내/행정동 이름 권고를 추가 보완했다. 최종 검수 결과는 BE 기록에 남긴다.

사용자 지시로 단위/통합 테스트·브라우저·실제 DB/Gemini 호출은 실행하지 않았다. ESLint·TypeScript/Vite와 production v2 빌드만 검사한다. BE 먼저 배포한 뒤 FE main을 공개하며 Render 연결 확인 전에는 배포 완료를 주장하지 않는다.
