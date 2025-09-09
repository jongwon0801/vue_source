<template>
  <div id="app">
    <Main />
    <!-- key 없이 그냥 렌더링 -->
    <Footer />
  </div>
</template>

<script setup>
import Footer from "@/components/Footer.vue";
import { useWebSocket } from "@/composables/useWebSocket";
import Main from "@/views/main/main.vue";
import { onMounted, provide } from "vue";

// WebSocket 초기화
const {
  ws,
  isConnected,
  shouldReconnect, // ✅ 가져옴
  connect,
} = useWebSocket("ws://127.0.0.1:8080/ws");

// provide로 외부에 공유
provide("ws", ws);
provide("isConnected", isConnected);
provide("shouldReconnect", shouldReconnect); // ✅ 외부에서 사용 가능
provide("connect", connect);

// mount 시 조건부로 connect 실행
onMounted(() => {
  console.log("onMounted - shouldReconnect.value =", shouldReconnect.value);
  if (shouldReconnect.value) {
    connect();
  }
});
</script>

<style>
#app {
  background-color: black;
  color: black;
  min-height: 100vh;
}
</style>
