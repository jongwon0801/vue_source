// src/composables/schedule.js
import { ref } from 'vue'

// 반응형 schedule 배열 선언
export const schedules = ref([])

/**
 * 서버 또는 WebSocket을 통해 받은 스케줄 데이터를 처리
 * @param {Object|Array} data - 수신된 스케줄 데이터 (객체 또는 배열일 수 있음)
 */
export function handleScheduleResponse(data) {
  console.log('[Schedule] 수신된 원본 데이터:', data)

  let scheduleList = []

  // 1. 객체형 (초기 응답 등): data.lists
  if (data && Array.isArray(data.lists)) {
    scheduleList = data.lists
  }

  // 2. 배열형 (실시간 WebSocket 등): data 자체가 배열
  else if (Array.isArray(data)) {
    scheduleList = data
  }

  // 3. 둘 다 아니라면 무시
  else {
    console.warn('[Schedule] 유효하지 않은 데이터 형식:', data)
    return
  }

  // 빈 배열이면 유지
  if (scheduleList.length === 0) {
    console.warn('[Schedule] 빈 리스트 수신됨. 기존 데이터를 유지합니다.')
    return
  }

  // 필터링: name과 dday가 문자열인 항목만
  const filtered = scheduleList.filter(item => {
    const valid = typeof item.name === 'string' && typeof item.dday === 'string'
    if (!valid) {
      console.warn('[Schedule] 무시된 항목:', item)
    }
    return valid
  })

  console.log(`[Schedule] 필터링 후 유효한 스케줄 수: ${filtered.length}`)
  console.table(filtered)

  // 최종 업데이트
  schedules.value = filtered.map(item => ({
    name: item.name,
    dday: item.dday,
    smartdoor_schedule_id: item.smartdoor_schedule_id
  }))
}
