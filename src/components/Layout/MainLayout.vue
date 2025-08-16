<script setup lang="ts">
import Sidebar from './SideBar.vue'
import PageHeader from '../Common/PageHeader.vue'
</script>

<template>
  <el-container class="main-layout">
    <Sidebar />
    <el-container class="main-container">
      <el-header class="header-container">
        <slot name="header"></slot>
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
      padding: 0;
      background-color: var(--header-bg);
      border-bottom: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
    }

    .main-content {
      flex: 1;
      background-color: var(--bg-page);
      padding: 0;
      overflow-y: auto;

      .content-wrapper {
        padding: 20px;
        min-height: calc(100vh - 60px); // 减去头部高度
        background-color: var(--bg-page);
      }
    }
  }
}
</style>
