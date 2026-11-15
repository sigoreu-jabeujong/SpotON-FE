import { Navigate, useLocation } from 'react-router'

type Props = { to: string; hash: string | null }

/** 예전 결과 경로를 새 경로로 보낸다. 진단 조건 쿼리는 그대로 유지 */
export default function LegacyRedirect({ to, hash }: Props) {
  const { search } = useLocation()
  return <Navigate to={{ pathname: to, search, hash: hash ? `#${hash}` : '' }} replace />
}
