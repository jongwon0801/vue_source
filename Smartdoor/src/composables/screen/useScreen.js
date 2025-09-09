// composables/screen/useScreen.js
import { useUser } from "@/composables/user/useUser";
import { useWsSendCommands } from "@/composables/wsSendCommands";
import { ref } from "vue";

// useScreen()처럼 Vue 컴포지션 API 스타일은 캡슐화 구조에 적합
export function useScreen() {
  const screenTimer = ref(null);
  const screenTime = ref(null);
  const settings = ref({
    screen: 30, // 기본 30초
  });

  const { resetUser } = useUser();
  const { screenOn, screenOff, waitForWebSocketReady } = useWsSendCommands();

  function formatDate(date) {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  }

  async function screenOned(data) {
    if (!settings.value.screen) settings.value.screen = 30;
    if (!screenTime.value) screenTime.value = new Date();

    const now = new Date();
    console.log(
      "screenOned : " +
        formatDate(now) +
        ` (${settings.value.screen}) 갭 : ${Math.floor(
          (now - screenTime.value) / 1000
        )}`
    );

    clearTimeout(screenTimer.value);
    screenTimer.value = null;
    screenTime.value = now;

    // WebSocket 연결이 준비될 때까지 기다린 후 타이머 시작
    await waitForWebSocketReady();

    screenTimer.value = setTimeout(() => {
      screenOff();
    }, settings.value.screen * 1000);
  }

  function screenOffed(data) {
    resetUser();
  }

  // 추후 추가
  // function touchActivity() {
  //   screenOn()
  //   screenOned()
  // }

  return {
    screenOned,
    screenOffed,
    screenOff,
    settings,
    screenOn,
    // touchActivity,  // 👈 새로 추가
  };
}
