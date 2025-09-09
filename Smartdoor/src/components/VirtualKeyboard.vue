<template>
  <div>
    <input
      v-model="input"
      placeholder="여기에 입력하세요"
      @focus="keyboard.setInput(input)"
      type="text"
    />
    <div ref="keyboardContainer"></div>
  </div>
</template>

<script setup>
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { onMounted, ref } from 'vue'

const input = ref('')

let keyboard = null

onMounted(() => {
  keyboard = new Keyboard({
    onChange: (inputValue) => {
      input.value = inputValue
    },
    onKeyPress: (button) => {
      if (button === '{enter}') {
        alert('Enter 눌렀어요! 입력값: ' + input.value)
      }
    },
    theme: "hg-theme-default hg-layout-default",
    layout: {
      default: [
        "q w e r t y u i o p {bksp}",
        "a s d f g h j k l {enter}",
        "z x c v b n m {space}"
      ]
    },
    display: {
      '{bksp}': '⌫',
      '{enter}': '⏎',
      '{space}': 'Space'
    }
  })

  keyboard.getInput = () => input.value
})
</script>

<style scoped>
input {
  width: 100%;
  font-size: 1.2em;
  padding: 8px;
  margin-bottom: 8px;
}
</style>
