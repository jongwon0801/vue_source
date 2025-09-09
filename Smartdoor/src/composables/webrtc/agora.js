import { shouldReconnect } from "@/composables/useWebSocket";
import AgoraRTC from "agora-rtc-sdk-ng";
import { markRaw, reactive, ref } from "vue";

import {
  OUTSIDE_CAM_NAME,
  OUTSIDE_MIC_NAME,
  findCameraDeviceIdByName,
  findMicDeviceIdByName,
} from "./deviceFinder";

const WEBRTC_PROFILE = "480p";

export function agora() {
  const isVideoCalling = ref(false);
  const isInit = ref(false);
  const client = ref(null);

  const localTracks = reactive({
    videoTrack: null,
    audioTrack: null,
  });

  const options = reactive({
    appid: null,
    channel: null,
    uid: null,
    token: null,
  });

  const remoteUsers = {};
  let webrtcTimer = null;
  let stopping = false;

  async function initDevices() {
    try {
      const camDeviceId = await findCameraDeviceIdByName(OUTSIDE_CAM_NAME);
      const micDeviceId = await findMicDeviceIdByName(OUTSIDE_MIC_NAME);

      if (!camDeviceId) throw new Error("카메라 정보를 찾을 수 없습니다.");
      if (!micDeviceId) throw new Error("마이크 정보를 찾을 수 없습니다.");

      localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: WEBRTC_PROFILE,
        cameraId: camDeviceId,
      });
      await delay(1000); // 안정화 대기

      const videoTrack = localTracks.videoTrack?.getTrack?.();
      console.log("videoTrack readyState:", videoTrack?.readyState);
      console.log("videoTrack enabled:", localTracks.videoTrack?.enabled);

      localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "music_standard",
        microphoneId: micDeviceId,
      });
    } catch (error) {
      console.error("[initDevices] 장치 초기화 실패:", error);
      throw error;
    }
  }

  async function publishTracksWithRetry(tracks, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await client.value.publish(tracks);
        console.log("[publishTracksWithRetry] 퍼블리시 성공");
        return true;
      } catch (err) {
        console.warn(`[퍼블리시 실패 ${i + 1}/${retries}]:`, err.message);
        await delay(1000);
      }
    }
    throw new Error("트랙 퍼블리시 실패");
  }

  async function agoraStart({ appid, channel, token }) {
    if (isInit.value) {
      console.warn("이미 초기화된 상태입니다.");
      return;
    }

    if (!token) throw new Error("Agora token이 필요합니다.");

    if (!client.value) {
      client.value = markRaw(
        AgoraRTC.createClient({ mode: "rtc", codec: "h264" })
      );
      client.value.on("user-published", handleUserPublished);
      client.value.on("user-unpublished", handleUserUnpublished);
    }

    try {
      const uid = await client.value.join(appid, channel, token);
      Object.assign(options, { appid, channel, token, uid });
      console.log("[agoraStart] join 성공, uid:", uid);

      // ✅ join 이후에 디바이스 초기화
      await initDevices();
      await delay(1000);

      const tracksToPublish = [
        localTracks.audioTrack,
        localTracks.videoTrack,
      ].filter(Boolean);

      if (tracksToPublish.length === 0)
        throw new Error("Publish할 트랙이 없습니다.");

      await publishTracksWithRetry(tracksToPublish);

      isVideoCalling.value = true;
      isInit.value = true;
    } catch (error) {
      console.error("[agoraStart] 초기화 실패:", error);
      throw error;
    }
  }

  async function agoraStop() {
    if (stopping) {
      console.log("이미 정지 중입니다.");
      return;
    }
    stopping = true;

    try {
      if (client.value) {
        await client.value.leave();
        client.value.removeAllListeners();
        client.value = null;
        console.log("[agoraStop] client 종료 완료");
      }

      await stopLocalTracks();
      await forceStopBrowserTracks();

      isVideoCalling.value = false;
      isInit.value = false;
    } catch (error) {
      console.warn("[agoraStop] 종료 중 오류 발생:", error);
    } finally {
      stopping = false;
    }
  }

  async function stopLocalTracks() {
    for (const key in localTracks) {
      const track = localTracks[key];
      if (track) {
        try {
          track.stop();
          if (typeof track.close === "function") track.close();
          const mediaTrack = track.getTrack?.();
          if (mediaTrack?.stop) mediaTrack.stop();
        } catch (e) {
          console.warn(`[${key}] 트랙 정지 실패:`, e.message);
        }
        localTracks[key] = null;
      }
    }
  }

  async function forceStopBrowserTracks() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((t) => t.stop());
      console.log("[agoraStop] 브라우저 트랙 강제 정지 완료");
    } catch {
      // 권한 거부 시 무시
    }
  }

  async function subscribeWithRetry(user, mediaType, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        await client.value.subscribe(user, mediaType);
        return true;
      } catch (err) {
        console.warn(
          `[구독 실패 ${i + 1}/${retries}] UID=${user.uid}, 이유: ${
            err.message
          }`
        );
        await delay(500);
      }
    }
    return false;
  }

  async function handleUserPublished(user, mediaType) {
    console.log(`[user-published] UID=${user.uid}, type=${mediaType}`);
    remoteUsers[user.uid] = user;

    if (webrtcTimer) {
      clearTimeout(webrtcTimer);
      webrtcTimer = null;
    }

    if (mediaType !== "audio") return;

    await delay(500);
    const success = await subscribeWithRetry(user, mediaType);

    if (success && remoteUsers[user.uid]?.audioTrack) {
      remoteUsers[user.uid].audioTrack.play();
      console.log(`[handleUserPublished] 오디오 트랙 재생 시작: ${user.uid}`);
    } else {
      console.warn("[handleUserPublished] 오디오 트랙 없음 또는 재생 실패");
    }
  }

  async function handleUserUnpublished(user) {
    console.log(`[handleUserUnpublished] UID=${user.uid} publish 해제됨`);
    delete remoteUsers[user.uid];

    if (webrtcTimer) clearTimeout(webrtcTimer);

    webrtcTimer = setTimeout(async () => {
      console.log("[handleUserUnpublished] 1초 후 agoraStop 실행");
      await agoraStop();
      shouldReconnect.value = true;
      webrtcTimer = null;
    }, 1000);
  }

  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // 디바이스 변경 감지
  navigator.mediaDevices.ondevicechange = async () => {
    console.log("[DeviceChange] 디바이스 변경 감지됨, 재초기화 시도");
    await initDevices();
  };

  return {
    isVideoCalling,
    isInit,
    options,
    localTracks,
    agoraStart,
    agoraStop,
    handleUserPublished,
    handleUserUnpublished,
  };
}
