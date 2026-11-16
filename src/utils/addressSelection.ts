import type { GeocodeCandidate } from '../types/geocode'

/** 도로명 건물번호의 지하 표기는 층 정보와 구분해 주소 자체에 남긴다. */
function splitRoadAddress(value: string): { base: string; detail: string } | null {
  const match = value
    .normalize('NFKC')
    .trim()
    .match(
      /^(.*?(?:대로|로|길)(?:\d+(?:번길|길))?)\s*(지하\s*)?(\d+(?:-\d+)?)(?=$|\s|[,()]|제?\d+(?:층|호)|[Bb]\d)/,
    )
  if (!match) return null
  return {
    base: `${match[1]} ${match[2] ? '지하 ' : ''}${match[3]}`,
    detail: value
      .normalize('NFKC')
      .trim()
      .slice(match[0].length)
      .replace(/^[\s,]+/, ''),
  }
}

function canonicalAddress(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/^서울(?:특별시|시)?(?=\s)/, '서울')
    .replace(/지하\s*(?=\d)/g, '지하 ')
    .replace(/\s+/g, ' ')
}

function splitLotAddress(value: string): { base: string; detail: string } | null {
  const text = value.normalize('NFKC').trim()
  const match = text.match(
    /^(.*?(?:동|가|리))\s+(산\s*)?(\d+(?:-\d+)?)(?=$|\s|[,()]|제?\d+(?:층|호)|[Bb]\d)/,
  )
  if (!match) return null
  return {
    base: `${match[1]} ${match[2] ? '산 ' : ''}${match[3]}`,
    detail: text.slice(match[0].length).replace(/^[\s,]+/, ''),
  }
}

/** 생략한 상위 지역은 허용하되 입력한 지역·도로명·번호·지하 여부는 모두 일치해야 한다. */
function sameAddress(input: string, candidate: string): boolean {
  const wanted = canonicalAddress(input)
  const actual = canonicalAddress(candidate)
  return actual === wanted || actual.endsWith(` ${wanted}`)
}

export function selectAddress(input: string, candidates: GeocodeCandidate[]) {
  const road = splitRoadAddress(input)
  const lot = road ? null : splitLotAddress(input)
  const exact = candidates.filter((candidate) => {
    if (road) {
      const address = splitRoadAddress(candidate.address_road)
      return address !== null && sameAddress(road.base, address.base)
    }
    if (lot) {
      const address = splitLotAddress(candidate.address_jibun)
      return address !== null && sameAddress(lot.base, address.base)
    }
    return [candidate.address_road, candidate.address_jibun].some(
      (address) => address && sameAddress(input, address),
    )
  })
  // 후보가 하나여도 입력한 주소와 다르면 사용자가 확인하도록 한다.
  const selected = exact.length === 1 ? exact[0] : null
  const detail = road?.detail ?? lot?.detail ?? candidates[0]?.floor_unit ?? ''
  return { selected, detail }
}
