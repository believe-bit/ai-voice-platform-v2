// src/api/index.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

export const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || 'student';
    console.log('【拦截器】URL:', config.url, 'token:', token, 'role:', userRole);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn('No token found in localStorage');
    }
    config.headers['X-User-Role'] = userRole;
    return config;
}, error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(response => {
    return response;
}, error => {
    console.error('API error:', error.response || error);
    if (error.response?.status === 401) {
        ElMessage.error('未授权，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        // 可选：重定向到登录页面
        window.location.href = '/login';
    } else if (error.response?.status === 403) {
        ElMessage.error('无权限执行此操作');
    }
    return Promise.reject(error);
});

// 实验项目
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const saveGuideAPI = (data) => api.post('/guides', data);
export const getStudentIPs = () => api.get('/student_ips');
export const distributeProject = (id, data) => api.post(`/projects/${id}/distribute`, data);

// VITS 数据集上传和训练
export const uploadVitsDataset = (formData) => {
    return api.post('/upload_vits_dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
    });
};
export const confirmVitsParams = (params) => api.post('/confirm_vits_params', params);
export const trainVitsModel = (data) => api.post('/train_vits', data);

// 其他功能
export const getModels = () => api.get('/models');
export const stopTraining = () => api.post('/stop');
export const uploadAudio = (formData) => {
    return api.post('/upload_audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const recognizeAudio = (data) => api.post('/recognize', data);
export const asrFtGetModels = () => api.get('/models');
export const asrFtUploadDataset = (formData) => {
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
    });
};
export const asrFtStartTrain = (data) => api.post('/asr_train', data);
export const asrFtStopTrain = () => api.post('/asr_stop');
export const asrFtGetTrainLog = () => new EventSource(`${API_BASE_URL}/api/asr_train_logs`);
export const offlineGetAsrModels = () => api.get('/offline_models');
export const offlineUploadAudio = (formData) => {
    return api.post('/offline_upload_audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const offlineRecognizeAudio = (data) => api.post('/offline_recognize', data);
export const synthesizeSpeech = (formData) => {
    return api.post('/synthesize_speech', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
    });
};
export const getCustomLanguages = () => api.get('/custom_languages');
export const saveCustomLanguage = (data) => api.post('/save_language', data);

export default api;

// 用户身份
export const getUser = () => api.get('/user');