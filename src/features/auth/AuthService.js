import api from '../../services/api';

export const loginAPI = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data; // Assumes backend returns { token, user: {...} } or similar
};

export const registerAPI = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const forgotPasswordAPI = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordAPI = async ({ token, password }) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};
