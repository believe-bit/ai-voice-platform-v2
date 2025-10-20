import { createRouter, createWebHistory } from 'vue-router';

// 首页
const Home = () => import('../views/Home.vue');
// 语音识别
const SpeechRecognition = () => import('../views/SpeechRecognition.vue');
// 离线音频文件识别
const OfflineAudioRecognition = () => import('../views/OfflineAudioRecognition.vue');
// ASR模型微调
const ASRFinetune = () => import('../views/ASRFinetune.vue');
// 语音合成
const SpeechSynthesis = () => import('../views/SpeechSynthesis.vue');
// 语音克隆
const VoiceClone = () => import('../views/VoiceClone.vue');
// VITS模型训练
const VITSTrain = () => import('../views/VITSTrain.vue');
// 模型管理
const ModelManagement = () => import('../views/ModelManagement.vue');
// 实验项目
const ExperimentProjects = () => import('../views/ExperimentProjects.vue');
// 系统管理
const SystemManagement = () => import('../views/SystemManagement.vue');

const routes = [
  { path: '/', component: Home },
  { path: '/speech-recognition', component: SpeechRecognition },
  { path: '/offline-audio-recognition', component: OfflineAudioRecognition },
  { path: '/asr-finetune', component: ASRFinetune },
  { path: '/speech-synthesis', component: SpeechSynthesis },
  { path: '/voice-clone', component: VoiceClone },
  { path: '/vits-train', component: VITSTrain },
  { path: '/model-management', component: ModelManagement },
  { path: '/experiment-projects', component: ExperimentProjects },
  { path: '/system-management', component: SystemManagement }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;