<!-- views/VITSTrain.vue -->
<template>
  <div class="vits-train">
    <h2>VITS 模型训练（数据集上传与参数配置）</h2>

    <el-form label-width="140px" class="form-container">
      <el-form-item label="上传数据集（.zip）">
        <el-upload
          :http-request="customUpload"
          :show-file-list="false"
          :on-error="handleError"
          :before-upload="beforeUpload"
          accept=".zip"
        >
          <el-button type="primary" :loading="isUploading">上传 ZIP 数据集</el-button>
        </el-upload>
        <div v-if="datasetInfo" class="dataset-info">
          <p>上传: {{ datasetInfo.dataset_dir }}</p>
          <p>训练文件: {{ datasetInfo.train_file }}</p>
          <p>验证文件: {{ datasetInfo.val_file }}</p>
          <p>符号文件: {{ datasetInfo.symbols_file }}</p>
        </div>
      </el-form-item>

      <el-form-item label="训练轮数 (epochs)">
        <el-input-number v-model="trainParams.epochs" :min="1" :max="10000" />
      </el-form-item>
      <el-form-item label="学习率 (learning_rate)">
        <el-input-number v-model="trainParams.learning_rate" :min="0.00001" :max="0.1" :step="0.00001" :precision="5" />
      </el-form-item>
      <el-form-item label="批大小 (batch_size)">
        <el-input-number v-model="trainParams.batch_size" :min="1" :max="128" />
      </el-form-item>
      <el-form-item label="日志间隔 (log_interval)">
        <el-input-number v-model="trainParams.log_interval" :min="1" :max="1000" />
      </el-form-item>
      <el-form-item label="评估间隔 (eval_interval)">
        <el-input-number v-model="trainParams.eval_interval" :min="1" :max="10000" />
      </el-form-item>
      <el-form-item label="使用 FP16">
        <el-switch v-model="trainParams.fp16_run" />
      </el-form-item>
      <el-form-item label="拼音类型">
        <el-input v-model="trainParams.text_cleaners" placeholder="例如：yueyu" />
      </el-form-item>
      <el-form-item label="说话人数量 (n_speakers)">
        <el-input-number v-model="trainParams.n_speakers" :min="1" :max="100" @change="updateSpeakerFields" />
      </el-form-item>
      <el-form-item v-for="(speaker, index) in speakers" :key="index" :label="'说话人 ' + index + ' 名称'">
        <el-input v-model="speakers[index]" placeholder="例如：speaker0" />
      </el-form-item>
      <el-form-item label="GIN 通道数 (gin_channels)">
        <el-select v-model="trainParams.gin_channels">
          <el-option label="0" :value="0" />
          <el-option label="256" :value="256" />
          <el-option label="512" :value="512" />
        </el-select>
      </el-form-item>
      <el-form-item label="模型保存路径">
        <el-input v-model="trainParams.model_save_path" placeholder="例如：./OUTPUT_MODEL_V7" />
      </el-form-item>
      <el-form-item label="模型保存个数">
        <el-input-number v-model="trainParams.preserved" :min="0" :max="10" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :disabled="!datasetUploaded" @click="confirmParams">确认参数</el-button>
        <el-button type="success" :disabled="!paramsConfirmed || isTraining" @click="startTraining">开始训练</el-button>
        <el-button type="danger" :disabled="!isTraining" @click="stopTraining">停止训练</el-button>
      </el-form-item>
    </el-form>

    <!-- 日志输出框 -->
    <div class="log-container">
      <div class="card-header">
        <h3>训练日志</h3>
        <el-button type="info" size="small" @click="clearLogs">清空日志</el-button>
      </div>
      <div class="log-content">
        <pre v-for="(log, index) in logs" :key="index">{{ log }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadVitsDataset, confirmVitsParams, trainVitsModel, stopTraining as stopTrainingApi } from '../api/index';

const isUploading = ref(false);
const datasetUploaded = ref(false);
const paramsConfirmed = ref(false);
const isTraining = ref(false);
const datasetInfo = ref(null);
const configPath = ref('');
const eventSource = ref(null);
const logs = ref([]);

const trainParams = ref({
  epochs: 100,
  learning_rate: 0.0002,
  batch_size: 16,
  log_interval: 100,
  eval_interval: 500,
  fp16_run: true,
  text_cleaners: 'yueyu',
  n_speakers: 3,
  gin_channels: 256,
  model_save_path: './OUTPUT_MODEL_V7',
  preserved: 2,
});

const speakers = ref(['speaker0', 'speaker1', 'speaker2']);

