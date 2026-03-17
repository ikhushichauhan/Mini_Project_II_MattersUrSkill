import axiosInstance from './axiosInstance';

export const sendChatMessage = async (messages) => {
  const response = await axiosInstance.post('/api/chat', {
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return response.data.message;
};