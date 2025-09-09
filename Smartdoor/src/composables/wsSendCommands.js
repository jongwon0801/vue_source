import { inject } from "vue";

export function useWsSendCommands() {
  const wsRef = inject("ws"); // ref 형태로 주입됨
  const messageQueue = [];

  function getWebSocket() {
    return wsRef?.value || null;
  }

  function flushQueue() {
    const ws = getWebSocket();
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      ws.send(msg);
      console.log("[WebSocket] Flushed queued message:", msg);
    }
  }

  function waitForWebSocketReady() {
    return new Promise((resolve) => {
      const ws = getWebSocket();
      if (ws && ws.readyState === WebSocket.OPEN) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          const ws = getWebSocket();
          if (ws && ws.readyState === WebSocket.OPEN) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  }

  let hasSentInit = false; // init 중복 전송 방지 플래그

  const ws = wsRef?.value;

  if (ws && ws.readyState !== WebSocket.OPEN) {
    ws.onopen = () => {
      console.log("[WebSocket] Connection opened. Flushing queue...");
      if (!hasSentInit) {
        sendIfReady({ request: "init" });
        flushQueue();
        hasSentInit = true;
      }
    };
  }

  function sendIfReady(msgObj) {
    const ws = getWebSocket();
    const message =
      typeof msgObj === "string" ? msgObj : JSON.stringify(msgObj);

    try {
      console.log("[WebSocket 전송 시도]");
      console.log("getWebSocket():", ws);
      console.log("전송할 메시지:", message);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        console.log("[WebSocket 전송 완료]");
      } else {
        console.warn("[WebSocket Not ready] 상태:", ws?.readyState);
        messageQueue.push(message);
      }
    } catch (err) {
      console.error("[WebSocket 전송 에러]", err);
    }
  }

  // 명령 함수들
  function wslog(msg) {
    sendIfReady({ request: "log", data: { message: msg } });
    console.log(msg);
  }

  function requestWifies() {
    sendIfReady({ request: "getWifies" });
  }

  function screenOn() {
    wslog("스크린 켜기 요청 전송");
    sendIfReady({ request: "screenOn" });
  }

  function screenOff() {
    wslog("스크린 끄기 요청 전송");
    sendIfReady({ request: "screenOff" });
  }

  function doorOpenProcess() {
    sendIfReady({ request: "doorOpenByKioskProcess" });
  }

  function doorCloseProcess() {
    sendIfReady({ request: "doorCloseByKioskProcess" });
  }

  function motionDetected() {
    sendIfReady({ request: "motionDetectProcess" });
  }

  function doorlockStatusProcess() {
    sendIfReady({ request: "doorlockStatusProcess" });
  }

  function faceLoginProcess(base64Image) {
    sendIfReady({
      request: "faceLoginByDataProcess",
      data: { file: base64Image },
    });
  }

  function requestPlaySoundUserView(user_id) {
    sendIfReady({ request: "playSoundUserView", user_id });
  }

  function requestStopSoundUserView(user_id) {
    sendIfReady({ request: "stopSoundUserView", user_id });
  }

  async function requestDoorOpenByPicture(base64Image) {
    if (!base64Image) return;
    sendIfReady({
      request: "doorOpenByPicture",
      data: { file: base64Image },
    });
  }

  // QR 생성 요청
  function requestQrUpdate() {
    sendIfReady({ request: "generateQRCode" });
  }

  // 단일 유저 정보 요청
  // function requestGetUser(user_id) {
  //   sendIfReady({ request: "getUser", user_id });
  // }

  // 여러 유저 정보 요청
  function requestGetUsers() {
    sendIfReady({ request: "getUsers" });
  }

  function requestUserUpdate() {
    sendIfReady({ request: "userUpdate" });
  }

  // 아이템 관련
  function requestItemUpdate(user_id) {
    sendIfReady({ request: "itemUpdate", user_id });
  }

  function requestGetItems(user_id) {
    sendIfReady({ request: "getItems", user_id });
  }

  // function requestGetMessage(user_id) {
  //   sendIfReady({ request: "getMessages", user_id });
  // }

  // main contents 요청
  function requestBusStopList() {
    sendIfReady({ request: "busStopList" });
  }

  function requestNoticeUpdate() {
    sendIfReady({ request: "noticeUpdate" });
  }

  function requestScheduleUpdate() {
    sendIfReady({ request: "scheduleUpdate" });
  }

  function requestWeatherUpdate() {
    sendIfReady({ request: "weatherUpdate" });
  }

  return {
    getWebSocket,
    waitForWebSocketReady,
    wslog,
    requestWifies,
    screenOn,
    screenOff,
    doorOpenProcess,
    doorCloseProcess,
    motionDetected,
    doorlockStatusProcess,
    faceLoginProcess,
    // requestGetUser,
    requestGetUsers,
    requestUserUpdate,
    // requestGetMessage,
    requestGetItems,
    requestItemUpdate,
    requestPlaySoundUserView,
    requestStopSoundUserView,
    requestDoorOpenByPicture,
    requestQrUpdate,
    requestBusStopList,
    requestNoticeUpdate,
    requestScheduleUpdate,
    requestWeatherUpdate,
  };
}
