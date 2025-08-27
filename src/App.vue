<script setup lang="ts">
import MainLayout from './components/Layout/MainLayout.vue'
import PageHeader from './components/PageHeader.vue'
import router from './router'
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}

#app {
  height: 100vh;
}

/* 全局样式，任何共享类名的组件会使用该样式 */
.el-dialog {
  background-color: var(--member-management-bg) !important;
  color: var(--member-management-text) !important;

  .el-dialog__title {
    color: var(--member-management-text) !important;
  }

  .el-form-item__label {
    color: var(--member-management-text) !important;
  }

  .el-input__wrapper {
    background-color: var(--member-management-bg) !important;
    .el-input__inner {
      color: var(--member-management-text) !important;
    }
  }

  .el-radio-button__inner {
    background-color: var(--member-management-bg);
    color: var(--member-management-text);
  }
}

.el-pagination {
  .btn-prev,
  .btn-next,
  .el-pager li {
    background-color: var(--member-management-pager-bg) !important;
    color: var(--member-management-pager-text) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }

    &.is-active {
      background-color: var(--el-color-primary) !important;
      color: white !important;
    }
  }
}

.el-select__wrapper {
  background-color: var(--staff-management-bg);
  transition: background-color 0s ease;
}
</style>
