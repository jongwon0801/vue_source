import { useScreen } from '@/composables/screen/useScreen';
import { ref } from 'vue';

export function useMainLoader() {
  const { screenOned, settings } = useScreen();

  const pirInsidePin = ref(null);
  const doorCloser = ref(null);
  const bell = ref(null);
  const pir = ref(null);
  const doorLock = ref(null);
  const isMainVisible = ref(false);

  // 추가된 설정값들
  const insideCamDeviceName = ref(null);
  const outsideCamDeviceName = ref(null);
  const recordSetting = ref(null);
  const isShowInsideCam = ref(false);
  const isShowOutsideCam = ref(false);

  async function gomain(data) {
    if (!data) {
      const res = await fetch('/settings.json');
      settings.value = await res.json();
    } else {
      settings.value = data;
    }

    screenOned();

    // 기본 설정
    pirInsidePin.value = settings.value.pir_inside?.pin || null;
    doorCloser.value = settings.value.doorcloser || null;
    bell.value = settings.value.bell || null;
    pir.value = settings.value.pir_outside || null;
    doorLock.value = settings.value.doorlock || null;

    // 추가 설정 저장
    insideCamDeviceName.value = settings.value.insideCamDeviceName || null;
    outsideCamDeviceName.value = settings.value.outsideCamDeviceName || null;
    recordSetting.value = settings.value.record || null;
    isShowInsideCam.value = settings.value.isShowInsideCam || false;
    isShowOutsideCam.value = settings.value.isShowOutsideCam || false;

    // QR 숨기기
    const qr = document.getElementById('qr');
    if (qr) qr.style.display = 'none';

    isMainVisible.value = true;
  }

  return {
    gomain,
    isMainVisible,
    pirInsidePin,
    doorCloser,
    bell,
    pir,
    doorLock,

    // 추가된 반환값
    insideCamDeviceName,
    outsideCamDeviceName,
    recordSetting,
    isShowInsideCam,
    isShowOutsideCam
  };
}
