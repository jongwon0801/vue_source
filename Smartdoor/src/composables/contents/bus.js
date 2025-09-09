// bus.js
import { ref } from 'vue'

export const busStops = ref([])

export function handleBusResponse(data) {
  if (!data) return

  if (Array.isArray(data)) {
    busStops.value = data
  } else {
    console.warn('Unexpected busStopList format:', data)
  }
}