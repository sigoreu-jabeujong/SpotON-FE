/** className 합치기 (false·null·undefined는 건너뜀) */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
