/**
 * 선 그래프용 — 서버 값은 그대로 두고, 자료가 없는 연도는 값 없는(null) 점으로 끼워 넣어 선이 끊기게 한다.
 * 없는 연도를 0으로 채우지 않는다 (#34: 1971→2002가 이어진 값처럼 보이지 않게). 표는 서버 행 그대로
 */
export function withGaps(
  trend: { year: number; opened: number; closed: number }[],
): { year: number; opened: number | null; closed: number | null }[] {
  const byYear = new Map(trend.map((t) => [t.year, t]))
  const years = trend.map((t) => t.year)
  const min = Math.min(...years)
  const max = Math.max(...years)
  const out: { year: number; opened: number | null; closed: number | null }[] = []
  for (let y = min; y <= max; y++) {
    const row = byYear.get(y)
    out.push(row ? { ...row } : { year: y, opened: null, closed: null })
  }
  return out
}
