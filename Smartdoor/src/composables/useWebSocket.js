import { handleWebSocketMessage } from "@/composables/wsReceiveHandlers";
import { ref, watch } from "vue";

export const shouldReconnect = ref(true); // 기본값 true로 설정

export function useWebSocket(url) {
  const ws = ref(null);
  const isConnected = ref(false);

  let reconnectAttempts = 0;
  let reconnectTimeout = null;

  function connect() {
    if (!shouldReconnect.value) {
      console.log("[WebSocket] connect() aborted: shouldReconnect = false");
      return;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (
      ws.value &&
      (ws.value.readyState === WebSocket.OPEN ||
        ws.value.readyState === WebSocket.CONNECTING)
    ) {
      console.log("[WebSocket] already connected or connecting");
      return;
    }

    console.log("[WebSocket] connecting to", url);
    ws.value = new WebSocket(url);

    ws.value.onopen = () => {
      console.log("[WebSocket] Connected");
      isConnected.value = true;
      reconnectAttempts = 0;
    };

    ws.value.onclose = (event) => {
      console.log("[WebSocket] Closed:", event.reason || "no reason");
      isConnected.value = false;

      if (shouldReconnect.value) {
        if (!reconnectTimeout) {
          reconnectAttempts += 1;
          const delay = Math.min(10000, 1000 * reconnectAttempts);

          console.log(
            `[WebSocket] Reconnecting in ${delay}ms (attempt #${reconnectAttempts})`
          );

          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            if (!shouldReconnect.value) {
              console.log(
                "[WebSocket] Reconnect cancelled before timeout (shouldReconnect = false)"
              );
              return;
            }
            connect();
          }, delay);
        } else {
          console.log("[WebSocket] Reconnect already scheduled");
        }
      } else {
        console.log("[WebSocket] 재연결 중단됨 (shouldReconnect = false)");
      }
    };

    ws.value.onerror = (e) => {
      console.error("[WebSocket] Error:", e);
    };

    ws.value.onmessage = (event) => {
      console.log("[WebSocket] raw event.data:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] Parsed message:", data);
        handleWebSocketMessage(data);
      } catch (e) {
        console.warn("[WebSocket] JSON parse error:", e);
        console.log("[WebSocket] Raw message:", event.data);
      }
    };
  }

  // shouldReconnect가 true로 변할 때 자동 연결 시도
  watch(shouldReconnect, (newVal) => {
    if (newVal && !isConnected.value) {
      console.log("[WebSocket] shouldReconnect가 true로 바뀌어 connect 호출");
      connect();
    }
  });

  return {
    ws,
    isConnected,
    shouldReconnect,
    connect,
  };
}
