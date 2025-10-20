<template>
  <div class="offline-audio-recognition">
    <h2>离线音频文件识别</h2>
    <el-form label-width="120px" class="form-container">
      <el-form-item label="选择模型">
        <el-select v-model="selectedModel" placeholder="请选择模型">
          <el-option
            v-for="model in models"
            :key="model"
            :label="model"
            :value="model"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="上传音频">
        <el-upload
          :http-request="customUpload"
          :show-file-list="false"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          accept=".wav"
        >
          <el-button type="primary" :loading="isUploading">上传音频文件</el-button>
        </el-upload>
        <span v-if="audioPath" class="upload-success">已上传：{{ audioFileName }}</span>
      </el-form-item>
      <el-form-item>
        <el-button
          type="success"
          :disabled="!selectedModel || !audioPath || isRecognizing"
          @click="recognize"
        >
          {{ isRecognizing ? '识别中...' : '开始识别' }}
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="transcription" class="result-container">
      <h3>识别结果</h3>
      <el-input
        type="textarea"
        :rows="4"
        v-model="transcription"
        readonly
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getAsrModels, uploadAudio, recognizeAudio } from '../api';

const models = ref([]);
const selectedModel = ref('');
const audioPath = ref('');
const audioFileName = ref('');
const transcription = ref('');
const isUploading = ref(false);
const isRecognizing = ref(false);

// 获取模型列表
const fetchModels = async () => {
  try {
    const res = await getAsrModels();
    models.value = res.data.models || [];
    if (models.value.length === 0) {
      ElMessage.warning('没有可用的模型');
    }
  } catch (e) {
    ElMessage.error('获取模型列表失败');
  }
};

// 自定义音频上传
const customUpload = async (options) => {
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    const res = await uploadAudio(formData);
    handleUploadSuccess(res.data, options.file);
    // 不再调用 options.onSuccess(res.data);
  } catch (e) {
    handleUploadError(e);
    // 不再调用 options.onError(e);
  } finally {
    isUploading.value = false;
  }
};

// 上传前校验
const beforeUpload = () => {
  if (isUploading.value) {
    ElMessage.warning('正在上传，请稍候');
    return false;
  }
  isUploading.value = true;
  return true;
};

// 上传成功
const handleUploadSuccess = (response, file) => {
  isUploading.value = false;
  // 兼容 el-upload 响应结构
  const resData = response?.audio_path ? response : response?.data;
  if (resData && resData.audio_path) {
    audioPath.value = resData.audio_path;
    audioFileName.value = file.name;
    ElMessage.success('音频上传成功');
  } else {
    ElMessage.error('音频上传失败');
  }
};

// 上传失败
const handleUploadError = () => {
  isUploading.value = false;
  ElMessage.error('音频上传失败');
};

// 识别音频
const recognize = async () => {
  if (!selectedModel.value || !audioPath.value) {
    ElMessage.error('请先选择模型并上传音频');
    return;
  }
  isRecognizing.value = true;
  transcription.value = '';
  try {
    const res = await recognizeAudio({
      model_name: selectedModel.value,
      audio_path: audioPath.value
    });
    if (res.data.transcription) {
      transcription.value = res.data.transcription;
      ElMessage.success('识别完成');
    } else {
      transcription.value = res.data.raw_output || '';
      ElMessage.warning('未识别到有效文本');
    }
  } catch (e) {
    ElMessage.error('识别失败：' + (e.response?.data?.error || e.message));
  } finally {
    isRecognizing.value = false;
  }
};

onMounted(() => {
  fetchModels();
});
</script>

<style scoped>
.offline-audio-recognition {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
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
.result-container {
  margin-top: 24px;
}
</style>