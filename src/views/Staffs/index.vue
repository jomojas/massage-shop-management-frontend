<script setup>
import { ref } from 'vue'
import StaffStats from './components/StaffStats/StaffStats.vue'
import StaffList from './components/StaffList/StaffList.vue'
import StaffServiceRecords from './components/StaffServiceRecords/StaffServiceRecords.vue'
import StaffStatus from './components/StaffStatus/StaffStatus.vue'

const activeName = ref('first')
</script>

<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="员工统计数据" name="first">
      <StaffStats />
    </el-tab-pane>
    <el-tab-pane label="员工个人信息" name="second">
      <StaffList />
    </el-tab-pane>
    <el-tab-pane label="员工服务记录" name="third">
      <StaffServiceRecords />
    </el-tab-pane>
    <el-tab-pane label="员工工作状态" name="fourth">
      <StaffStatus />
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
.demo-tabs {
  :deep(.el-tabs__item) {
    color: var(--member-management-text) !important;
    font-family: $font-family-heading;
    font-size: $font-size-normal;
  }

  :deep(.el-tabs__content) {
    background-color: var(--member-management-bg);
  }
}
</style>
