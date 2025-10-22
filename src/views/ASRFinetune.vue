<template>
  <div class="asr-finetune">
    <h1>ASR 模型微调</h1>
    <el-form :model="form" label-width="150px" class="form-container">
      <!-- 模型选择 -->
      <el-form-item label="选择模型">
        <el-select v-model="form.model_name" placeholder="请选择模型" @change="onModelChange">
          <el-option
            v-for="model in models"
            :key="model"
            :label="model"
            :value="model"
          />
        </el-select>
      </el-form-item>

      <!-- 数据集上传 -->
      <el-form-item label="上传数据集">
        <el-upload
          :http-request="handleUploadRequest"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          accept=".zip"
          :show-file-list="false"
          :limit="1"
          :multiple="false"
          :before-upload="beforeUpload"
        >
          <el-button type="primary" :loading="isUploading">上传 .zip 文件</el-button>
        </el-upload>
        <span v-if="form.dataset_path" class="upload-success">
          已上传：{{ form.dataset_path }}
        </span>
      </el-form-item>

      <!-- 训练参数 -->
      <el-form-item label="每设备批次大小">
        <el-input-number v-model="form.training_params.per_device_train_batch_size" :min="1" :max="32" />
      </el-form-item>
      <el-form-item label="梯度累积步数">
        <el-input-number v-model="form.training_params.gradient_accumulation_steps" :min="1" :max="16" />
      </el-form-item>
      <el-form-item label="训练轮数">
        <el-input-number v-model="form.training_params.num_train_epochs" :min="1" :max="100" />
      </el-form-item>
      <el-form-item label="学习率">
        <el-input-number v-model="form.training_params.learning_rate" :min="1e-6" :max="1e-3" :step="1e-6" :precision="6" />
      </el-form-item>
      <el-form-item label="保存步数">
        <el-input-number v-model="form.training_params.save_steps" :min="100" :max="10000" :step="100" />
      </el-form-item>
      <el-form-item label="日志步数">
        <el-input-number v-model="form.training_params.logging_steps" :min="10" :max="1000" :step="10" />
      </el-form-item>
      <el-form-item label="保存模型数量限制">
        <el-input-number v-model="form.training_params.save_total_limit" :min="1" :max="10" />
      </el-form-item>
      <el-form-item label="启用 FP16">
        <el-switch v-model="form.training_params.fp16" />
      </el-form-item>

      <!-- 训练和停止按钮 -->
      <el-form-item>
        <el-button type="primary" :disabled="!form.model_name || !form.dataset_path || isTraining" @click="startTraining">
          {{ isTraining ? '训练中...' : '开始训练' }}
        </el-button>
        <el-button type="danger" v-if="isTraining" @click="stopTraining">停止训练</el-button>
      </el-form-item>
    </el-form>

    <!-- 训练日志 -->
    <div class="log-container" v-if="logs.length">
      <h2>训练日志</h2>
      <el-input
        type="textarea"
        :rows="10"
        v-model="logDisplay"
        readonly
        placeholder="训练日志将显示在这里"
      />
    </div>

    <!-- 下载训练结果 -->
    <div class="download-container" v-if="outputDir">
      <h2>训练结果</h2>
      <el-button type="success" @click="downloadOutput">下载模型</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  asrFtGetModels,
  asrFtUploadDataset,
  asrFtStartTrain,
  asrFtStopTrain,
  asrFtGetTrainLog
} from '@/api';

// 状态管理
const models = ref([]);
const form = reactive({
  model_name: '',
  dataset_path: '',
  training_params: {
    per_device_train_batch_size: 8,
    gradient_accumulation_steps: 4,
    num_train_epochs: 30,
    learning_rate: 1e-5,
    save_steps: 500,
    logging_steps: 100,
    save_total_limit: 2,
    fp16: true,
  },
});
const logs = ref([]);
const isTraining = ref(false);
const isUploading = ref(false);
const outputDir = ref('');
let eventSource = null;

