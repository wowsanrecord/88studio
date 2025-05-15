import axios from 'axios';

// API 기본 URL 설정
const baseURL = 'https://api-three-drab-49.vercel.app/api';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 추가
instance.interceptors.request.use(
  (config) => {
    // 기본 헤더 설정
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json'
    };

    // CORS 관련 설정 제거 (서버 측에서 처리)
    config.withCredentials = false;

    return config;
  },
  (error) => {
    // 요청 오류가 있는 작업 수행
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
instance.interceptors.response.use(
  (response) => {
    // 2xx 범위에 있는 상태 코드는 이 함수를 트리거
    return response;
  },
  (error) => {
    // 2xx 외의 범위에 있는 상태 코드는 이 함수를 트리거
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance; 