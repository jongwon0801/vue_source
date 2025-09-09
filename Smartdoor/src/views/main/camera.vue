<template>
  <div class="camera-modal">
    <div class="camera-content">
      <video ref="videoRef" autoplay playsinline muted></video>
      <button class="close-btn" @click="handleClose">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { outCameraStart, outCameraStop } from '@/composables/camera/record.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 부모에게 이벤트 보내기 위한 emit
const emit = defineEmits(['close'])

const videoRef = ref(null)

async function startCamera() {
  if (videoRef.value) {
    // 디바이스 이름은 record.js 내부에서 처리되므로 인자 없음
    await outCameraStart(videoRef.value)
  }
}

function stopCamera() {
  if (videoRef.value) {
    outCameraStop(videoRef.value)
  }
}

onMounted(() => {
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})

function handleClose() {
  stopCamera()
  emit('close')  // 부모에게 닫기 이벤트 전달
}
</script>

<style scoped>
.camera-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.camera-content {
  position: relative;
  background-color: #000;
  border-radius: 16px;
  overflow: hidden;
  width: 95vw;
  max-width: 1280px;
  height: 75vh;
  max-height: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: black;
  /* 180도 회전 */
  transform: rotate(180deg);
}

.close-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 32px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #222;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: white;
}
</style>
