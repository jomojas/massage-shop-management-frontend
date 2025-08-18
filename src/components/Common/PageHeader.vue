<script setup>
import { useAppStore } from '@/stores/app'
import { computed, inject } from 'vue'
import { Menu, Fold, Sunny, Moon } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { pageTitles } from '@/config/menu'

const appStore = useAppStore()
const route = useRoute()

// 注入来自父组件的响应式数据和函数
const isMobile = inject('isMobile', false)
const toggleMobileSidebar = inject('toggleMobileSidebar', () => {})

const handleCollapse = () => {
  if (isMobile.value) {
    // 移动端：切换侧边栏显示/隐藏
    toggleMobileSidebar()
  } else {
    // 桌面端：切换侧边栏展开/折叠
    appStore.toggleCollapse()
  }
}

// 菜单图标 - 根据设备类型显示不同图标
const menuIcon = computed(() => {
  if (isMobile.value) {
    return Menu // 移动端始终显示菜单图标
  }
  return appStore.isCollapse ? Menu : Fold // 桌面端根据折叠状态显示
})

// 主题相关 - 使用可写的计算属性
const isDark = computed({
  get: () => appStore.isDark,
  set: (value) => {
    if (value !== appStore.isDark) {
      appStore.toggleTheme()
    }
  },
})

// 当前页面信息
const current = computed(() => {
  const currentPath = route.path
  const title = pageTitles[currentPath]
  if (title) {
    return {
      path: currentPath,
      label: title,
    }
  }
  return null
})
</script>

<template>
  <div class="header">
    <div class="l-content">
      <el-button size="default" @click="handleCollapse">
        <el-icon><component :is="menuIcon" /></el-icon>
      </el-button>
      <el-breadcrumb separator="/" class="bread">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="current" :to="current.path">{{
          current.label
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="r-content">
      <!-- 主题切换按钮 -->
      <el-switch
        v-model="isDark"
        size="large"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        active-text="暗"
        inactive-text="亮"
        style="margin-right: 16px"
      />
      <el-button type="text" link> 退出登录 </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  font-family: $font-family-heading;

  .l-content {
    display: flex;
    align-items: center;

    .el-button {
      margin: 0 20px 0 20px;
      background-color: var(--header-menu-bg);
      color: var(--header-menu-text);

      &:hover {
        background-color: var(--header-menu-hover-bg);
        color: var(--text-primary);
      }

      // 确保图标继承颜色
      .el-icon {
        color: inherit;
      }
    }

    .bread {
      // 外部元素不需要 :deep()，因为它们有 scoped 属性
      .el-breadcrumb__item {
        font-size: $font-size-normal;
        cursor: pointer;
      }

      // 内部元素需要 :deep()，因为它们没有 scoped 属性
      :deep(.el-breadcrumb__inner) {
        color: var(--header-text) !important;

        &:hover {
          color: var(--color-primary) !important;
        }
      }

      :deep(.el-breadcrumb__inner.is-link) {
        color: var(--header-text) !important;

        &:hover {
          color: var(--color-primary) !important;
        }
      }
    }
  }

  .r-content {
    display: flex;
    align-items: center;

    .el-button {
      color: var(--header-text);
      margin-right: $spacing-md;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
</style>
