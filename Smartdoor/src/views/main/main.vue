<template>
  <div id="main-layout">
    <!-- mirrorVisible, qrVisible, cameraVisible 모두 false일 때 wifi 및 콘텐츠 노출 -->
    <div v-if="!mirrorVisible && !qrVisible && !cameraVisible">
      <wifi />
    </div>

    <div
      v-if="!mirrorVisible && !qrVisible && !cameraVisible"
      class="content-grid"
    >
      <div class="notice"><notice /></div>
      <div class="schedule"><schedule /></div>
      <div class="bus"><bus /></div>
      <div class="weather"><weather /></div>
    </div>

    <!-- 유틸리티 버튼 영역 -->
    <div class="utility-buttons">
      <!-- 유저 버튼 -->
      <a href="#" class="utility-button" @click.prevent="openUser">
        <img :src="userIcon" alt="사용자 보기" />
      </a>

      <vod class="utility-button" />

      <!-- 카메라 열기 버튼 -->
      <a href="#" class="utility-button" @click.prevent="cameraVisible = true">
        <img :src="cameraIcon" alt="카메라 열기" />
      </a>

      <!-- 거울 열기 버튼 -->
      <a href="#" class="utility-button" @click.prevent="mirrorVisible = true">
        <img :src="mirrorIcon" alt="거울 열기" />
      </a>

      <!-- QR 토글 버튼 -->
      <a href="#" class="utility-button" @click.prevent="toggleQr">
        <img :src="qrIcon" alt="QR 열기" />
      </a>
    </div>

    <!-- 모달 및 참조 컴포넌트 -->
    <Mirror :visible="mirrorVisible" @close="mirrorVisible = false" />
    <Camera v-if="cameraVisible" @close="cameraVisible = false" />
    <qrRegister ref="qrRef" />

    <!-- 유저 목록 모달 -->
    <User v-if="isUserDialogOpen" @close="isUserDialogOpen = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";

import cameraIcon from "@/assets/image/camera.png";
import mirrorIcon from "@/assets/image/mirror.png";
import qrIcon from "@/assets/image/qr.png";
import userIcon from "@/assets/image/user.png";

import Camera from "./camera.vue";
import Mirror from "./mirror.vue";
import qrRegister from "./qrRegister.vue";
import User from "./user.vue"; // 유저 목록 모달

import bus from "./bus.vue";
import notice from "./notice.vue";
import schedule from "./schedule.vue";
import vod from "./vod.vue";
import weather from "./weather.vue";
import wifi from "./wifi.vue";

const mirrorVisible = ref(false);
const cameraVisible = ref(false);
const qrRef = ref(null);
const qrVisible = ref(false);
const isUserDialogOpen = ref(false); // 유저 목록 모달 상태

function toggleQr() {
  if (qrRef.value) {
    qrRef.value.toggleQr();
  }
}

function openUser() {
  console.log("유저 버튼 클릭");
  isUserDialogOpen.value = true;
}
</script>

<style scoped>
#main-layout {
  padding-top: 80px; /* wifiWrapper 높이에 맞게 조정 */
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  flex: 1;
  margin-bottom: 10px;
}

.weather,
.bus,
.schedule,
.notice {
  background-color: #4f062d;
  border: 1px dashed gray;
  min-height: 200px;
  padding: 10px;
  box-sizing: border-box;
}

.utility-buttons {
  min-height: 70px;
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.utility-button {
  background-color: #760a31;
  color: rgb(106, 41, 218);
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.utility-button:hover {
  background-color: #333;
}

.utility-button img {
  width: 40px;
  height: 40px;
}
</style>
