type Props = {
  title: string
  description?: string
  /** 섹션 aria-labelledby 연결용 제목 id */
  id?: string
}

/**
 * 섹션 머리 — 굵은 제목 + 아래 한 줄 설명.
 * 세 섹션은 순서가 아니라 서로 다른 관점이라 번호(01·02·03)를 붙이지 않고 크기·굵기·간격으로 위계를 준다
 */
export default function SectionHeader({ title, description, id }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-section font-bold text-gray-900">
        {title}
      </h2>
      {description && <p className="text-body text-gray-600">{description}</p>}
    </div>
  )
}
