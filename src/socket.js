// src/socket.js
// WebSocket客户端，用于接收下发的实验项目
import { io } from 'socket.io-client';

// 初始化WebSocket连接
const socket = io('http://localhost:5000');

// 连接成功日志
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

// 监听项目分发事件
export const onProjectDistributed = (callback) => {
  socket.on('project_distributed', (project) => {
    callback(project);
  });
};

export default socket;