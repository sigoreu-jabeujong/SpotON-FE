import HeaderArt from './HeaderArt'

type Props = { title: string; description: string }

/** 결과 화면 공통 머리: 화면 제목·설명 + 오른쪽 배경 그림 (제목 위 영문 대문자 라벨 없이 제목이 바로 시작) */
export default function ResultHeader({ title, description }: Props) {
  return (
    <header className="relative overflow-hidden px-4 pt-10 pb-8 sm:px-10">
      <HeaderArt />
      <div className="relative">
        <h1 className="text-title font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-body text-gray-600">{description}</p>
      </div>
    </header>
  )
}
