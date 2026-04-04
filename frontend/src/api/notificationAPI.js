import axiosInstance from './axiosInstance';

export const getNotifications = async () => {
  const { data } = await axiosInstance.get('/api/notifications');
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await axiosInstance.put('/api/notifications/mark-all-read');
  return data;
};

export const cleanupReadNotifications = async () => {
  const { data } = await axiosInstance.delete('/api/notifications/cleanup-read');
  return data;
};
