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
    timeout: 300000, // 修改：增加上传超时到300秒
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
export const asrFtGetModels = () => api.get('/models');

export const asrFtUploadDataset = (formData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 修改：增加上传超时到300秒
  });


export const asrFtStartTrain = (data) => api.post('/asr_train', data);

export const asrFtStopTrain = () => api.post('/asr_stop'); // 修改为新的 /api/asr_stop 端点

export const asrFtGetTrainLog = () =>
  new EventSource(`${API_BASE_URL}/api/asr_train_logs`);


/* ===== 离线音频识别专用（追加，不影响原有） ===== */
export const offlineGetAsrModels = () => api.get('/offline_models');

export const offlineUploadAudio = (formData) =>
  api.post('/offline_upload_audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const offlineRecognizeAudio = (data) => api.post('/offline_recognize', data);

/* ===== 语音合成专用（追加，不影响原有） ===== */

export const synthesizeSpeech = (formData) =>
  api.post('/synthesize_speech', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

export const getCustomLanguages = () => api.get('/custom_languages');

export const saveCustomLanguage = (data) => api.post('/save_language', data);
