<template>
  <div class="notice">
    <h1 class="notice-header">
      <img :src="noticeIcon" alt="공지사항" />
      공지사항
    </h1>
    <ul class="notice-list">
      <li v-if="notices.length === 0" class="notice-empty">
        등록된 공지사항이 없습니다.
      </li>
      <li v-for="(notice, index) in notices" :key="index" class="notice-item">
        {{ notice.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import noticeIcon from "@/assets/image/notice.png";
import { notices } from "@/composables/contents/notice";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { inject, onMounted, watch } from "vue";

const isConnected = inject("isConnected"); // 반드시 inject 해야 함
const { requestNoticeUpdate, waitForWebSocketReady } = useWsSendCommands();

onMounted(async () => {
  // await waitForWebSocketReady()
  // requestNoticeUpdate()
});

let lastRequestTime = 0;

watch(isConnected, async (connected) => {
  if (connected) {
    const now = Date.now();
    if (now - lastRequestTime > 300000) {
      // 5분 = 300,000ms
      lastRequestTime = now;
      await waitForWebSocketReady();
      requestNoticeUpdate();
    } else {
      console.log("재연결 너무 잦아 요청 생략");
    }
  }
});
</script>

<style scoped>
.notice {
  margin-top: 20px;
}

.notice-header {
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-list {
  margin-top: 12px;
  list-style: none;
  padding: 0;
}

.notice-item,
.notice-empty {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 16px;
}
</style>
