<script setup>
import { useAppStore } from '@/stores/app'
import { computed } from 'vue'
import { Menu, Fold, Sunny, Moon } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { pageTitles } from '@/config/menu'

const appStore = useAppStore()
const route = useRoute()

const handleCollapse = () => {
  appStore.toggleCollapse()
}

// 菜单图标
const menuIcon = computed(() => {
  return appStore.isCollapse ? Menu : Fold
})

// 主题相关 - 使用可写的计算属性
const isDark = computed({
  get: () => appStore.isDark,
  set: (value) => {
    // 只有当值真正改变时才触发切换
    if (value !== appStore.isDark) {
      appStore.toggleTheme()
    }
  }
})

const toggleTheme = () => {
  appStore.toggleTheme()
}

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
      <el-button size="medium" @click="handleCollapse">
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
      :deep(.el-breadcrumb__item) {
        font-size: $font-size-normal;
        cursor: pointer;
      }

      // 额外的保险措施 - 直接针对组件
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

      &:hover {
        color: var(--text-primary);
      }
    }
  }
}
</style>
