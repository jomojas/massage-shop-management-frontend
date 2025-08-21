<script setup>
import { defineProps, defineEmits, inject, ref, watch } from 'vue'
import { fetchStaffWeekServiceRecords } from '@/api/modules/staff'

const props = defineProps({
  modelValue: Boolean,
  staffId: [Number, String],
  staffName: String,
})
const emit = defineEmits(['update:modelValue'])

const handleClose = () => {
  showPanel.value = false
  setTimeout(() => emit('update:modelValue', false), 500)
}

// 控制滑入动画的class
const showPanel = ref(false)
// 服务记录数据
const serviceList = ref([])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      setTimeout(() => (showPanel.value = true), 10)
    } else {
      showPanel.value = false
    }
  },
  { immediate: true },
)

watch(
  [() => props.staffId, () => props.modelValue],
  async ([id, visible]) => {
    if (visible && id) {
      // 新接口返回 { code, message, data }
      const res = await fetchStaffWeekServiceRecords(id)
      serviceList.value = res || []
    }
  },
  { immediate: true },
)

const isMobile = inject('isMobile', false)
</script>

<template>
  <div v-if="modelValue">
    <!-- 遮罩层 -->
    <div class="mask" @click="handleClose"></div>
    <!-- 右侧滑入面板 -->
    <div
      class="staff-timeline"
      :class="{ 'slide-in': showPanel, 'slide-out': !showPanel }"
      :style="{ width: isMobile ? '50%' : '30%' }"
    >
      <h3 style="margin-bottom: 16px">员工姓名: {{ staffName }}</h3>
      <el-timeline style="max-width: 600px">
        <el-timeline-item
          v-for="item in serviceList"
          :key="item.serviceTime + item.project"
          :timestamp="item.serviceTime"
          placement="top"
        >
          <el-card>
            <h4>项目: {{ item.project }}</h4>
            <p>收入: {{ item.earnings }}元</p>
          </el-card>
        </el-timeline-item>
        <el-empty v-if="serviceList.length === 0" description="暂无服务记录" />
      </el-timeline>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}
.staff-timeline {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: var(--staff-management-bg);
  color: var(--staff-management-text);
  z-index: 1000;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  overflow-y: auto;
  transition:
    transform 0.5s cubic-bezier(0.55, 0, 0.1, 1),
    opacity 0.5s;
  opacity: 0;

  &.slide-in {
    transform: translateX(0);
    opacity: 1;
  }
  &.slide-out {
    transform: translateX(100%);
    opacity: 0;
  }

  h3 {
    font-size: $font-size-large;
    font-family: $font-family-heading;
    margin-bottom: 16px;
  }

  :deep(.el-timeline-item__timestamp) {
    color: var(--staff-management-text);
  }
  :deep(.el-card__body) {
    background-color: var(--staff-management-bg);
    color: var(--staff-management-text);
    font-family: $font-family-mono;
    font-size: $font-size-normal;

    h4 {
      margin-bottom: 10px;
    }
  }
}
</style>
