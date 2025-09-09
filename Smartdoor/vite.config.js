import vue from '@vitejs/plugin-vue'
import path from 'path'; // path 모듈 추가
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // '@' 별칭을 src 폴더로 지정
    },
  },
})
