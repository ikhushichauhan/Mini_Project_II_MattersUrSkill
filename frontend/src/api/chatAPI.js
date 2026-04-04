import axiosInstance from './axiosInstance';

export const sendChatMessage = async (messages) => {
  const response = await axiosInstance.post('/api/chat', {
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return response.data.message;
};

export const getChatMessages = async (taskId) => {
  const { data } = await axiosInstance.get(`/api/chat/messages/${taskId}`);
  return data;
};

export const markMessagesRead = async (taskId) => {
  const { data } = await axiosInstance.put(`/api/chat/messages/${taskId}/read`);
  return data;
};
