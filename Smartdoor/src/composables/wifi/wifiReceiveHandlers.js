import { useWifi } from "@/composables/wifi/wifi";

const { connectedWifi, isWifiDialogOpen, requestWifies, wifiList } = useWifi();

let wifiTimer = null;

export function setupWifi(data) {
  console.log("setupWifi", data);

  if (data.wifi_lists) {
    wifiList.value = data.wifi_lists;
  }

  if (data.wifi && data.wifi.ssid) {
    connectedWifi.value = data.wifi.ssid;
  } else {
    connectedWifi.value = "";
  }

  isWifiDialogOpen.value = true;
}

export function setupedWifiProcess(data) {
  clearInterval(wifiTimer);

  alert("Wi-Fi 설정이 변경되었습니다.");

  isWifiDialogOpen.value = false;

  sessionStorage.setItem("wifi", JSON.stringify(data));

  wifiTimer = setInterval(() => {
    requestWifies();
  }, 1000);
}

export function setupWifiFailed(data) {
  console.warn("Wi-Fi setup failed", data);
  // 필요 시 에러 상태 UI 처리
}
