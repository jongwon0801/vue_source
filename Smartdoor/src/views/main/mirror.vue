<template>
  <div v-if="visible" class="mirror-screen">
    <!-- 좌측하단 닫기용 거울 아이콘 -->
    <div class="mirror-button">
      <a href="#" @click.prevent="$emit('close')">
        <img :src="mirrorIcon" alt="거울 닫기" />
      </a>
    </div>

    <!-- 거울 화면 콘텐츠 -->
    <div class="mirror-content">
      <!-- 필요하면 콘텐츠 추가 -->
    </div>
  </div>
</template>

<script setup>
import mirrorIcon from '@/assets/image/mirror.png';
import { defineProps } from 'vue';

const props = defineProps({
  visible: Boolean,
})
</script>

<style scoped>
.mirror-screen {
  position: fixed;
  inset: 0;
  background: black;
  z-index: 100;
}

.mirror-button {
  position: fixed;
  left: 40px;
  bottom: 60px;
  z-index: 101;
  cursor: pointer;
}

.mirror-button img {
  width: 48px;
  height: 48px;
}
</style>
