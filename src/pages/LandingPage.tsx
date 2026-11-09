import { Link } from 'react-router'
import { ROUTES } from '../constants/routes'

// TODO: 디자인 시안 반영 (① 랜딩)
export default function LandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Spot:ON</h1>
      <p className="mt-3 text-gray-600">Is your spot on? — 내 자리, 딱 맞는 자리일까요?</p>
      <Link
        to={ROUTES.input}
        className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
      >
        진단 시작하기
      </Link>
    </div>
  )
}
