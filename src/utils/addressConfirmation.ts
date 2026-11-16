export const confirmed = new Set<string>()
export function addressIdentity(search: string) {
  const params = new URLSearchParams(search)
  return JSON.stringify(
    ['address', 'detail', 'detailMode', 'category', 'bk', 'floor', 'lat', 'lng'].map((key) =>
      params.getAll(key),
    ),
  )
}
export function rememberAddress(search: string) {
  if (confirmed.size >= 128) confirmed.clear()
  confirmed.add(addressIdentity(search))
}
