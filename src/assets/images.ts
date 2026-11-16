/**
 * 화면 그림 경로를 한곳에서 관리한다 (디자이너 윤희은 제작 — 배경이 투명한 webp).
 * 그림을 바꾸려면 이 폴더에 파일을 넣고 아래 import만 바꾸면 된다.
 * 값이 null이면 각 화면이 임시 배경(연한 파란 그라데이션)·아이콘을 보여준다.
 * 인쇄용 진단서(PDF)와 요약 이미지에는 큰 장식 그림을 쓰지 않는다.
 */
import cityImage from './city-3d.webp'
import homeGlow from './home-glow.webp'
import koreaMap from './korea-map.webp'
import logoSymbol from './logo.webp'
import robotImage from './robot.webp'
import storePin from './store-pin.webp'

export const IMAGES: {
  /** S 심볼 로고 (글자 없음) — 헤더 로고 옆. 파비콘·공유 이미지는 이 그림으로 만든 public/ 정적 파일 */
  logo: string | null
  /** ① 랜딩 오른쪽 3D 전국 지도 */
  landingMap: string | null
  /**
   * ① 랜딩 전국 지도 뒤 가운데 파란 빛 — 궤도선·구슬을 지운 그림 (선·구슬은 LandingOrbit이 코드로 그린다).
   * 예전 한 장짜리 그림(home-gradient.webp)은 원본으로 남겨 둔다
   */
  landingGradient: string | null
  /** ② 입력 화면 아래쪽 배경 3D 건물·위치 핀 */
  inputBackground: string | null
  /** 결과 화면 머리 오른쪽 3D 건물·위치 핀 */
  resultHeader: string | null
  /** AI 해석 카드, "다른 자리도 궁금하신가요?" 옆 로봇 */
  robot: string | null
  /** ③ STEP 03 참고지표 "반경 안 동종업체 수" 카드 오른쪽 가게·위치 핀 (투명 여백을 잘라 320px로 줄인 그림, 원본은 저장소 밖) */
  storePin: string | null
} = {
  logo: logoSymbol,
  landingMap: koreaMap,
  landingGradient: homeGlow,
  inputBackground: cityImage,
  resultHeader: cityImage,
  robot: robotImage,
  storePin,
}
