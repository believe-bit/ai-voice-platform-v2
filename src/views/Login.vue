<!-- src/views/Login.vue -->
<template>
    <div class="login-container">
        <h2>AI智能语音实训平台 - 登录</h2>
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="100px" class="login-form">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitLogin">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const loginFormRef = ref(null);
const loginForm = ref({
    username: '',
    password: ''
});

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://192.168.1.124:5000';

const submitLogin = async () => {
    try {
        await loginFormRef.value.validate();
        const response = await axios.post(`${API_BASE_URL}/api/login`, loginForm.value);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        ElMessage.success('登录成功');
        router.push('/');
    } catch (error) {
        ElMessage.error(error.response?.data?.error || '登录失败');
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f2f5;
}
.login-form {
    width: 400px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
h2 {
    text-align: center;
    margin-bottom: 20px;
}
</style>