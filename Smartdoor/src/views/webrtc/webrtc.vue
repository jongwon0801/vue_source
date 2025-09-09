<!-- @/views/webrtc/webrtc.vue -->
<template>
  <div>
    <div id="local-player" ref="localPlayer"></div>
    <div id="remote-playerlist">
      <div v-for="(user, uid) in Object.values(remoteUsers)" :key="uid" :id="'player-wrapper-' + uid">
        <p class="player-name">remoteUser({{ uid }})</p>
        <div :id="'player-' + uid" class="player"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { agora } from '@/composables/webrtc/agora'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const localPlayer = ref(null)
const remoteUsers = ref({})
const { agoraStart, agoraStop, remoteUsers: reactiveRemoteUsers, isVideoCalling } = agora()

const ws = new WebSocket('ws://localhost:8080/ws') // 예시 WebSocket 주소

onMounted(async () => {
  ws.onopen = () => {
    console.log('WebSocket connected')
    // 서버에서 받은 데이터 예시 (실제 데이터는 WebSocket 메시지 핸들러에서 받도록 변경)
    const data = {
      appid: 'YOUR_AGORA_APP_ID',
      channel: 'test-channel',
      token: null,
      uid: null,
      outsideCamDeviceId: 'camera-device-id',
      outsideMicDeviceId: 'mic-device-id',
      resTopic: 'your/resTopic'
    }
    agoraStart(data, ws, localPlayer.value)
  }

  ws.onmessage = event => {
    // TODO: WebSocket 메시지 처리 로직 추가
    console.log('WS message:', event.data)
  }
})

onBeforeUnmount(() => {
  agoraStop()
  if (ws.readyState === WebSocket.OPEN) ws.close()
})

// reactive remoteUsers는 composable에서 관리하므로 local 변수에 할당
remoteUsers.value = reactiveRemoteUsers
</script>

<style>
#local-player, .player {
  width: 480px;
  height: 270px;
  background-color: black;
}
.player-name {
  color: white;
}
</style>
