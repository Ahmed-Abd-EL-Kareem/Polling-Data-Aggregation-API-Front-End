import api from '../../services/api';

export const getPolls = async (params) => {
  const { data } = await api.get('/api/v1/polls', { params });
  return data;
};

export const getPollDetails = async (id) => {
  const { data } = await api.get(`/api/v1/polls/${id}`);
  return data;
};

export const getPollsByUser = async (userId, params) => {
  const { data } = await api.get(`/api/v1/polls/user/${userId}`, { params });
  return data;
};

export const getPollOptions = async (id) => {
  const { data } = await api.get(`/api/v1/options/${id}`);
  return data;
};

export const createPoll = async (pollData) => {
  const { data } = await api.post('/api/v1/polls', pollData);
  return data;
};

export const createOption = async (optionData) => {
  const { data } = await api.post('/api/v1/options', optionData);
  return data;
};

export const deletePoll = async (id) => {
  const { data } = await api.delete(`/api/v1/polls/${id}`);
  return data;
};

export const updatePoll = async (id, pollData) => {
  const { data } = await api.patch(`/api/v1/polls/${id}`, pollData);
  return data;
};

export const voteOption = async ({ pollId, optionId }) => {
  const { data } = await api.post('/api/v1/votes', { pollId, optionId });
  return data;
};

export const getResults = async (pollId) => {
  const { data } = await api.get(`/api/v1/results/${pollId}`);
  return data;
};

export const getAdminGlobalStats = async () => {
  const { data } = await api.get('/api/v1/results/analysis');
  return data;
};
