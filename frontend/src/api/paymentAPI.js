import axiosInstance from './axiosInstance';

export const createPaymentOrder = async (jobId) => {
  const response = await axiosInstance.post('/payments/create-order', { jobId });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post('/payments/verify', paymentData);
  return response.data;
};

export const markJobCompleted = async (jobId) => {
  const response = await axiosInstance.post('/payments/mark-completed', { jobId });
  return response.data;
};

export const releasePayment = async (paymentId) => {
  const response = await axiosInstance.post('/payments/release', { paymentId });
  return response.data;
};

export const getPaymentsByJob = async (jobId) => {
  const response = await axiosInstance.get(`/payments/job/${jobId}`);
  return response.data;
};
