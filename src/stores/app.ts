import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem } from '@/config/menu'

export const useAppStore = defineStore('app', () => {
  const isCollapse = ref<boolean>(false)
  const currentMenu = ref<MenuItem | null>(null)
  const isDark = ref<boolean>(false)

  const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  const setCurrentMenu = (menu: MenuItem) => {
    currentMenu.value = menu
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    // 切换 HTML 根元素的类名来应用主题
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    // 可以将主题设置保存到 localStorage
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 检测系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  return {
    isCollapse,
    toggleCollapse,
    currentMenu,
    setCurrentMenu,
    isDark,
    toggleTheme,
    initTheme,
  }
})
