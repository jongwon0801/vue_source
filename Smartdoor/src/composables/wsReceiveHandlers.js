// src/composables/wsReceiveHandlers.js
import {
  outCameraOff,
  outCameraOn,
} from "@/composables/camera/outCameraSession";
import { handleBusResponse } from "@/composables/contents/bus";
import { handleNoticeResponse } from "@/composables/contents/notice";
import { showQrModal } from "@/composables/contents/QrRegister";
import { handleScheduleResponse } from "@/composables/contents/schedule";
import { handleWeatherResponse } from "@/composables/contents/weather";
import { useScreen } from "@/composables/screen/useScreen";
import { useMainLoader } from "@/composables/useMainLoader";
import { useUser } from "@/composables/user/useUser";
import { videoCallJoined } from "@/composables/webrtc/videoCallHandlers";

import {
  setupedWifiProcess,
  setupWifi,
  setupWifiFailed,
} from "@/composables/wifi/wifiReceiveHandlers";

const { displayUsers, setUser } = useUser();

// setup composables
const { screenOned, screenOffed } = useScreen();
const { gomain } = useMainLoader();

export function handleWebSocketMessage(data) {
  const { response } = data;

  switch (response) {
    case "refresh":
      location.href = "/";
      break;

    case "gomain":
      gomain(data.data);
      break;

    // 와이파이 관련
    case "setupWifi":
      setupWifi(data.data);
      break;

    case "setupedWifiProcess":
      setupedWifiProcess(data.data);
      break;

    case "setupWifiFailed":
      setupWifiFailed(data.data);
      break;

    case "setupOwner":
      setupOwner(data.data);
      break;

    case "doorOpenSuccess":
      doorOpenSuccess();
      break;

    case "doorOpenFail":
      doorOpenFail();
      break;

    case "doorbellPushProcess":
      doorbellPushProcess();
      break;

    case "doorcloserOpened":
      doorcloserOpened(data.data);
      break;

    case "savedVod":
      savedVod(data.data);
      break;

    case "removeAllOver":
      removeAllOver();
      break;

    case "doorOpened":
      doorOpened(data.data);
      break;

    case "doorClosed":
      doorClosed(data.data);
      break;

    case "displayFolders":
      displayFolders(data.data);
      break;

    case "displayFiles":
      displayFiles(data.data);
      break;

    case "outCameraOn":
      outCameraOn(data.data);
      break;

    case "outCameraOff":
      outCameraOff(data.data);
      break;

    case "inCameraOn":
      inCameraOn(data.data);
      break;

    case "inCameraOff":
      inCameraOff(data.data);
      break;

    case "inCameraClose":
      inCameraClose();
      break;

    case "resetUser":
      resetUser();
      break;

    case "faceLogined":
      faceLogined(data.data);
      break;

    case "faceLoginFail":
      faceLoginFail(data.data);
      break;

    case "faceDoorOpened":
      faceDoorOpened(data.data);
      break;

    case "qrDoorOpened":
      qrDoorOpened(data.data);
      break;

    case "faceDoorOpenFail":
      faceDoorOpenFail(data.data);
      break;

    case "playSound":
      playSound(data.deviceId, data.soundFiles);
      break;

    // 아이템 업데이트
    case "setItem":
      setItem(); // QR 모달 열기
      break;

    // 아이템 가져오기
    case "displayItems":
      displayItems(); // QR 모달 열기
      break;

    // 큐알 오너 등록 관련
    case "showQr":
      showQrModal(); // QR 모달 열기
      break;

    // 통화 관련
    case "videoCallJoined":
      videoCallJoined(data.data);
      break;

    // 사용자 업데이트 관련
    case "setUser":
      setUser(data.data);
      break;

    // 사용자 보여주기 관련
    case "displayUsers":
      displayUsers(data.data);
      break;

    // 스크린 관련
    case "screenOned":
      screenOned(data.data);
      break;

    case "screenOffed":
      screenOffed(data.data);
      break;

    // main contents 업데이트
    case "responseBusStopList":
      handleBusResponse(data.data);
      break;

    case "setNotice":
      handleNoticeResponse(data.data);
      break;

    case "setWeather":
      handleWeatherResponse(data.data);
      break;

    case "setSchedule":
      handleScheduleResponse(data.data);
      break;

    default:
      console.warn("[WebSocket] Unknown response:", response, data);
  }
}