const handleError = (error) => {
  console.error(error);
  ElMessage.error(error.message || '操作失败');
};

const beforeUpload = (file) => {
  const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
  if (!isZip) {
    ElMessage.error('请上传 ZIP 文件');
    return false;
  }
  return true;
};

const customUpload = async (options) => {
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    const res = await uploadVitsDataset(formData);
    if (res && res.data && !res.data.error) {
      datasetInfo.value = res.data;
      datasetUploaded.value = true;
      ElMessage.success('数据集上传成功');
    } else {
      ElMessage.error(res.data.error || '上传失败');
    }
  } catch (e) {
    handleError(e);
  } finally {
    isUploading.value = false;
  }
};

const updateSpeakerFields = (value) => {
  speakers.value = Array(value).fill('').map((_, i) => speakers.value[i] || `speaker${i}`);
};

const confirmParams = async () => {
  if (!datasetInfo.value) {
    ElMessage.error('请先上传数据集');
    return;
  }
  try {
    const params = {
      train: {
        epochs: trainParams.value.epochs,
        learning_rate: trainParams.value.learning_rate,
        batch_size: trainParams.value.batch_size,
        log_interval: trainParams.value.log_interval,
        eval_interval: trainParams.value.eval_interval,
        fp16_run: trainParams.value.fp16_run,
      },
      data: {
        training_files: datasetInfo.value.train_file,
        validation_files: datasetInfo.value.val_file,
        text_cleaners: [trainParams.value.text_cleaners + '_cleaners'],
        n_speakers: trainParams.value.n_speakers,
      },
      model: {
        gin_channels: trainParams.value.gin_channels,
        speakers: speakers.value.reduce((acc, s, i) => ({ ...acc, [s]: i }), {}),
      },
      preserved: trainParams.value.preserved,
      symbols_file: datasetInfo.value.symbols_file,
    };
    const res = await confirmVitsParams(params);
    if (res && res.data && !res.data.error) {
      paramsConfirmed.value = true;
      configPath.value = res.data.config_path;
      logs.value = [];
      closeEventSource();
      ElMessage.success('参数确认成功，cleaners.py 已更新');
    } else {
      ElMessage.error(res.data.error || '参数确认失败');
    }
  } catch (e) {
    handleError(e);
  }
};

const startTraining = async () => {
  if (!configPath.value) {
    ElMessage.error('请先确认参数');
    return;
  }
  try {
    const res = await trainVitsModel({
      model_save_path: trainParams.value.model_save_path,
      config_path: configPath.value,
      preserved: trainParams.value.preserved,
    });
    if (res && res.data && !res.data.error) {
      isTraining.value = true;
      ElMessage.success('训练已开始');
      startEventSource();
    } else {
      ElMessage.error(res.data.error || '训练启动失败');
    }
  } catch (e) {
    handleError(e);
  }
};

const stopTraining = async () => {
  try {
    const res = await stopTrainingApi();
    if (res && res.data && !res.data.error) {
      isTraining.value = false;
      closeEventSource();
      ElMessage.success('训练已停止');
      logs.value.push('训练已停止');
    } else {
      ElMessage.error(res.data.error || '停止训练失败');
    }
  } catch (e) {
    handleError(e);
  }
};

const startEventSource = () => {
  closeEventSource();
  eventSource.value = new EventSource('http://localhost:5000/api/train');
  eventSource.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.message) {
        logs.value.push(data.message);
        const logContainer = document.querySelector('.log-content');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
        if (data.message.includes('训练完成') || data.message.includes('训练已停止')) {
          isTraining.value = false;
          closeEventSource();
        }
      }
    } catch (e) {
      console.error('解析日志失败:', e);
      logs.value.push(`解析日志失败: ${e.message}`);
    }
  };
  eventSource.value.onerror = (error) => {
    console.error('EventSource 错误:', error);
    logs.value.push(`日志连接断开: ${JSON.stringify(error)}`);
    isTraining.value = false;
    closeEventSource();
    ElMessage.error('日志连接断开');
  };
};

const closeEventSource = () => {
  if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
  }
};

const clearLogs = () => {
  logs.value = [];
};

onUnmounted(() => {
  closeEventSource();
});
</script>

<style scoped>
.vits-train {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}
.form-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}
.dataset-info {
  margin-top: 12px;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
}
.log-container {
  margin-top: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.log-content {
  max-height: 250px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 14px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}
.log-content pre {
  margin: 0;
  padding: 2px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-header h3 {
  margin: 0;
  font-size: 18px;
}
</style>