<script setup>
import { useStaffStatsStore } from '@/stores/staffs/staffStats'
import { ref, computed, onMounted } from 'vue'

/**
 * 在组件中正确使用pinia响应式变量的方法
 * computed: 创建响应式依赖，追踪源数据变化
 * storeToRefs: 专门为Pinia设计，保持store状态的响应性
 * toRef: 创建对源响应式对象属性的引用
 * ref: 创建新的响应式引用（但会复制值）
 */

const staffStatsStore = useStaffStatsStore()

const timeRange = computed(() => staffStatsStore.timeRange || 'week')
// computed: 创建响应式依赖，追踪源数据变化
const staffSalaries = computed(() => staffStatsStore.staffSalaries)

// 丢失响应性
// const staffSalaries = staffStatsStore.staffSalaries

// 使用.value丢失响应性
// const staffSalaries = computed(() =>
//   Array.isArray(staffStatsStore.staffSalaries.value) ? staffStatsStore.staffSalaries.value : [],
// )

// console.log('StaffSalaries in StaffSalaries.vue:', staffSalaries.value)

// 组件挂载时获取数据，组件挂载完成后再执行
onMounted(() => {
  staffStatsStore.fetchAllData()
  // console.log('StaffSalaries in StaffSalaries.vue mounted onMounted:', staffSalaries.value)
})
</script>

<template>
  <div class="main-container">
    <el-row v-if="staffSalaries.length > 0" :gutter="20">
      <el-col v-for="staff in staffSalaries" :key="staff.staff_id" :span="6">
        <el-statistic
          :title="`${staff.staff_name}`"
          :value="
            timeRange === 'week'
              ? staff.week_salary
              : timeRange === 'month'
                ? staff.month_salary
                : timeRange === 'year'
                  ? staff.year_salary
                  : staff.total_salary
          "
        />
      </el-col>
    </el-row>
    <el-empty v-else description="暂无员工数据" />
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  padding: 10px;

  :deep(.el-statistic .el-statistic__head) {
    font-size: $font-size-normal;
    color: var(--dashcard-text) !important;
  }
  :deep(.el-statistic .el-statistic__number) {
    font-size: $font-size-large;
    color: var(--dashcard-text) !important;
  }
}
</style>
