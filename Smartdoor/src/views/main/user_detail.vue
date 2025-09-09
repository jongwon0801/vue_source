<template>
  <div class="user-detail-modal">
    <div class="overlay" @click="closeModal"></div>
    <div class="content">
      <button class="close-btn" @click="closeModal">닫기</button>

      <h2>{{ user.name }}님 정보</h2>
      <img :src="user.picture?.url || '/image/person/default.png'" />
      <p>ID: {{ user.id }}</p>
      <p>Email: {{ user.email }}</p>

      <h3>아이템 목록</h3>
      <ul>
        <li v-for="item in itemList" :key="item.item_id">
          {{ item.name }} - {{ item.quantity }}
        </li>
        <li v-if="!itemList.length">등록된 아이템이 없습니다.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useItem } from "@/composables/user/useItem";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { defineEmits, defineProps, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  user: { type: Object, required: true },
});
const emit = defineEmits(["close"]);

const { itemList, updatedItem, displayItems, setItem } = useItem();
const { requestGetItems, requestItemUpdate, ws } = useWsSendCommands();

// 모달 닫기
function closeModal() {
  emit("close");
}

// WebSocket 메시지 핸들러
function handleWsMessage(event) {
  try {
    const data = JSON.parse(event.data);

    switch (data.response) {
      case "displayItems":
        displayItems(data.data);
        break;

      case "setItem":
        setItem(data.data);
        break;
    }
  } catch (error) {
    console.error("WebSocket 메시지 처리 오류:", error);
  }
}

// 아이템이 갱신되면 서버에서 최신 리스트 다시 요청
watch(updatedItem, (newVal) => {
  if (newVal) {
    requestGetItems(props.user.id);

    if (ws) {
      ws.removeEventListener("message", handleWsMessage);
      ws.addEventListener("message", handleWsMessage);
    }

    updatedItem.value = null;
  }
});

onMounted(() => {
  if (ws) {
    ws.addEventListener("message", handleWsMessage);
    requestItemUpdate(props.user.id); // ✅ 아이템 업데이트 요청
  }
});

onUnmounted(() => {
  if (ws) ws.removeEventListener("message", handleWsMessage);
});
</script>

<style scoped>
.user-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  max-height: 80%;
  overflow-y: auto;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  border-radius: 10px;
}
.close-btn {
  float: right;
  cursor: pointer;
  margin-bottom: 10px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}
</style>
