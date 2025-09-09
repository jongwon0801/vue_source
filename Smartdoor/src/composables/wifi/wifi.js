// src/composables/wifi/wifi.js
import { inject, onMounted, onUnmounted, ref } from "vue";

export const wifiList = ref([]);
export const selectedWifi = ref("");
export const wifiPassword = ref("");
export const isWifiDialogOpen = ref(false);
export const isOffline = ref(false);
export const connectedWifi = ref("");

let wifiTimer = null;

export function useWifi() {
  const ws = inject("ws");

  // 세션스토리지에서 wifiList 복원
  const savedList = sessionStorage.getItem("wifiList");
  if (savedList) {
    try {
      wifiList.value = JSON.parse(savedList);
    } catch (e) {
      console.warn("세션스토리지 wifiList 파싱 오류", e);
    }
  }

  // 와이파이 목록 요청 함수
  function requestWifies() {
    if (ws?.value?.readyState === WebSocket.OPEN) {
      ws.value.send('{"request":"getWifies"}');
    }
    if (!wifiTimer) {
      wifiTimer = setTimeout(() => {
        wifiTimer = null;
      }, 3000);
    }
  }

  // 와이파이 목록 + 현재 연결 와이파이 상태 처리 함수
  function handleWifiListResponse(data) {
    if (data.wifi_lists && Array.isArray(data.wifi_lists)) {
      wifiList.value = data.wifi_lists;
      sessionStorage.setItem("wifiList", JSON.stringify(data.wifi_lists));
    }

    if (data.wifi && data.wifi.ssid) {
      connectedWifi.value = data.wifi.ssid;
    } else {
      connectedWifi.value = "";
    }
  }

  // 선택한 와이파이 SSID 변경 함수 (중요!)
  function setSelectedWifi(ssid) {
    selectedWifi.value = ssid;
  }

  // 와이파이 연결 요청 함수
  function setupWifiSave() {
    if (!selectedWifi.value) return;
    if (ws?.value?.readyState === WebSocket.OPEN) {
      ws.value.send(
        JSON.stringify({
          request: "setupWifiProcess",
          ssid: selectedWifi.value,
          passwd: wifiPassword.value,
        })
      );
    }
    isWifiDialogOpen.value = false;
  }

  // 와이파이 설정 완료 후 처리 함수
  function setupedWifiProcess(data) {
    alert("Wi-Fi 설정이 변경되었습니다.");
    location.reload();
  }

  // 오프라인 이벤트 핸들러
  function handleOffline() {
    isOffline.value = true;
    requestWifies();
  }

  // 온라인 이벤트 핸들러
  function handleOnline() {
    isOffline.value = false;
    if (ws?.value?.readyState === WebSocket.OPEN) {
      ws.value.send('{"request":"tornado_restart"}');
    }
  }

  onMounted(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
  });

  onUnmounted(() => {
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnline);
  });

  return {
    wifiList,
    selectedWifi,
    wifiPassword,
    isWifiDialogOpen,
    isOffline,
    connectedWifi,
    requestWifies,
    setupWifiSave,
    setupedWifiProcess,
    handleWifiListResponse,
    setSelectedWifi, // 반드시 포함
  };
}
