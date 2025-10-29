<template>
  <div class="stream-asr">
    <h2>流式实时语音识别</h2>

    <!-- ① 选择模型 -->
    <div class="row">
      <label>选择模型：</label>
      <el-select v-model="modelName" placeholder="模型列表">
        <el-option
          v-for="m in models"
          :key="m"
          :label="m"
          :value="m"
        />
      </el-select>
    </div>

    <!-- ② 控制按钮 -->
    <div class="row">
      <el-button type="success" :disabled="recording" @click="startRecording">
        开始录音
      </el-button>
      <el-button type="danger" :disabled="!recording" @click="stopRecording">
        停止录音
      </el-button>
    </div>

    <!-- ③ 实时结果 -->
    <div class="result-box">
      <el-input
        v-model="resultText"
        type="textarea"
        :rows="8"
        readonly
        placeholder="识别结果将实时显示在这里…"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from '@/api'   // 你的 axios 实例
import { ElMessage } from 'element-plus'
import { io } from 'socket.io-client'

const modelName = ref('')
const models = ref([])
const recording = ref(false)
const resultText = ref('')
let socket = null

/* 拉模型列表 */
async function loadModels () {
  try {
    const { data } = await axios.get('/stream_asr/models')  // ✅ 去掉 /api
    models.value = data.models
    if (models.value.length && !modelName.value) {
      modelName.value = models.value[0]
    }
  } catch (e) {
    ElMessage.error('获取模型列表失败：' + e.message)
  }
}


function connectWS () {
  if (socket?.connected) return

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const host = location.hostname
  const port = 5000
  const wsUrl = `${protocol}://${host}:${port}`

  socket = io(wsUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    pingInterval: 10000,
    pingTimeout: 30000
  })

  socket.on('connect', () => console.log('WS connected'))
  socket.on('asr_text', (data) => {
    const txt = typeof data === 'string' ? data : data.text
    if (txt) resultText.value += txt + '\n'
  })
  socket.on('disconnect', (r) => console.warn('WS disconnect:', r))
}

/* 开始 / 停止 */
async function startRecording () {
  if (!modelName.value) return ElMessage.warning('请先选择模型')
  resultText.value = ''
  try {
    await axios.post('/stream_asr/start', { model: modelName.value })  // ✅ 去掉 /api
    recording.value = true
    connectWS()
    ElMessage.success('已开始录音识别')
  } catch (e) {
    ElMessage.error('启动失败：' + e.message)
  }
}

async function stopRecording () {
  try {
    await axios.post('/stream_asr/stop')   // ✅ 去掉 /api
    recording.value = false
    // if (socket) socket.disconnect() 
    ElMessage.success('已停止')
  } catch (e) {
    ElMessage.error('停止失败：' + e.message)
  }
}

onMounted(loadModels)
onUnmounted(stopRecording)
</script>