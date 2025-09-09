<template>
  <div id="smartdoor_join">
    <div class="head">
      <h1>제품 등록</h1>
      <span><a href="#" @click.prevent="init">뒤로</a></span>
    </div>

    <form @submit.prevent="saveSmartdoor">
      <div class="body">
        <ul class="form">
          <li>
            <label>제품</label>
            <span>Hizib 스마트도어</span>
          </li>
          <li>
            <label>Serial Number</label>
            <span>
              <input
                type="text"
                name="code"
                v-model="code"
                placeholder="제품일련번호를 입력하세요."
                autocomplete="off"
                class="js-virtual-keyboard"
              />
            </span>
          </li>
        </ul>
      </div>

      <div class="foot">
        <span><a href="#" @click.prevent="init">취소</a></span>
        <input type="submit" value="저장" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'

const ws = inject('ws')
const code = ref('')

function saveSmartdoor() {
  document.getElementById('loading')?.style.setProperty('display', 'block')
  ws?.value?.send(JSON.stringify({ request: 'saveSmartdoor', code: code.value }))
}

// function savedSmartdoor() {
//   document.getElementById('loading')?.style.setProperty('display', 'none')
//   document.getElementById('smartdoor_join')?.remove()
//   ws?.value?.send(JSON.stringify({ request: 'init' }))
// }

function init() {
  ws?.value?.send(JSON.stringify({ request: 'init' }))
  // 또는 router.push('/') 등으로 페이지 이동 가능
}

onMounted(() => {
  if (!document.getElementById('main')) {
    // "뒤로" 링크와 관련된 동작은 이제 Vue 이벤트로 대체됨
  }

  if (window.KioskBoard) {
    KioskBoard.run('.js-virtual-keyboard')
  }
})
</script>
