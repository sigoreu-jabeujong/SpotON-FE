import { Link } from 'react-router'
import { ROUTES } from '../constants/routes'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <Link to={ROUTES.landing} className="mt-4 inline-block underline">
        처음으로 가기
      </Link>
    </div>
  )
}
