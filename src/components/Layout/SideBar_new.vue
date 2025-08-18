<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuList, type MenuItem } from '@/config/menu'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  visible: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const appStore = useAppStore()
const isCollapse = computed(() => appStore.isCollapse)

// 实际的折叠状态：移动端始终不折叠
const actualCollapse = computed(() => {
  return props.isMobile ? false : isCollapse.value
})

const route = useRoute()
const router = useRouter()

// 动态获取图标组件
const getIconComponent = (iconName: string) => {
  return (ElementPlusIcons as any)[iconName] || ElementPlusIcons.Document
}

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

const handleMenu = (item: MenuItem) => {
  router.push(item.path)
  appStore.setCurrentMenu(item)

  // 移动端点击菜单后自动关闭侧边栏
  if (props.isMobile) {
    emit('close')
  }
}
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div v-if="isMobile && visible" class="sidebar-overlay" @click="$emit('close')" />

  <!-- 侧边栏 -->
  <el-aside
    :class="{
      sidebar: true,
      'sidebar-mobile': isMobile,
      'sidebar-desktop': !isMobile,
      'sidebar-visible': visible,
    }"
    :width="actualCollapse ? '60px' : '200px'"
    :collapse-transition="true"
  >
    <!-- Logo 区域 -->
    <div class="logo-container">
      <h3 class="logo-title">{{ actualCollapse ? '加德' : '加德盲人推拿' }}</h3>
    </div>

    <!-- 菜单区域 -->
    <el-menu :default-active="activeMenu" class="sidebar-menu" :collapse="actualCollapse">
      <template v-for="item in menuList" :key="item.path">
        <!-- 有子菜单的菜单项 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
          <template #title>
            <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
            <span>{{ item.label }}</span>
          </template>

          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
            @click="handleMenu(child)"
          >
            <el-icon><component :is="getIconComponent(child.icon)" /></el-icon>
            <span>{{ child.label }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 没有子菜单的菜单项 -->
        <el-menu-item v-else :index="item.path" @click="handleMenu(item)">
          <el-icon><component :is="getIconComponent(item.icon)" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
// 遮罩层
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.sidebar {
  height: 100%;
  background-color: var(--sidebar-bg);
  transition: all 0.3s ease;

  // 桌面端样式
  &.sidebar-desktop {
    position: relative;
    z-index: auto;
  }

  // 移动端样式
  &.sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transform: translateX(-100%);

    &.sidebar-visible {
      transform: translateX(0);
    }
  }

  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;

    .logo-title {
      color: var(--text-primary);
      font-size: $font-size-large;
      font-weight: $font-weight-semibold;
      font-family: $font-family-heading;
      margin: 0;
    }
  }

  .sidebar-menu {
    border: none;
    background-color: transparent;

    // 一级菜单项样式
    :deep(.el-menu-item) {
      color: var(--sidebar-text);
      font-size: $font-size-normal;
      font-family: $font-family-base;

      &:hover {
        background-color: var(--sidebar-hover-bg);
        color: var(--text-primary);
      }

      &.is-active {
        background-color: var(--color-primary);
        color: var(--text-primary);
      }

      .el-icon {
        margin-right: 8px;
      }
    }

    // 子菜单样式
    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        color: var(--sidebar-text);
        font-size: $font-size-normal;
        font-family: $font-family-base;

        &:hover {
          background-color: var(--sidebar-hover-bg);
          color: var(--text-primary);
        }

        .el-icon {
          margin-right: 8px;
        }
      }

      .el-menu {
        background-color: var(--sidebar-bg);

        .el-menu-item {
          background-color: var(--sidebar-bg);
          padding-left: 40px !important;

          &:hover {
            background-color: var(--sidebar-hover-bg);
          }

          &.is-active {
            background-color: var(--color-primary);
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 767.98px) {
  .sidebar {
    width: 200px !important;
  }
}
</style>
