<script setup lang="ts">
import Sidebar from './SideBar.vue'
import PageHeader from '../Common/PageHeader.vue'
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'

const screenWidth = ref(window.innerWidth)
const sidebarVisible = ref(false)

// 响应式计算是否为移动端
const isMobile = computed(() => screenWidth.value < 768)

// 切换移动端侧边栏显示状态
const toggleMobileSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth
  // 切换到桌面端时自动显示侧边栏
  if (!isMobile.value) {
    sidebarVisible.value = true
  }
}

// 关闭侧边栏（只有移动端需要）
const closeSidebar = () => {
  sidebarVisible.value = false
}

// 提供依赖注入给子组件
provide('isMobile', isMobile)
provide('toggleMobileSidebar', toggleMobileSidebar)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  // 初始化时桌面端显示侧边栏
  if (!isMobile.value) {
    sidebarVisible.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <el-container class="main-layout">
    <Sidebar :visible="sidebarVisible" :is-mobile="isMobile" @close="closeSidebar" />

    <el-container class="main-container">
      <el-header class="header-container">
        <PageHeader />
      </el-header>

      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;

  .main-container {
    display: flex;
    flex-direction: column;

    .header-container {
      height: 60px;
      padding: 0 16px;
      background-color: var(--header-bg);
      border-bottom: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
      // display: flex;
      // align-items: center;
    }

    .main-content {
      flex: 1;
      background-color: var(--bg-page);
      padding: 0;
      overflow-y: auto;

      .content-wrapper {
        padding: 20px;
        min-height: calc(100vh - 60px);
        background-color: var(--bg-page);
      }
    }
  }
}
</style>
