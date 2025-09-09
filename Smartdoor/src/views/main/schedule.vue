<!-- ScheduleDisplay.vue -->
<template>
  <div class="schedule-wrapper">
    <h2>전체 일정</h2>
    <ul>
      <li v-if="schedules.length === 0">일정이 없습니다.</li>
      <li
        v-for="(item, idx) in schedules"
        :key="item.smartdoor_schedule_id || idx"
      >
        {{ item.name }} - {{ formatDate(item.dday) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { schedules } from "@/composables/contents/schedule";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { inject, onMounted, watch } from "vue";

const isConnected = inject("isConnected"); // 연결 상태 반응형 변수
const { requestScheduleUpdate, waitForWebSocketReady } = useWsSendCommands();

let lastRequestTime = 0;

onMounted(() => {
  // 연결 직후 바로 요청하고 싶다면 이 부분 주석 해제
  // if (isConnected?.value) {
  //   waitForWebSocketReady().then(() => {
  //     requestScheduleUpdate()
  //     lastRequestTime = Date.now()
  //   })
  // }
});

watch(isConnected, async (connected) => {
  if (connected) {
    const now = Date.now();
    if (now - lastRequestTime > 300000) {
      // 5분 = 300,000ms
      lastRequestTime = now;
      await waitForWebSocketReady();
      requestScheduleUpdate();
    } else {
      console.log("스케줄 요청 생략: 5분 내 재연결");
    }
  }
});

function formatDate(dateString) {
  if (!dateString) return "";
  const [datePart, timePart] = dateString.split(" ");
  if (!timePart) return datePart;
  return `${datePart} ${timePart.slice(0, 5)}`;
}
</script>

<style scoped>
.schedule-wrapper {
  padding: 1rem;
}
</style>
