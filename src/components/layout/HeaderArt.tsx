/**
 * 결과 화면 머리 오른쪽 배경 그림 자리.
 * 디자인의 3D 건물·위치 핀 그림을 받으면 이 컴포넌트 안만 이미지로 바꾼다.
 * 지금은 연한 파란 그라데이션 임시 배경 (장식이라 화면 읽기 프로그램에서는 숨김)
 */
export default function HeaderArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-blue-100 via-blue-100/60 to-transparent"
    />
  )
}
