import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../app/store';

const baseURL = import.meta.env.VITE_API_URL || 'https://iti-node-js-polling-data-aggregatio.vercel.app';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    if (!error.response && error.code === 'ERR_NETWORK') {
      toast.error('Network error — check that the API is running.');
    } else if (status >= 500) {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

export default api;
export { baseURL };
