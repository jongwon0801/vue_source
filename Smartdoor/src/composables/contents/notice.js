// src/composables/notice.js
import { ref } from 'vue'

export const notices = ref([])

export function handleNoticeResponse(data) {
  if (!data) return

  if (Array.isArray(data)) {
    notices.value = data
  } else {
    console.warn('[Notice] Unexpected data format:', data)
  }
}
