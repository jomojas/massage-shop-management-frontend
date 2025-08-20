<script setup>
import { ref } from 'vue'
import Member from './components/Member.vue'
import Charge from './components/Charge.vue'

const activeName = ref('first')
</script>

<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="会员相关" name="first">
      <Member />
    </el-tab-pane>
    <el-tab-pane label="充值相关" name="second">
      <Charge />
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
