import {
  currentStatus,
  outCameraStart,
  outCameraStop,
  recordStart,
  recordStop
} from '@/composables/camera/record'

// 카메라 및 사진 표시 상태 변수 없이 순수 기능만 제어

let doorTimer = null
let outCameraTimer = null

// outCameraOn()처럼 단일 책임/전역 상태 기반 제어는 개별 export가 더 명확
export async function outCameraOn(settings) {
  console.log('[camera] outCameraOn')

  clearTimeout(doorTimer)
  doorTimer = setTimeout(() => {
    outCameraOff()
  }, (settings?.pir_outside?.times ?? 20) * 1000) // 기본 20초

  // 현재 카메라 상태가 사용 중이면 중복 실행 방지
  if (currentStatus.value !== 0) return

  await outCameraStart()

  if (!isQrFace) {
    requestDoorOpenByPicture()
  } else if (settings?.record?.isUse) {
    recordStart()
  }

  currentStatus.value = 1
}

export function outCameraOff() {
  clearTimeout(outCameraTimer)
  outCameraTimer = null

  // 더 이상 카메라가 켜져있는지 확인하는 로직이 필요 없으니 바로 종료 처리
  if (currentStatus.value === 0) return

  if (recorder) recordStop()
  outCameraStop()
  currentStatus.value = 0
}
