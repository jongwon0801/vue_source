<template>
  <div id="wifiWrapper">
    <!-- 로고: 좌측 상단 -->
    <img class="logo" src="@/assets/image/w_logo.png" alt="로고" />

    <!-- 와이파이 아이콘: 우측 상단 -->
    <a id="wifiIcon" :class="{ off: isOffline }" @click="handleClick">
      <img src="@/assets/image/wifi.png" alt="Wi-Fi" />
    </a>

    <!-- 로딩 모달: 화면 중앙 -->
    <div v-if="showLoading" class="loading-overlay">
      <img
        src="@/assets/image/icon/loading.gif"
        alt="loading"
        class="loading-gif"
      />
      <p>잠시만 기다려주세요...</p>
    </div>
  </div>
</template>

<script setup>
import { useWifi } from "@/composables/wifi/wifi";
import { ref } from "vue";

const { requestWifies, isOffline, isWifiDialogOpen } = useWifi();

const showLoading = ref(false);

function handleClick() {
  showLoading.value = true;
  requestWifies();

  setTimeout(() => {
    showLoading.value = false;
    isWifiDialogOpen.value = true;
  }, 1000);
}
</script>

<style scoped>
#wifiWrapper {
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  z-index: 1000;
  pointer-events: none;
  width: 100%;
  box-sizing: border-box;
}

.logo {
  height: 6vh;
  max-height: 50px;
  width: auto;
  object-fit: contain;
  pointer-events: auto;
}

#wifiIcon {
  pointer-events: auto;
  width: 6vh;
  max-width: 50px;
  height: 6vh;
  max-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ffffff;
  border-radius: 50%;
  background-color: black;
  overflow: hidden;
  cursor: pointer;
}

#wifiIcon img {
  width: 50%;
  height: 50%;
  object-fit: contain;
}

#wifiIcon.off::before {
  content: "x";
  color: #0b0b0b;
  background: #ff0000;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 9pt;
  font-weight: bold;
  position: absolute;
  top: 0;
  right: 0;
  text-align: center;
  line-height: 20px;
}

/* 로딩 모달 - 화면 중앙 고정 */
.loading-overlay {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  background: rgba(90, 85, 85, 0.7);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1rem; /* 1.3rem -> 1rem 으로 줄임 */
}

.loading-gif {
  width: 30px;
  height: 30px;
  margin-bottom: 10px;
}
</style>
