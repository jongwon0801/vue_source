<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    "
  >
    <!-- 현재 날씨 -->
    <div style="text-align: center; margin-bottom: 24px">
      <div style="font-size: 18px; margin-bottom: 4px">
        {{ weather.location || "지역 정보 없음" }}
      </div>
      <div style="font-size: 14px; color: gray">
        현재 시간: {{ getCurrentTime() }}
      </div>

      <img
        :src="getWeatherIconPath(weather.icon)"
        alt="날씨 아이콘"
        style="width: 64px; margin-top: 8px"
      />
      <div style="font-size: 32px; font-weight: bold">
        {{ weather.currentTemperature ?? "-" }}˚
      </div>
      <div>
        최고 {{ weather.maxTemperature ?? "-" }}˚ / 최저
        {{ weather.minTemperature ?? "-" }}˚
      </div>
      <div>{{ weather.sky || "-" }}</div>
      <div>미세먼지: {{ weather.finedust || "-" }}</div>
    </div>

    <!-- 시간별 날씨 -->
    <div class="weather-hourly" style="width: 100%; max-width: 300px">
      <div
        v-for="(item, i) in filteredForecast.slice(0, 6)"
        :key="i"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        "
      >
        <div>{{ formatDateTime(item.date) }}</div>
        <img
          :src="getWeatherIconPath(item.icon)"
          alt="아이콘"
          style="width: 32px"
        />
        <div>{{ item.temperature ?? "-" }}˚</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { hourlyForecast, weather } from "@/composables/contents/weather";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { computed, inject, onBeforeUnmount, onMounted, watch } from "vue";

const isConnected = inject("isConnected");
const { requestWeatherUpdate, waitForWebSocketReady } = useWsSendCommands();

// 현재 시간 표시 (예: 07/29 11:25)
function getCurrentTime() {
  const now = new Date();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${MM}/${DD} ${hh}:${mm}`;
}

// 시간 문자열 포맷: '2025072912' → '07/29 12시'
function formatDateTime(dateStr) {
  if (!dateStr || dateStr.length !== 10) return "-";
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  return `${month}/${day} ${hour}시`;
}

// 날씨 아이콘 경로
function getWeatherIconPath(icon) {
  if (!icon) return "";
  return new URL(`../../assets/image/weather/${icon}.png`, import.meta.url)
    .href;
}

// 3시간 간격으로 6개 필터링 (ex: 0, 3, 6, 9, 12, 15시)
const filteredForecast = computed(() => {
  const step = 3;
  const sliced = [];
  for (let i = 0; i < hourlyForecast.value.length; i += step) {
    sliced.push(hourlyForecast.value[i]);
    if (sliced.length === 6) break;
  }
  return sliced;
});

let intervalId = null;

let lastRequestTime = 0;

// WebSocket 준비 후 날씨 업데이트 실행
async function startWeatherUpdates() {
  // await waitForWebSocketReady()
  // requestWeatherUpdate()

  intervalId = setInterval(async () => {
    const now = new Date();
    if (now.getMinutes() === 0 && isConnected?.value) {
      await waitForWebSocketReady();
      requestWeatherUpdate();
    }
  }, 60000);
}

onMounted(() => {
  startWeatherUpdates();
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});

watch(isConnected, async (connected) => {
  if (connected) {
    const nowTime = Date.now();
    if (nowTime - lastRequestTime > 300000) {
      // 5분 쓰로틀링
      await waitForWebSocketReady();
      requestWeatherUpdate();
      lastRequestTime = nowTime;
    } else {
      console.log("재연결 시 요청 생략: 5분 이내 중복");
    }
  }
});
</script>

<style scoped>
.weather-hourly {
  margin-top: 10px;
}
</style>
