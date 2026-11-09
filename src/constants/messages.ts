/** 화면에 보이는 안내·오류·면책 문구 (한곳에서 관리) */
export const MESSAGES = {
  input: {
    addressRequired: '점포 주소를 입력해 주세요',
    addressNotFound: '주소를 찾을 수 없어요. 도로명 또는 지번 주소를 다시 확인해 주세요',
    outsideSeoul: '지금은 서울특별시 주소만 진단할 수 있어요',
    categoryRequired: '업종을 하나 골라 주세요',
  },
  common: {
    loading: '불러오는 중이에요',
    error: '정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요',
    empty: '조건에 맞는 결과가 없어요',
  },
  ai: {
    unavailable: 'AI 해석을 불러오지 못했어요. 계산된 지표는 그대로 확인할 수 있어요',
  },
  disclaimer:
    '이 결과는 공공데이터 기반 참고 정보이며 창업의 성공·실패를 판단하지 않아요. 개별 사업주의 역량은 반영하지 않았어요.',
} as const
