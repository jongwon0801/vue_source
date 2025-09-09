<template>
  <div v-if="isWifiDialogOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <header class="modal-header">
        <h2>Wi-Fi 네트워크 선택</h2>
        <button class="btn-close" @click="close">×</button>
      </header>

      <main class="modal-body">
        <section class="connected-network">
          <img
            v-if="connectedWifi"
            src="@/assets/image/wifi_over.png"
            alt="wifi connected"
            class="wifi-icon"
          />
          <span>{{ connectedWifi || "연결된 Wi-Fi 없음" }}</span>
          <span class="timer" v-if="connectedWifi"
            >타이머: {{ timerCount }}</span
          >
        </section>

        <section class="available-networks">
          <h3>사용 가능한 네트워크</h3>
          <ul>
            <li
              v-for="wifi in wifiList"
              :key="wifi.ssid"
              :class="{ selected: selectedWifi === wifi.ssid }"
              @click="selectWifi(wifi.ssid)"
            >
              {{ wifi.ssid }}
            </li>
          </ul>
        </section>

        <label for="wifi-password">비밀번호 입력</label>
        <input
          id="wifi-password"
          ref="passwordInput"
          type="password"
          v-model="wifiPassword"
          placeholder="비밀번호를 입력하세요"
          autocomplete="off"
          @focus="showKeyboard = true"
          class="wifi-password-input"
        />

        <div
          v-if="showKeyboard"
          ref="keyboardContainer"
          class="keyboard-container"
        ></div>
      </main>

      <footer class="modal-footer">
        <button class="btn-save" @click="setupWifiSave">연결</button>
        <button class="btn-close" @click="close">닫기</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useWifi } from "@/composables/wifi/wifi";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const {
  selectedWifi,
  wifiPassword,
  isWifiDialogOpen,
  setupWifiSave,
  wifiList,
  connectedWifi,
  setSelectedWifi,
} = useWifi();

const passwordInput = ref(null);
const keyboardContainer = ref(null);
const showKeyboard = ref(false);

let keyboard = null;

function close() {
  isWifiDialogOpen.value = false;
  showKeyboard.value = false;
  if (keyboard) {
    keyboard.destroy();
    keyboard = null;
  }
}

function selectWifi(ssid) {
  setSelectedWifi(ssid);
  showKeyboard.value = false;
  wifiPassword.value = "";
}

const timerCount = ref(10);
let timerInterval = null;

function startTimer() {
  timerCount.value = 10;
  timerInterval = setInterval(() => {
    timerCount.value--;
    if (timerCount.value <= 0) {
      timerCount.value = 10;
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

watch(isWifiDialogOpen, (open) => {
  if (open) {
    showKeyboard.value = false;
    startTimer();
  } else {
    showKeyboard.value = false;
    stopTimer();
    if (keyboard) {
      keyboard.destroy();
      keyboard = null;
    }
  }
});

watch(showKeyboard, async (val) => {
  if (val) {
    await nextTick();
    if (keyboard) {
      keyboard.destroy();
      keyboard = null;
    }
    keyboard = new Keyboard(keyboardContainer.value, {
      onChange: (input) => {
        wifiPassword.value = input;
      },
      onKeyPress: (button) => {
        if (button === "{enter}") {
          passwordInput.value.blur();
          showKeyboard.value = false;
        }
      },
      layout: {
        default: [
          "1 2 3 4 5 6 7 8 9 0 {bksp}",
          "q w e r t y u i o p",
          "a s d f g h j k l",
          "z x c v b n m {enter}",
          "{space}",
        ],
      },
      display: {
        "{bksp}": "⌫",
        "{enter}": "⏎",
        "{space}": "Space",
      },
      theme: "hg-theme-default hg-layout-default",
    });
    keyboard.setInput(wifiPassword.value);
  }
});

onBeforeUnmount(() => {
  stopTimer();
  if (keyboard) {
    keyboard.destroy();
    keyboard = null;
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: #222;
  color: #eee;
  width: 400px;
  max-width: 90vw;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}
.modal-header {
  padding: 12px 16px;
  background: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
}
.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #eee;
  cursor: pointer;
}
.modal-body {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.connected-network {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.85); /* 흰색 반투명 */
  flex-wrap: wrap;
}
.wifi-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.timer {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.5); /* 검정 반투명 */
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9); /* 밝은 흰색 */
  user-select: none;
}
.available-networks h3 {
  margin-bottom: 8px;
}
.available-networks ul {
  max-height: 150px;
  overflow-y: auto;
  padding: 0;
  list-style: none;
  background: #111;
  border-radius: 6px;
  margin-bottom: 16px;
}
.available-networks li {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #eee;
  user-select: none;
  transition: background-color 0.2s;
}
.available-networks li:hover {
  background-color: #333;
}
.available-networks li.selected {
  background-color: rgba(0, 0, 0, 0.4); /* 검정 반투명 */
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}
label {
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}
.wifi-password-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #555;
  background: #111;
  color: #eee;
  outline: none;
  margin-bottom: 12px;
}
.wifi-password-input:focus {
  border-color: rgba(255, 255, 255, 0.7);
}
.keyboard-container {
  user-select: none;
  margin-bottom: 10px;
}
.modal-footer {
  background: #333;
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-save,
.btn-close {
  background-color: rgba(0, 0, 0, 0.6); /* 검정 반투명 */
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-save:hover,
.btn-close:hover {
  background-color: rgba(0, 0, 0, 0.85);
}
</style>
