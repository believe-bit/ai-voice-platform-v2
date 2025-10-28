// src/main.js
// 屏蔽 ResizeObserver 警告
window.addEventListener('error', e =>
  e.message.includes('ResizeObserver') && e.preventDefault()
)

import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import axios from 'axios';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 配置 axios 拦截器
axios.interceptors.request.use(
    (config) => {
        console.log('Request URL:', config.url);
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole') || 'student';
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        config.headers['X-User-Role'] = userRole;
        return config;
    },
    (error) => {
        console.error('Interceptor error:', error);
        return Promise.reject(error);
    }
);

const app = createApp(App);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 初始化检查：模拟服务重启清除 localStorage（调试用）
// localStorage.clear(); // 打开注释以测试强制重新登录

app.use(ElementPlus);
app.use(router);
app.mount('#app');