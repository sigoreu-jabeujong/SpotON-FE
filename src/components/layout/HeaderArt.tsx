import { IMAGES } from '../../assets/images'

/**
 * 결과 화면 머리 오른쪽 배경 그림 자리.
 * 디자인의 3D 건물·위치 핀 그림은 src/assets/images.ts의 resultHeader에 넣으면 바로 바뀐다.
 * 지금은 연한 파란 그라데이션 임시 배경 (장식이라 화면 읽기 프로그램에서는 숨김)
 */
export default function HeaderArt() {
  if (IMAGES.resultHeader) {
    return (
      <img
        src={IMAGES.resultHeader}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 object-cover object-left"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-blue-100 via-blue-100/60 to-transparent"
    />
  )
}
