type Props = {
  title: string
  description: string
}

/** 화면 내용 구현 전 임시 자리 표시. 각 화면 구현 시 교체한다 */
export default function PagePlaceholder({ title, description }: Props) {
  return (
    <div className="rounded-control border border-dashed border-gray-300 bg-gray-100 p-6">
      <p className="text-body font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-caption text-gray-600">{description}</p>
    </div>
  )
}
