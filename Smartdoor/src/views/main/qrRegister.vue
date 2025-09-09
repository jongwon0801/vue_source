<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <!-- CI 이미지 -->
      <img :src="ciImage" alt="CI" class="ci-image" />

      <!-- 안내 문구 -->
      <p class="instruction">
        제품 등록 대기중입니다. 앱 설치 후 하단 QR코드를 통해 등록해주세요.
      </p>

      <!-- 로딩 표시 -->
      <p v-if="isLoading" class="loading">QR 생성 중...</p>

      <!-- QR 이미지 -->
      <img
        v-if="qrImageSrc && !isLoading"
        :src="qrImageSrc"
        alt="QR 코드"
        class="qr-image"
      />

      <!-- 닫기 버튼 -->
      <button @click="hideQrModal" class="close-btn">닫기</button>
    </div>
  </div>
</template>

<script setup>
import {
  hideQrModal,
  isLoading,
  isVisible,
  qrImageSrc,
} from "@/composables/contents/qrRegister";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { defineExpose } from "vue";

const { requestQrUpdate } = useWsSendCommands();
const ciImage = "/image/ci.png";

function toggleQr() {
  requestQrUpdate();
}

defineExpose({ toggleQr, hideQrModal });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #000;
  padding: 50px 60px; /* 전체 padding 확대 */
  border-radius: 16px;
  color: #fff;
  max-width: 650px; /* 모달 최대 폭 확대 */
  width: 95%;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.ci-image {
  width: 220px; /* CI 이미지 더 크게 */
  margin-bottom: 40px; /* CI와 안내문 간격 */
}

.instruction {
  font-size: 18px;
  margin-bottom: 35px; /* 안내문과 로딩/QR 간격 넓힘 */
}

.loading {
  color: gray;
  font-size: 15px;
  margin-bottom: 25px;
}

.qr-image {
  width: 300px; /* QR 크기 더 키움 */
  height: 300px;
  margin-bottom: 50px; /* QR과 닫기 버튼 사이 간격 크게 */
}

.close-btn {
  padding: 14px 30px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: #fff;
  color: #000;
  font-weight: bold;
  font-size: 16px;
}
</style>
