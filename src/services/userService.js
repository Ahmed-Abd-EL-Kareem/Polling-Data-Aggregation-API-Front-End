import api from './api';

export async function fetchUserById(id) {
  const { data } = await api.get(`/api/v1/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.patch(`/api/v1/users/${id}`, payload);
  return data;
}
