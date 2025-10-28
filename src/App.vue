<!-- src/App.vue -->
<template>
    <div id="app">
        <el-container v-if="isLoggedIn" class="main-container">
            <el-header class="header">
                <h1>AI智能语音实训平台</h1>
                <el-button type="danger" @click="logout" style="position: absolute; right: 20px;">登出</el-button>
            </el-header>
            <el-container>
                <el-aside width="200px" class="sidebar">
                    <el-menu :default-active="activePath" router>
                        <el-menu-item index="/">
                            <el-icon><House /></el-icon>
                            <span>首页</span>
                        </el-menu-item>
                        <el-menu-item index="/speech-recognition">
                            <el-icon><Microphone /></el-icon>
                            <span>语音识别</span>
                        </el-menu-item>
                        <el-menu-item index="/offline-audio-recognition">
                            <el-icon><Document /></el-icon>
                            <span>离线音频文件识别</span>
                        </el-menu-item>
                        <el-menu-item index="/asr-finetune">
                            <el-icon><Setting /></el-icon>
                            <span>ASR模型微调</span>
                        </el-menu-item>
                        <el-menu-item index="/speech-synthesis">
                            <el-icon><Phone /></el-icon>
                            <span>语音合成</span>
                        </el-menu-item>
                        <el-menu-item index="/vits-train">
                            <el-icon><Platform /></el-icon>
                            <span>VITS模型训练</span>
                        </el-menu-item>
                        <el-menu-item index="/experiment-projects">
                            <el-icon><Notebook /></el-icon>
                            <span>实验项目</span>
                        </el-menu-item>
                        <el-menu-item index="/system-management">
                            <el-icon><Tools /></el-icon>
                            <span>系统管理</span>
                        </el-menu-item>
                    </el-menu>
                </el-aside>
                <el-main class="main-content">
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
        <router-view v-else></router-view>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Microphone, Document, Setting, Phone, Platform, Notebook, Tools } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const activePath = ref(route.path);

// 登录状态
const isLoggedIn = ref(!!localStorage.getItem('token'));

// 跨标签页同步登录状态
window.addEventListener('storage', () => {
  isLoggedIn.value = !!localStorage.getItem('token');
});

// 路由变化时同步状态
watch(route, () => {
  isLoggedIn.value = !!localStorage.getItem('token');
  activePath.value = route.path;
});

// 暴露给模板
defineExpose({ isLoggedIn });


const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    ElMessage.success('已登出');
    router.push('/login');
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}
.main-container {
    height: 100vh;
}
.header {
    background-color: #409EFF;
    color: white;
    text-align: center;
    line-height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 5px;
    position: relative;
}
.header h1 {
    margin: 0;
    font-size: 24px;
}
.sidebar {
    background-color: #f0f0f0;
    height: 100%;
}
.main-content {
    padding: 20px;
}
</style>