import type { PublicNumber } from '../../../types/population'

export function publicNumberText(number: PublicNumber) {
  if (number.value === null) {
    return number.reason === 'zero_night_denominator'
      ? '야간 공개자료 값이 0이라 배수를 계산하지 않아요'
      : '사용한 공개자료가 모두 0이라 비중을 계산하지 않아요'
  }
  return /^0\.0+$/.test(number.value) && number.exact_zero === false
    ? `${number.display} (0에 가까운 값)`
    : (number.display ?? '자료 없음')
}
