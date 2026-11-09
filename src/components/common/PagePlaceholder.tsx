type Props = {
  title: string
  description: string
}

/** 디자인 시안 반영 전 임시 화면. 각 페이지 구현 시 교체한다 */
export default function PagePlaceholder({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  )
}
