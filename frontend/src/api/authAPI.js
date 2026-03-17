import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post('/api/auth/register', userData);
  return data; // { success, data: { _id, name, email, role, token, ... } }
};

export const loginUser = async (email, password) => {
  const { data } = await axiosInstance.post('/api/auth/login', { email, password });
  return data; // { success, data: { _id, name, email, role, token, ... } }
};

export const getMe = async () => {
  const { data } = await axiosInstance.get('/api/auth/me');
  return data; // { success, data: { ...user } }
};

export const updateProfile = async (profileData) => {
  const { data } = await axiosInstance.put('/api/auth/me', profileData);
  return data;
};
export const sendOTP = async (email) => {
  const { data } = await axiosInstance.post('/api/auth/otp/send', { email });
  return data; // { success, message }
};

export const verifyOTP = async (email, otp) => {
  const { data } = await axiosInstance.post('/api/auth/otp/verify', { email, otp });
  return data; // { success, data: { ...user, token } }
};
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await axiosInstance.put('/api/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};