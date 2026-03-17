import axiosInstance from './axiosInstance';

export const getOpenTasks = async (filters = {}) => {
  const { data } = await axiosInstance.get('/api/tasks', { params: filters });
  return data; // { success, total, page, pages, data: [...tasks] }
};

export const getTaskById = async (taskId) => {
  const { data } = await axiosInstance.get(`/api/tasks/${taskId}`);
  return data; // { success, data: task }
};

export const createTask = async (taskData) => {
  const { data } = await axiosInstance.post('/api/tasks', taskData);
  return data; // { success, data: newTask }
};

export const updateTask = async (taskId, updates) => {
  const { data } = await axiosInstance.put(`/api/tasks/${taskId}`, updates);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return data;
};

export const getMyPostedTasks = async (filters = {}) => {
  const { data } = await axiosInstance.get('/api/tasks/my-posted', { params: filters });
  return data;
};

export const handleApplication = async (taskId, applicationId, decision) => {
  const { data } = await axiosInstance.put(
    `/api/tasks/${taskId}/applications/${applicationId}`,
    { decision }
  );
  return data;
};

export const applyForTask = async (taskId, message = '') => {
  const { data } = await axiosInstance.post(`/api/tasks/${taskId}/apply`, { message });
  return data;
};

export const getMyApplications = async (filters = {}) => {
  const { data } = await axiosInstance.get('/api/tasks/my-applications', { params: filters });
  return data;
};

export const markTaskCompleted = async (taskId, rating) => {
  const { data } = await axiosInstance.put(`/api/tasks/${taskId}/complete`, { rating });
  return data;
};