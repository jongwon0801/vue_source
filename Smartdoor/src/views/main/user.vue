<template>
  <div class="user-list-modal">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">닫기</button>
      <ul>
        <li
          v-for="user in userList"
          :key="user.id"
          @click="openUserDetail(user)"
        >
          <div class="photo">
            <img
              :src="
                user.picture?.url + '?v=' + user.updateDate ||
                '/image/person/default.png'
              "
              :alt="user.name"
              @error="onImgError"
            />
          </div>
          <div class="name">{{ user.name }}</div>
        </li>
      </ul>
    </div>

    <!-- 상세 모달 -->
    <UserDetail
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
    />
  </div>
</template>

<script setup>
import { useUser } from "@/composables/user/useUser";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { defineEmits, onMounted, onUnmounted, ref, watch } from "vue";
import UserDetail from "./user_detail.vue";

const emit = defineEmits(["close"]);
const { userList, displayUsers, updatedUser, setUser } = useUser();
const { requestGetUsers, requestUserUpdate, ws } = useWsSendCommands();

const selectedUser = ref(null);

// 유저 클릭 시 상세 모달 열기
function openUserDetail(user) {
  selectedUser.value = user;
}

// 모달 닫기
function closeModal() {
  emit("close");
}

// 이미지 로드 실패 시 기본 이미지
function onImgError(event) {
  event.target.src = "/image/person/default.png";
}

// WebSocket 메시지 처리
function handleWsMessage(event) {
  try {
    const data = JSON.parse(event.data);

    if (data.request === "sendKiosk" && data.response === "displayUsers") {
      displayUsers(data.data);
    }

    if (data.request === "userUpdate" && data.response === "setUser") {
      setUser(data.data);
    }
  } catch (error) {
    console.error("WebSocket 메시지 처리 오류:", error);
  }
}

// WebSocket 연결 및 이벤트
watch(updatedUser, (newVal) => {
  if (newVal) {
    requestGetUsers();

    if (ws) {
      ws.removeEventListener("message", handleWsMessage);
      ws.addEventListener("message", handleWsMessage);
    }

    updatedUser.value = null;
  }
});

onMounted(() => {
  requestUserUpdate();
});

onUnmounted(() => {
  if (ws) ws.removeEventListener("message", handleWsMessage);
});
</script>

<style scoped>
.user-list-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.modal-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  max-height: 80%;
  overflow-y: auto;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 10px;
  padding: 20px;
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
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}

li:hover {
  background-color: #f0f0f0;
}

.photo img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.name {
  margin-left: 10px;
}
</style>
