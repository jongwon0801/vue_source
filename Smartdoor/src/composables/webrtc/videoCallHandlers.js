// WebRTC 통화 처리
import { agora } from "@/composables/webrtc/agora";

// 📡 웹소켓 객체 가져오기 (shouldReconnect 포함)
import { shouldReconnect } from "@/composables/useWebSocket";

// Agora composable에서 필요한 함수/변수 가져오기
const { agoraStart, isVideoCalling } = agora();

// ✅ HTTP POST로 메시지 직접 전송 함수
async function sendMsgHttp(topic, response, data) {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/send-mqtt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resTopic: topic,
        response,
        data,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("sendMsgHttp 요청 실패:", text);
    }
  } catch (e) {
    console.error("sendMsgHttp 예외 발생:", e);
  }
}

// ✅ 통화 가능 메시지 HTTP 전송
function sendMsgAvailableVideoCallDirect(topic) {
  return sendMsgHttp(topic, "webrtcChannelJoin", { result: true });
}

// ✅ 통화 불가 메시지 HTTP 전송
function sendMsgNotAvailableVideoCallDirect(
  topic,
  message = "통화중입니다. 잠시후 다시 이용해 주세요."
) {
  return sendMsgHttp(topic, "calling", {
    result: false,
    message,
  });
}

// ▶️ 통화 시작 처리 함수
export async function videoCallJoined(data) {
  console.log("[videoCallJoined] 함수 호출됨, 전달받은 data:", data);

  if (isVideoCalling.value) {
    console.warn("[videoCallJoined] 이미 통화 중입니다.");
    try {
      await sendMsgNotAvailableVideoCallDirect(data.resTopic);
    } catch (err) {
      console.error("[videoCallJoined] 중복 요청 응답 실패:", err);
    }
    return;
  }

  // ✅ 통화 시작 전 웹소켓 재연결 중단
  shouldReconnect.value = false;
  console.log("[WebSocket] 재연결 플래그 false로 설정 (stopReconnect)");
  console.log("[shouldReconnect.value 상태 값] =", shouldReconnect.value);

  const options = {
    appid: data.appID,
    channel: data.channelName,
    token: data.token,
  };

  try {
    console.log("[videoCallJoined] Agora 통화 시작");
    await agoraStart(options); // 내부에서 UID 자동 할당

    console.log("[videoCallJoined] 통화 가능 메시지 HTTP 전송");
    await sendMsgAvailableVideoCallDirect(data.resTopic);
  } catch (error) {
    console.error("[videoCallJoined] 오류 발생:", error);

    try {
      await sendMsgNotAvailableVideoCallDirect(data.resTopic);
    } catch (sendErr) {
      console.error("[videoCallJoined] 통화 불가 메시지 전송 실패:", sendErr);
    }
  } finally {
    // 통화 종료 시점에 아래 호출 필요 (해당 위치는 다른 곳에서 수행)
    // shouldReconnect.value = true;
  }
}
