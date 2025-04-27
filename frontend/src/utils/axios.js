import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check for login and register routes
    if (config.url === '/auth/login' || config.url === '/auth/register') {
      return config;
    }

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.error('No user info found in localStorage');
      return config;
    }

    try {
      const parsedUserInfo = JSON.parse(userInfo);
      const token = parsedUserInfo.token || parsedUserInfo.data?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error('No token found in user info');
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance; 