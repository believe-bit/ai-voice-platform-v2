import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

export const uploadVitsDataset = (formData) => {
  return api.post('/upload_vits_dataset', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const confirmVitsParams = (params) => {
  return api.post('/confirm_vits_params', params);
};

export const trainVitsModel = (data) => {
  return api.post('/train_vits', data);
};

export const getModels = () => {
  return api.get('/models');
};

export const stopTraining = () => {
  return api.post('/stop');
};

export const uploadAudio = (formData) => {
  return api.post('/upload_audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const recognizeAudio = (data) => {
  return api.post('/recognize', data);
};





/* ===== ASR 微调专用（追加，不影响原有） ===== */
/* ===== ASR 微调专用（追加，不影响原有） ===== */
export const asrFtGetModels = () => api.get('/models');

export const asrFtUploadDataset = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const asrFtStartTrain = (data) => api.post('/asr_train', data);

export const asrFtStopTrain = () => api.post('/asr_stop'); // 修改为新的 /api/asr_stop 端点

export const asrFtGetTrainLog = () =>
  new EventSource(`${API_BASE_URL}/api/asr_train_logs`);


