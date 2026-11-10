/**
 * 화면 그림 경로를 한곳에서 관리한다.
 * 디자인 이미지 파일을 받으면 src/assets/ 에 넣고 아래 값을 import 경로로 바꾸면 된다.
 *   예) import landingMap from './landing-map.png'  →  landingMap: landingMap
 * 값이 null이면 각 화면이 임시 배경(연한 파란 그라데이션)을 보여준다.
 */
export const IMAGES: {
  /** ① 랜딩 오른쪽 3D 전국 지도 */
  landingMap: string | null
  /** ② 입력 화면 배경 3D 건물·위치 핀 */
  inputBackground: string | null
  /** 결과 화면 머리 오른쪽 3D 건물·위치 핀 */
  resultHeader: string | null
} = {
  landingMap: null,
  inputBackground: null,
  resultHeader: null,
}
