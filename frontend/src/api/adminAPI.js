import axiosInstance from './axiosInstance';

export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/admin/stats');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
};

export const blockUser = async (userId, reason) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/block`, { reason });
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/unblock`);
  return response.data;
};

export const verifyUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/verify`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAllTransactions = async (params = {}) => {
  const response = await axiosInstance.get('/admin/transactions', { params });
  return response.data;
};

export const getTransactionById = async (transactionId) => {
  const response = await axiosInstance.get(`/admin/transactions/${transactionId}`);
  return response.data;
};

export const updateTransactionStatus = async (transactionId, status, notes) => {
  const response = await axiosInstance.patch(`/admin/transactions/${transactionId}`, { status, notes });
  return response.data;
};

export const getAllReports = async (params = {}) => {
  const response = await axiosInstance.get('/admin/reports', { params });
  return response.data;
};

export const getReportById = async (reportId) => {
  const response = await axiosInstance.get(`/admin/reports/${reportId}`);
  return response.data;
};

export const resolveReport = async (reportId, action, adminNotes) => {
  const response = await axiosInstance.patch(`/admin/reports/${reportId}/resolve`, { action, adminNotes });
  return response.data;
};

export const deleteReport = async (reportId) => {
  const response = await axiosInstance.delete(`/admin/reports/${reportId}`);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/admin/reviews/${reviewId}`);
  return response.data;
};

export const getAllJobs = async (params = {}) => {
  const response = await axiosInstance.get('/admin/jobs', { params });
  return response.data;
};

export const deleteJob = async (jobId) => {
  const response = await axiosInstance.delete(`/admin/jobs/${jobId}`);
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await axiosInstance.get('/admin/audit-logs', { params });
  return response.data;
};
