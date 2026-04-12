import axiosInstance from './axiosInstance';

export const getNotifications = async () => {
  const { data } = await axiosInstance.get('/notifications');
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await axiosInstance.put('/notifications/mark-all-read');
  return data;
};

export const cleanupReadNotifications = async () => {
  const { data } = await axiosInstance.delete('/notifications/cleanup-read');
  return data;
};
