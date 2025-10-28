// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import SpeechRecognition from '../views/SpeechRecognition.vue';
import OfflineAudioRecognition from '../views/OfflineAudioRecognition.vue';
import ASRFinetune from '../views/ASRFinetune.vue';
import SpeechSynthesis from '../views/SpeechSynthesis.vue';
import VITSTrain from '../views/VITSTrain.vue';
import ExperimentProjects from '../views/ExperimentProjects.vue';
import SystemManagement from '../views/SystemManagement.vue';

const routes = [
    { path: '/login', component: Login },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/speech-recognition', component: SpeechRecognition, meta: { requiresAuth: true } },
    { path: '/offline-audio-recognition', component: OfflineAudioRecognition, meta: { requiresAuth: true } },
    { path: '/asr-finetune', component: ASRFinetune, meta: { requiresAuth: true } },
    { path: '/speech-synthesis', component: SpeechSynthesis, meta: { requiresAuth: true } },
    { path: '/vits-train', component: VITSTrain, meta: { requiresAuth: true } },
    { path: '/experiment-projects', component: ExperimentProjects, meta: { requiresAuth: true } },
    { path: '/system-management', component: SystemManagement, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// src/router/index.js
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // 未登录，且当前不是登录页 → 跳登录
    if (to.path !== '/login') {
      next('/login');
    } else {
      next(); // 已经在登录页，放行
    }
  } else {
    // 已登录，且访问登录页 → 跳首页
    if (to.path === '/login') {
      next('/');
    } else {
      next(); // 放行
    }
  }
});

export default router;