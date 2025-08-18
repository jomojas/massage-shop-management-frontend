import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VChart from 'vue-echarts' // 引入 ECharts 组件

// 引入样式系统
import './styles/index.scss'

import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.component('v-chart', VChart) // 注册 ECharts 组件

// 初始化主题
const appStore = useAppStore()
appStore.initTheme()

app.mount('#app')
