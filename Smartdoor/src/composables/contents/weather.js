import { ref } from 'vue'

export const weather = ref({
  currentTemperature: null,
  maxTemperature: null,
  minTemperature: null,
  sky: '',
  finedust: '',
  icon: '',
  updateDate: '',
  location: ''
})

export const hourlyForecast = ref([])

export function handleWeatherResponse(data) {
  if (!data) return

  weather.value = {
    currentTemperature: data.currentTemperature,
    maxTemperature: data.maxTemperature,
    minTemperature: data.minTemperature,
    sky: data.sky,
    finedust: data.finedust,
    icon: String(data.icon),
    location: data.location || '',
    updateDate: data.updateDate || data.timecode || ''  // 시간 정보 넣기
  }

  hourlyForecast.value = Array.isArray(data.lists)
    ? data.lists.map(item => ({
        date: item.date, // '2025072911'
        temperature: item.temperature,
        icon: String(item.icon)
      }))
    : []
}
