import axiosInstance from './axiosInstance';

export const getWorkerProfile = async () => {
  const { data } = await axiosInstance.get('/workers/profile');
  return data;
};

export const updateWorkerProfile = async (payload) => {
  const { data } = await axiosInstance.put('/workers/profile', payload);
  return data;
};
