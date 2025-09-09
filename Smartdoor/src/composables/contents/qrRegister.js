import { ref } from "vue";

// QR 모달 상태
export const isVisible = ref(false);
export const isLoading = ref(false);
export const qrImageSrc = ref("");

// 모달 열기
export function showQrModal(imageUrl = "/image/qrcode.png") {
  isVisible.value = true;
  isLoading.value = true;

  // 캐시 방지용 쿼리스트링
  const newSrc = imageUrl + "?ver=" + Date.now();
  const img = new Image();
  img.src = newSrc;
  img.onload = () => {
    qrImageSrc.value = newSrc;
    isLoading.value = false;
  };
  img.onerror = () => {
    console.error("QR 이미지 로드 실패");
    isLoading.value = false;
  };
}

// 모달 닫기
export function hideQrModal() {
  isVisible.value = false;
  qrImageSrc.value = "";
  isLoading.value = false;
}
