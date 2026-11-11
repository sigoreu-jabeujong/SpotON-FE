/**
 * 화면 그림 경로를 한곳에서 관리한다 (디자이너 윤희은 제작 — 배경이 투명한 webp).
 * 그림을 바꾸려면 이 폴더에 파일을 넣고 아래 import만 바꾸면 된다.
 * 값이 null이면 각 화면이 임시 배경(연한 파란 그라데이션)·아이콘을 보여준다.
 * 인쇄용 진단서(PDF)와 요약 이미지에는 큰 장식 그림을 쓰지 않는다.
 */
import cityImage from './city-3d.webp'
import homeGradient from './home-gradient.webp'
import koreaMap from './korea-map.webp'
import logoSymbol from './logo.webp'
import robotImage from './robot.webp'

export const IMAGES: {
  /** S 심볼 로고 (글자 없음) — 헤더 로고 옆. 파비콘·공유 이미지는 이 그림으로 만든 public/ 정적 파일 */
  logo: string | null
  /** ① 랜딩 오른쪽 3D 전국 지도 */
  landingMap: string | null
  /** ① 랜딩 전국 지도 뒤(아래 레이어)에 까는 배경 그라데이션 */
  landingGradient: string | null
  /** ② 입력 화면 아래쪽 배경 3D 건물·위치 핀 */
  inputBackground: string | null
  /** 결과 화면 머리 오른쪽 3D 건물·위치 핀 */
  resultHeader: string | null
  /** AI 해석 카드, "다른 자리도 궁금하신가요?" 옆 로봇 */
  robot: string | null
} = {
  logo: logoSymbol,
  landingMap: koreaMap,
  landingGradient: homeGradient,
  inputBackground: cityImage,
  resultHeader: cityImage,
  robot: robotImage,
}
