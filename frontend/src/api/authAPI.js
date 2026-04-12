import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post('/auth/register', userData);
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await axiosInstance.get('/auth/me');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await axiosInstance.put('/auth/me', profileData);
  return data;
};
export const sendOTP = async (email) => {
  const { data } = await axiosInstance.post('/auth/otp/send', { email });
  return data;
};

export const verifyOTP = async (email, otp) => {
  const { data } = await axiosInstance.post('/auth/otp/verify', { email, otp });
  return data;
};
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await axiosInstance.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};