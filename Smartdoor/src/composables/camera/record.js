import RecordRTC from 'recordrtc';
import { ref } from 'vue';

const recordStream = ref(null);
const recorder = ref(null);
const currentStatus = ref(0);

const inRecordStream = ref(null);
const inRecorder = ref(null);
const inCurrentStatus = ref(0);

const isRecordDebug = true;

// 내부/외부 카메라 이름 직접 지정 (필요에 따라 수정하세요)
const INSIDE_CAM_NAME = "HD Camera";
const OUTSIDE_CAM_NAME = "USB 4K Live Camera";

/** cameraName 으로 deviceId 찾기 */
async function findDeviceIdByName(cameraName) {
  if (!cameraName) return null;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === 'videoinput');

  // 1. 정확히 일치 시도
  let found = videoDevices.find(d => d.label === cameraName);

  // 2. 대소문자 무시 정확히 일치
  if (!found) {
    found = videoDevices.find(d => d.label.toLowerCase() === cameraName.toLowerCase());
  }

  // 3. label에 cameraName 포함 여부 (부분 일치) 대소문자 무시
  if (!found) {
    found = videoDevices.find(d =>
      d.label.toLowerCase().includes(cameraName.toLowerCase())
    );
  }


  if (isRecordDebug) {
    console.log('[findDeviceIdByName] device list:', videoDevices.map(d => d.label));
    console.log('[findDeviceIdByName] search name:', cameraName);
    console.log('[findDeviceIdByName] found deviceId:', found ? found.deviceId : null);
  }

  return found ? found.deviceId : null;
}


/** 외부 카메라 시작 - 내부에서 카메라 이름 사용 */
async function outCameraStart(videoElement) {
  if (currentStatus.value === 1) return;

  try {
    const deviceId = await findDeviceIdByName(OUTSIDE_CAM_NAME);
    if (!deviceId) throw new Error('deviceId를 찾을 수 없음');

    const constraints = {
      video: { deviceId: { exact: deviceId } },
      audio: false,
    };

    recordStream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement) {
      videoElement.srcObject = recordStream.value;
      videoElement.play?.();
    }

    currentStatus.value = 1;

    if (isRecordDebug) console.log('[outCameraStart] started with', deviceId);
  } catch (e) {
    console.error('외부 카메라 접근 실패:', e);
  }
}

/** 외부 카메라 중지 */
function outCameraStop(videoElement) {
  if (recordStream.value) {
    recordStream.value.getTracks().forEach(track => track.stop());
    recordStream.value = null;
  }

  if (videoElement?.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }

  currentStatus.value = 0;
  if (isRecordDebug) console.log('[outCameraStop] stopped');
}

/** 내부 카메라 시작 - 내부에서 카메라 이름 사용 */
async function inCameraStart(videoElement) {
  if (inCurrentStatus.value === 1) return;

  try {
    const deviceId = await findDeviceIdByName(INSIDE_CAM_NAME);
    if (!deviceId) throw new Error('deviceId를 찾을 수 없음');

    const constraints = {
      video: { deviceId: { exact: deviceId } },
      audio: false,
    };

    inRecordStream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement) {
      videoElement.srcObject = inRecordStream.value;
      videoElement.play?.();
    }

    inCurrentStatus.value = 1;
    if (isRecordDebug) console.log('[inCameraStart] started with', deviceId);
  } catch (e) {
    console.error('내부 카메라 접근 실패:', e);
  }
}

/** 내부 카메라 중지 */
function inCameraStop(videoElement) {
  if (inRecordStream.value) {
    inRecordStream.value.getTracks().forEach(track => track.stop());
    inRecordStream.value = null;
  }

  if (videoElement?.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }

  inCurrentStatus.value = 0;
  if (isRecordDebug) console.log('[inCameraStop] stopped');
}

/** 녹화 시작 */
function recordStart() {
  if (currentStatus.value !== 1 || recorder.value) return;
  if (isRecordDebug) console.log('recordStart');

  recorder.value = new RecordRTC(recordStream.value, { type: 'video' });
  recorder.value.startRecording();
}

/** 녹화 중지 및 서버 전송 */
function recordStop(ws) {
  if (!recorder.value) return;

  recorder.value.stopRecording(() => {
    const blob = recorder.value.getBlob();
    const now = new Date();
    const fileName = `${now.getHours()}${now.getMinutes()}.mp4`;
    const fileObject = new File([blob], fileName, { type: 'video/mp4' });

    blobToBase64(fileObject).then(base64 => {
      const msg = JSON.stringify({ request: 'saveVod', data: { file: base64 } });
      ws.send(msg);
    });

    recorder.value.destroy();
    recorder.value = null;
  });
}

/** 사진 찍기 */
function outCameraTakePicture(videoElement, width, height) {
  if (currentStatus.value === 0 || !recordStream.value) return null;

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.translate(width / 2, height / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(videoElement, -width / 2, -height / 2, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (e) {
      reject(e);
    }
  });
}

/** blob → base64 변환 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export {
  currentStatus,
  inCameraStart,
  inCameraStop,
  inCurrentStatus,
  outCameraStart,
  outCameraStop,
  outCameraTakePicture,
  recordStart,
  recordStop
};
