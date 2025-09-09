<template>
  <div class="bus-stop-list">
    <div v-for="(stop, idx) in busStops" :key="stop.name + idx">
      <div class="stop-header">
        <label class="stop-name">{{ stop.name }}</label>
        <label class="stop-direction">{{ stop.direction }} 방향</label>
      </div>

      <ul class="bus-list">
        <li v-for="bus in stop.lists" :key="bus.name" class="bus-item">
          <label class="bus-title">{{ bus.type.shortName }} {{ bus.name }}</label>
          <span class="bus-direction">{{ bus.direction }}</span>

          <div class="arrival-info" v-if="bus.arrival?.buses?.length">
            <table class="arrival-table">
              <tbody>
                <tr v-for="(info, i) in getArrivalInfos(bus.arrival.buses)" :key="i">
                  <th>{{ i === 0 ? '이번' : '다음' }}</th>
                  <td class="center">{{ info.seat }}</td>
                  <td class="center">{{ info.station }}</td>
                  <td class="right">{{ info.min }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup>
import { busStops } from '@/composables/contents/bus'
import { useWsSendCommands } from '@/composables/wsSendCommands'
import { inject, onBeforeUnmount, onMounted, watch } from 'vue'

// WebSocket 연결 상태 (inject로 받아옴)
const isConnected = inject('isConnected')

// WebSocket 관련 명령 함수들
const { requestBusStopList, waitForWebSocketReady } = useWsSendCommands()

// 버스 도착 정보 계산 헬퍼 함수
function getArrivalInfo(bus) {
  if (!bus) return { seat: '', station: '', min: '' }

  const seat = bus.remainingSeat > 0
    ? '여유'
    : bus.remainingSeat === 0
      ? '혼잡'
      : ''

  const station = bus.remainingStop > 0
    ? `${bus.remainingStop}정거장 전`
    : '도착예정'

  const min = bus.remainingTime > 0
    ? `${Math.floor(bus.remainingTime / 60)}분`
    : '곧도착'

  return { seat, station, min }
}

function getArrivalInfos(buses) {
  return buses.map(getArrivalInfo)
}

// 인터벌 ID 저장용
let intervalId = null

// 마지막 요청 시간 저장용 (쓰로틀링용)
let lastRequestTime = 0

// WebSocket 준비 후 버스 정보 주기적 요청 시작 (5분 간격)
async function startBusUpdates() {
  intervalId = setInterval(async () => {
    if (isConnected?.value) {
      const now = Date.now()
      if (now - lastRequestTime > 300000) { // 5분 = 300,000ms
        lastRequestTime = now
        await waitForWebSocketReady()
        requestBusStopList()
      } else {
        console.log('인터벌: 요청 간격 5분 대기 중')
      }
    }
  }, 300000) // 5분
}

// 컴포넌트 마운트 시 업데이트 시작
onMounted(() => {
  startBusUpdates()
})

// WebSocket 연결 상태 변경 감지
watch(isConnected, async (connected) => {
  if (connected) {
    const now = Date.now()
    if (now - lastRequestTime > 300000) { // 5분 쓰로틀링
      lastRequestTime = now
      await waitForWebSocketReady()
      requestBusStopList()
    } else {
      console.log('재연결 너무 잦아 요청 생략')
    }
  }
})

// 컴포넌트 언마운트 시 인터벌 정리
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>





<style scoped>
.bus-stop-list {
  overflow-y: auto;
  max-height: calc(100vh - 820px);
}

.stop-header {
  display: flex;
  justify-content: space-between;
  margin: 25px 0 5px;
  font-weight: bold;
  font-size: 16pt;
}

.bus-list {
  display: flex;
  flex-direction: column;
}

.bus-item {
  border: 1px solid #0b0505;
  border-radius: 8px;
  padding: 14px;
  margin: 5px 0;
}

.bus-title {
  float: left;
  font-size: 16pt;
  font-weight: bold;
}

.bus-direction {
  float: right;
  font-size: 16pt;
  font-weight: bold;
}

.arrival-info {
  clear: both;
}

.arrival-table {
  width: 100%;
  margin-top: 15px;
}

.arrival-table th {
  text-align: left;
  width: 25%;
}

.arrival-table td {
  width: 25%;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}
</style>
