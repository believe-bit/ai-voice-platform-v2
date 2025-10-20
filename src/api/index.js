import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // 后端 URL

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ASR 微调相关 API
export const getModels = () => api.get('/api/models');
export const uploadDataset = (formData) => api.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const startAsrTrain = (data) => api.post('/api/train', data);
export const stopAsrTrain = () => api.post('/api/stop');
// 使用 EventSource 处理训练日志流
export const getAsrTrainLog = () => {
  return new EventSource(`${API_BASE_URL}/api/train`);
};

export default api;

// 获取离线识别模型列表
export const getAsrModels = () => api.get('/api/asr_models');

// 上传音频文件
export const uploadAudio = (formData) => api.post('/api/upload_audio', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// 离线识别
export const recognizeAudio = (data) => api.post('/api/recognize', data);

// 上传 VITS 数据集
export const uploadVitsDataset = (formData) => api.post('/api/upload_vits_dataset', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 0, // 0 表示不超时
});