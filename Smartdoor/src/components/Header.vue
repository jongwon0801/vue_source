<!-- <script setup>
import { inject, onMounted } from 'vue'

const ws = inject('ws')
const isConnected = inject('isConnected')
const connect = inject('connect')
const send = inject('send')

function initKioskBoard() {
  if (window.KioskBoard) {
    KioskBoard.init({
      keysJsonUrl: '/json/kioskboard-keys-english.json',
      language: 'en',
      theme: 'light',
      autoScroll: true,
      allowRealKeyboard: true,
      allowMobileKeyboard: true,
      keysAllowSpacebar: true,
      keysEnterText: 'Enter',
      keysEnterCanClose: true,
    })
  }
}

let isScreenOn = true

onMounted(() => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    connect()
  }
  initKioskBoard()

  window.addEventListener('offline', () => {
    console.log('offline')
  })

  window.addEventListener('online', () => {
    console.log('online')
    send('{"request":"init"}')
  })

  document.addEventListener('click', () => {
    if (!isScreenOn) {
      send('{"request":"screenOnProcess"}')
      isScreenOn = true
    }
  })
})
</script> -->