// 计算属性：格式化日志显示
const logDisplay = computed(() => logs.value.join('\n'));

// 获取模型列表
const fetchModels = async () => {
  try {
    const response = await asrFtGetModels();
    console.log('Response from /api/models:', response);
    models.value = response.data.models || [];
    if (models.value.length === 0) {
      ElMessage.warning('没有可用的模型，请检查后端模型目录');
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    ElMessage.error('获取模型列表失败：' + error.message);
  }
};

// 模型选择变化
const onModelChange = (value) => {
  form.model_name = value;
};

// 文件上传前检查
const beforeUpload = () => {
  if (isUploading.value) {
    ElMessage.warning('正在上传，请稍候');
    return false;
  }
  isUploading.value = true;
  return true;
};

// 文件上传
const handleUploadRequest = async (options) => {
  const formData = new FormData();
  formData.append('file', options.file);
  try {
    const response = await asrFtUploadDataset(formData);
    console.log('Upload response:', response);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    options.onError(error);
  } finally {
    isUploading.value = false;
  }
};

// 文件上传成功
const handleUploadSuccess = (response) => {
  console.log('handleUploadSuccess response:', response);
  isUploading.value = false;
  if (!response) {
    ElMessage.error('上传失败：响应为空');
    return;
  }
  if (response.dataset_path) {
    form.dataset_path = response.dataset_path;
    ElMessage.success('数据集上传成功');
  } else if (response.error) {
    ElMessage.error('上传失败：' + response.error);
  } else {
    ElMessage.error('上传失败：未知错误');
  }
};

// 文件上传失败
const handleUploadError = (error) => {
  console.error('handleUploadError:', error);
  isUploading.value = false;
  ElMessage.error('上传失败：' + error.message);
};

// 开始训练
const startTraining = async () => {
  if (!form.model_name || !form.dataset_path) {
    ElMessage.error('请先选择模型并上传数据集');
    return;
  }
  isTraining.value = true;
  logs.value = []; // 清空前端日志
  outputDir.value = '';

  try {
    // 关闭现有 EventSource
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }

    eventSource = asrFtGetTrainLog();
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        logs.value.push(data.message);
        if (data.message.includes('训练完成') || data.message.includes('训练失败') || data.message.includes('训练已停止')) {
          eventSource.close();
          eventSource = null;
          isTraining.value = false;
          if (data.message.includes('训练完成')) {
            const match = data.message.match(/Training completed, model saved to (.+)/);
            if (match) {
              outputDir.value = match[1];
            }
            ElMessage.success('训练完成');
          } else if (data.message.includes('训练已停止')) {
            ElMessage.warning('训练已停止');
          } else {
            ElMessage.error('训练失败');
          }
        }
      } catch (e) {
        console.error('解析日志失败:', e);
        logs.value.push(`解析日志失败: ${e.message}`);
      }
    };
    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      isTraining.value = false;
      ElMessage.error('训练连接中断');
    };

    await asrFtStartTrain({
      model_name: form.model_name,
      dataset_path: form.dataset_path,
      training_params: form.training_params,
    });
  } catch (error) {
    isTraining.value = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    ElMessage.error('训练启动失败：' + error.message);
  }
};

// 停止训练
const stopTraining = async () => {
  try {
    const response = await asrFtStopTrain();
    ElMessage.success(response.data.message);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isTraining.value = false;
  } catch (error) {
    ElMessage.error('停止训练失败：' + error.message);
  }
};

// 下载训练结果
const downloadOutput = () => {
  if (outputDir.value) {
    window.location.href = `/api/outputs/${outputDir.value.split('/').pop()}/pytorch_model.bin`;
  }
};

// 生命周期钩子
onMounted(() => {
  fetchModels();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  isTraining.value = false;
  isUploading.value = false;
});
</script>

<style scoped>
.asr-finetune {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.form-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}
.upload-success {
  margin-left: 10px;
  color: #67c23a;
}
.log-container {
  margin-top: 20px;
}
.download-container {
  margin-top: 20px;
}
</style>