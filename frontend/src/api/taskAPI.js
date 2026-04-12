import axiosInstance from './axiosInstance';

export const getOpenTasks = async (filters = {}) => {
  const { data } = await axiosInstance.get('/tasks', { params: filters });
  return data;
};

export const getRelevantAndAllJobs = async () => {
  const { data } = await axiosInstance.get('/tasks/relevant-and-all');
  return data;
};

export const getTaskById = async (taskId) => {
  const { data } = await axiosInstance.get(`/tasks/${taskId}`);
  return data;
};

export const createTask = async (taskData) => {
  const { data } = await axiosInstance.post('/tasks', taskData);
  return data;
};

export const updateTask = async (taskId, updates) => {
  const { data } = await axiosInstance.put(`/tasks/${taskId}`, updates);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await axiosInstance.delete(`/tasks/${taskId}`);
  return data;
};

export const getMyPostedTasks = async (filters = {}) => {
  const { data } = await axiosInstance.get('/tasks/my-posted', { params: filters });
  return data;
};

export const handleApplication = async (taskId, applicationId, decision) => {
  const { data } = await axiosInstance.put(
    `/tasks/${taskId}/applications/${applicationId}`,
    { decision }
  );
  return data;
};

export const applyForTask = async (taskId, payload) => {
  const { data } = await axiosInstance.post(`/tasks/${taskId}/apply`, payload);
  return data;
};

export const getMyApplications = async (filters = {}) => {
  const { data } = await axiosInstance.get('/tasks/my-applications', { params: filters });
  return data;
};

export const getMyAssignedTasks = async (filters = {}) => {
  const { data } = await axiosInstance.get('/tasks/my-assigned', { params: filters });
  return data;
};

export const markTaskCompleted = async (taskId, rating) => {
  const { data } = await axiosInstance.put(`/tasks/${taskId}/complete`, { rating });
  return data;
};

export const withdrawApplication = async (taskId) => {
  const { data } = await axiosInstance.delete(`/tasks/${taskId}/withdraw`);
  return data;
};
