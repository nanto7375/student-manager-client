export const BASE_URL = import.meta.env.VITE_API_URL + '/v1';

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SCHEDULE: '/schedule',
  CONSULT: '/consult',
  PAYMENT: '/payment',
  ADMIN: '/admin',
};

export const LEO_TITLE = {
  kor: '레오의 서재',
  eng: "Leo's Library",
};

export const mapNumberToDay = (number: number) => {
  switch (number) {
    case 0:
      return '일';
    case 1:
      return '월';
    case 2:
      return '화';
    case 3:
      return '수';
    case 4:
      return '목';
    case 5:
      return '금';
    case 6:
      return '토';
  }
};
