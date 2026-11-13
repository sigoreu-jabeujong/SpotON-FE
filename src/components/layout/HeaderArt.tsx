import { IMAGES } from '../../assets/images'

/**
 * 결과 화면 머리 오른쪽 배경 그림 자리.
 * 디자인의 3D 건물·위치 핀 그림 (src/assets/images.ts의 resultHeader). 장식이라 화면 읽기 프로그램에서는 숨김.
 * 제목·설명보다 눈에 띄지 않게 옅게(투명도 40%) — 입력 화면 배경 그림과는 별개
 * 그림이 없으면 연한 파란 그라데이션 임시 배경
 */
export default function HeaderArt() {
  if (IMAGES.resultHeader) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[50%] overflow-hidden"
      >
        <img
          src={IMAGES.resultHeader}
          alt=""
          aria-hidden="true"
          className="absolute -top-4 right-0 h-[170%] w-auto max-w-none opacity-40"
        />
        {/* 제목·설명 글자가 그림 위에 겹쳐도 읽히도록 왼쪽으로 배경색이 덮인다 */}
        <div className="absolute inset-0 bg-linear-to-r from-bg via-bg/40 to-transparent" />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-blue-100 via-blue-100/60 to-transparent"
    />
  )
}
