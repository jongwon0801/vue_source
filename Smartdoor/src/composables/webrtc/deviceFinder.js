// 하드코딩된 내부/외부 카메라 및 마이크 이름 (필요하면 수정)
export const INSIDE_CAM_NAME = "HD Camera";
export const OUTSIDE_CAM_NAME = "USB 4K Live Camera";
export const OUTSIDE_MIC_NAME = "USB 4K Live Camera  Mono";
// export const OUTSIDE_MIC_NAME = "default";
// export const INSIDE_MIC_NAME = "HD Camera Mono";  // 아직 없으니 주석 처리

/**
 * 카메라 이름으로 deviceId 찾기 (정확히 일치 → 대소문자 무시 → 부분 일치 순서)
 * @param {string} cameraName
 * @returns {Promise<string|null>}
 */
export async function findCameraDeviceIdByName(cameraName) {
  if (!cameraName) return null;

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
  } catch (err) {
    console.error('카메라 권한 요청 실패:', err);
    return null;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(d => d.kind === 'videoinput');

  // 1. 정확히 일치 시도
  let found = videoDevices.find(d => d.label === cameraName);

  // 2. 대소문자 무시 정확히 일치
  if (!found) {
    found = videoDevices.find(d => d.label.toLowerCase() === cameraName.toLowerCase());
  }

  // 3. 부분 일치, 대소문자 무시
  if (!found) {
    found = videoDevices.find(d =>
      d.label.toLowerCase().includes(cameraName.toLowerCase())
    );
  }

  if (found) {
    console.log(`[findCameraDeviceIdByName] 찾음: ${found.label}, deviceId: ${found.deviceId}`);
    return found.deviceId;
  } else {
    console.warn(`[findCameraDeviceIdByName] '${cameraName}' 이름의 카메라를 찾지 못함`);
    return null;
  }
}

/**
 * 마이크 이름으로 deviceId 찾기 (정확히 일치 → 대소문자 무시 → 부분 일치 순서)
 * 못 찾으면 "default" 반환
 * @param {string} micName
 * @returns {Promise<string>}
 */
export async function findMicDeviceIdByName(micName) {
  if (!micName) return 'default';  // 기본값 fallback

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('마이크 권한 요청 실패:', err);
    return 'default';
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter(d => d.kind === 'audioinput');

  // 1. 정확히 일치 시도
  let found = audioDevices.find(d => d.label === micName);

  // 2. 대소문자 무시 정확히 일치
  if (!found) {
    found = audioDevices.find(d => d.label.toLowerCase() === micName.toLowerCase());
  }

  // 3. 부분 일치, 대소문자 무시
  if (!found) {
    found = audioDevices.find(d =>
      d.label.toLowerCase().includes(micName.toLowerCase())
    );
  }

  if (found) {
    console.log(`[findMicDeviceIdByName] 찾음: ${found.label}, deviceId: ${found.deviceId}`);
    return found.deviceId;
  } else {
    console.warn(`[findMicDeviceIdByName] '${micName}' 이름의 마이크를 찾지 못함. 기본 마이크 사용`);
    return 'default';  // ✅ 못 찾았을 때 fallback
  }
}
