<template>
  <div class="speech-synthesis">
    <h2>语音合成</h2>
    <div class="form-group">
      <label>选择模型 (.pth 文件):</label>
      <input type="file" ref="modelFile" accept=".pth" @change="handleModelFileChange" />
    </div>
    <div class="form-group">
      <label>选择语言拼音:</label>
      <div class="language-selector">
        <select v-model="selectedLanguage" @change="updateInferenceScript">
          <option v-for="lang in customLanguages" :key="lang" :value="lang">{{ lang }}</option>
        </select>
        <button @click="showAddLanguageModal" class="add-language-btn">+</button>
        <button v-if="customLanguages.length > 2" @click="showDeleteLanguageModal(selectedLanguage)" class="delete-language-btn">−</button>
      </div>
    </div>
    <div class="form-group">
      <label>选择配置文件 (.json 文件):</label>
      <input type="file" ref="configFile" accept=".json" @change="handleConfigFileChange" />
    </div>
    <div class="form-group">
      <label>选择说话人:</label>
      <input v-model="speakerId" type="text" placeholder="输入说话人ID（如 0）" />
    </div>
    <div class="form-group">
      <label>合成文本:</label>
      <textarea v-model="textToSynthesize" placeholder="输入需要合成的文本"></textarea>
    </div>
    <div class="form-group">
      <label>语速 (0-2):</label>
      <input v-model.number="lengthScale" type="number" min="0" max="1" step="0.1" placeholder="1.0" />
    </div>
    <div class="form-group">
      <label>音量 (noise_scale, 0-1):</label>
      <input v-model.number="noiseScale" type="number" min="0" max="1" step="0.1" placeholder="0.3" />
    </div>
    <div class="form-group">
      <label>音量权重 (noise_scale_w, 0-2):</label>
      <input v-model.number="noiseScaleW" type="number" min="0" max="2" step="0.1" placeholder="0.8" />
    </div>
    <div class="form-group">
      <label>音调:</label>
      <select v-model="pitch">
        <option value="default">默认</option>
        <option value="high">高</option>
        <option value="low">低</option>
      </select>
    </div>
    <div class="form-group">
      <label><input type="checkbox" v-model="usePinyin" /> 使用拼音 (--use_pinyin)</label>
    </div>
    <button @click="startSynthesis" :disabled="isSynthesizing" class="synthesis-btn">
      {{ isSynthesizing ? '合成中...' : '开始合成' }}
    </button>
    <div v-if="audioUrl" class="audio-player">
      <h3>合成的音频:</h3>
      <audio :src="audioUrl" controls></audio>
    </div>

    <!-- 添加语言模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>添加自定义语言</h3>
        <div class="form-group">
          <label>语言拼音名称:</label>
          <input v-model="newLanguageName" type="text" placeholder="例如: yueyu" />
        </div>
        <div class="form-group">
          <label>语言推理代码 (Python):</label>
          <textarea v-model="newLanguageCode" placeholder="输入 Python 推理代码"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveCustomLanguage">保存</button>
          <button @click="showModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 删除语言模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>删除语言</h3>
        <p>确定要删除语言 {{ languageToDelete }} 吗？</p>
        <div class="modal-actions">
          <button @click="deleteCustomLanguage">确认删除</button>
          <button @click="showDeleteModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { synthesizeSpeech, getCustomLanguages, saveCustomLanguage, API_BASE_URL } from '@/api/index.js';

