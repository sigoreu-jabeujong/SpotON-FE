type Props = {
  /** 파란 숫자 (예: "01") */
  number: string
  title: string
  description?: string
  /** 섹션 aria-labelledby 연결용 제목 id */
  id?: string
}

/** "01 과거 점포 이력" — 파란 숫자 + 굵은 제목 + 회색 설명 */
export default function SectionHeader({ number, title, description, id }: Props) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-title leading-none font-bold text-blue-500" aria-hidden="true">
        {number}
      </span>
      <div>
        <h2 id={id} className="text-section font-bold text-gray-900">
          <span className="sr-only">{number} </span>
          {title}
        </h2>
        {description && <p className="mt-0.5 text-caption text-gray-600">{description}</p>}
      </div>
    </div>
  )
}
