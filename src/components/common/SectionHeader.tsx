type Props = {
  /** 파란 숫자 (예: "01") */
  number: string
  title: string
  description?: string
  /** 섹션 aria-labelledby 연결용 제목 id */
  id?: string
}

/** "01 과거 점포 이력" — 파란 번호 배지 + 굵은 제목, 아래 한 줄 설명 (번호·제목 세로 가운데 맞춤) */
export default function SectionHeader({ number, title, description, id }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-body font-bold text-white tabular-nums"
          aria-hidden="true"
        >
          {number}
        </span>
        <h2 id={id} className="text-section font-bold text-gray-900">
          <span className="sr-only">{number} </span>
          {title}
        </h2>
      </div>
      {description && <p className="pl-11 text-body text-gray-600">{description}</p>}
    </div>
  )
}
