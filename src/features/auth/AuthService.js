import api from '../../services/api';

export const loginAPI = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data; // Assumes backend returns { token, user: {...} } or similar
};

export const registerAPI = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};