export default {
  name: 'SpeechSynthesis',
  data() {
    return {
      modelFile: null,
      configFile: null,
      selectedLanguage: 'zhongwen',
      customLanguages: ['zhongwen', 'sichuan'],
      speakerId: '0',
      textToSynthesize: '',
      lengthScale: 1.0,
      noiseScale: 0.3,
      noiseScaleW: 0.5, // 新增 noise_scale_w 默认值
      pitch: 'default',
      usePinyin: false,
      isSynthesizing: false,
      audioUrl: null,
      showModal: false,
      newLanguageName: '',
      newLanguageCode: '',
      showDeleteModal: false,
      languageToDelete: ''
    };
  },
  async created() {
    await this.fetchCustomLanguages();
  },
  methods: {
    async fetchCustomLanguages() {
      try {
        const response = await getCustomLanguages();
        this.customLanguages = response.data.languages;
      } catch (error) {
        console.error('获取自定义语言失败:', error);
        alert('获取自定义语言失败');
      }
    },
    handleModelFileChange(event) {
      this.modelFile = event.target.files[0];
    },
    handleConfigFileChange(event) {
      this.configFile = event.target.files[0];
    },
    showAddLanguageModal() {
      this.newLanguageName = '';
      this.newLanguageCode = '';
      this.showModal = true;
    },
    showDeleteLanguageModal(lang) {
      if (['zhongwen', 'sichuan'].includes(lang)) {
        alert('不能删除默认语言 zhongwen 或 sichuan');
        return;
      }
      this.languageToDelete = lang;
      this.showDeleteModal = true;
    },
    async saveCustomLanguage() {
      if (!this.newLanguageName || !this.newLanguageCode) {
        alert('请输入语言名称和推理代码');
        return;
      }
      try {
        await saveCustomLanguage({
          language: this.newLanguageName,
          code: this.newLanguageCode
        });
        await this.fetchCustomLanguages();
        this.selectedLanguage = this.newLanguageName;
        this.showModal = false;
      } catch (error) {
        alert('保存语言失败: ' + error.message);
      }
    },
    async deleteCustomLanguage() {
      try {
        await saveCustomLanguage({
          language: this.languageToDelete,
          delete: true
        });
        await this.fetchCustomLanguages();
        if (this.selectedLanguage === this.languageToDelete) {
          this.selectedLanguage = this.customLanguages[0] || 'zhongwen';
        }
        this.showDeleteModal = false;
      } catch (error) {
        alert('删除语言失败: ' + error.message);
      }
    },
    async startSynthesis() {
      if (!this.modelFile || !this.configFile || !this.textToSynthesize) {
        alert('请确保已选择模型、配置文件并输入合成文本');
        return;
      }
      if (this.noiseScale < 0 || this.noiseScale > 2) {
        alert('音量 (noise_scale) 必须在 0 到 2 之间');
        return;
      }
      if (this.noiseScaleW < 0 || this.noiseScaleW > 2) {
        alert('音量权重 (noise_scale_w) 必须在 0 到 2 之间');
        return;
      }
      this.isSynthesizing = true;
      const formData = new FormData();
      formData.append('model', this.modelFile);
      formData.append('config', this.configFile);
      formData.append('text', this.textToSynthesize);
      formData.append('speaker', this.speakerId);
      formData.append('language', this.selectedLanguage);
      formData.append('length_scale', this.lengthScale);
      formData.append('noise_scale', this.noiseScale);
      formData.append('noise_scale_w', this.noiseScaleW); // 使用独立输入值
      formData.append('use_pinyin', this.usePinyin.toString());
      const pitchMap = {
        default: 1.0,
        high: 1.2,
        low: 0.8
      };
      formData.append('pitch_factor', pitchMap[this.pitch]);

      try {
        const response = await synthesizeSpeech(formData);
        this.audioUrl = `${API_BASE_URL}${response.data.audio_url}`;
        console.log('Audio URL:', this.audioUrl); // 调试输出
      } catch (error) {
        alert('语音合成失败: ' + error.message);
      } finally {
        this.isSynthesizing = false;
      }
    },
    updateInferenceScript() {
      // 根据选择的语言更新推理脚本（如果需要）
    }
  }
};
</script>

<style scoped>
.speech-synthesis {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.language-selector {
  display: flex;
  align-items: center;
}
.language-selector select {
  flex-grow: 1;
  margin-right: 10px;
}
.add-language-btn, .delete-language-btn {
  padding: 8px 12px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-language-btn {
  background-color: #28a745;
}
.delete-language-btn {
  background-color: #dc3545;
}
.synthesis-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.synthesis-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.audio-player {
  margin-top: 20px;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.modal-actions button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-actions button:first-child {
  background-color: #dc3545;
  color: white;
}
.modal-actions button:last-child {
  background-color: #6c757d;
  color: white;
}
</style>