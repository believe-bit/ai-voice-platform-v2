<!-- views/VITSTrain.vue -->
<template>
  <div class="vits-train">
    <h2>VITS 模型训练（数据集上传）</h2>

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
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="success" :disabled="!datasetUploaded">下一步：开始训练（待实现）</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadVitsDataset } from '../api';

const isUploading = ref(false);
const datasetUploaded = ref(false);
const datasetInfo = ref(null);

const beforeUpload = () => {
  if (isUploading.value) {
    ElMessage.warning('正在上传，请稍候');
    return false;
  }
  isUploading.value = true;
  return true;
};

const customUpload = async (options) => {
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', options.file);
    const res = await uploadVitsDataset(formData);
    // 统一判断响应格式
    if (res && res.data) {
      if (res.data.error) {
        // 后端返回处理错误
        handleError({ response: { data: res.data } });
      } else {
        handleSuccess(res.data);
      }
    } else {
      // 未收到有效响应
      ElMessage.error('上传完成但后端未返回有效数据，请检查后端日志');
      console.error('upload_vits_dataset empty response:', res);
    }
  } catch (e) {
    handleError(e);
  } finally {
    isUploading.value = false;
  }
};

const handleSuccess = (data) => {
  datasetUploaded.value = true;
  datasetInfo.value = data;
  ElMessage.success('数据集上传并处理成功');
};

const handleError = (err) => {
  console.error('upload_vits_dataset error:', err);
  const msg = err?.response?.data?.error || err?.response?.data || err?.message || '上传或处理失败';
  // 显示简短消息，并在控制台打印详细内容
  ElMessage.error(String(msg));
};
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
</style>