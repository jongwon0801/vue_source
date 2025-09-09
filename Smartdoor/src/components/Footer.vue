<template>
  <div>
    <div id="loading" v-show="loading">
      <img :src="loadingImg" alt=""/>
      잠시만 기다려주세요.
    </div>
    <div id="alert" class="dialog" v-show="alertVisible">
      <div class="head">
        <span><a href="#" @click.prevent="closeAlert">닫기</a></span>
      </div>
      <div class="body">{{ alertMessage }}</div>
    </div>

    <div id="audio" style="display: none;">
      <audio id="bell" preload="auto" src="/sound/bell.wav" controls loop></audio>
      <audio id="loginaudio" preload="auto" src="/sound/login.mp3" controls></audio>
      <audio id="openaudio" preload="auto" src="/sound/open.mp3" controls></audio>
    </div>
  </div>
</template>

<script setup>
import loadingImg from '@/assets/image/icon/loading.gif'; // 이건 Vue 내 이미지이므로 유지
import { ref } from 'vue';

const loading = ref(false);
const alertVisible = ref(false);
const alertMessage = ref('');

function closeAlert() {
  loading.value = false;
  alertVisible.value = false;
}
</script>
