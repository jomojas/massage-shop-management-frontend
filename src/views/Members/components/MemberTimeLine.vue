<script setup>
import { defineProps, defineEmits, inject, ref, watch } from 'vue'
import { fetchMemberConsumption } from '@/api/modules/member'

const props = defineProps({
  modelValue: Boolean,
  memberId: [Number, String],
  memberName: String,
})
const emit = defineEmits(['update:modelValue'])

const handleClose = () => {
  showPanel.value = false
  setTimeout(() => emit('update:modelValue', false), 500) // 等动画结束再关闭
}

// 控制滑入动画的class
const showPanel = ref(false)
// 消费记录数据
const consumptionList = ref([])

watch(
  () => props.modelValue,
  (val) => {
    // 打开时延迟加class，关闭时立即移除
    if (val) {
      setTimeout(() => (showPanel.value = true), 10)
    } else {
      showPanel.value = false
    }
  },
  { immediate: true },
)

watch(
  [() => props.memberId, () => props.modelValue],
  // 首次打开 timeline 时会请求。
  // timeline 已打开时切换会员也会请求。
  // timeline 关闭时不会请求。
  async ([id, visible]) => {
    if (visible && id) {
      const res = await fetchMemberConsumption(id)
      consumptionList.value = res || []
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
      class="member-timeline"
      :class="{ 'slide-in': showPanel, 'slide-out': !showPanel }"
      :style="{ width: isMobile ? '70%' : '30%' }"
    >
      <h3 style="margin-bottom: 16px">会员姓名: {{ memberName }}</h3>
      <el-timeline style="max-width: 600px">
        <el-timeline-item
          v-for="item in consumptionList"
          :key="item.consumeDate + item.project + item.price"
          :timestamp="item.consumeDate"
          placement="top"
        >
          <el-card>
            <h4>项目: {{ item.project }}</h4>
            <p>价格: {{ item.price }}元</p>
          </el-card>
        </el-timeline-item>
        <el-empty v-if="consumptionList.length === 0" description="本月暂无消费记录" />
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
.member-timeline {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: var(--member-management-bg);
  color: var(--member-management-text);
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
    color: var(--member-management-text);
  }
  :deep(.el-card__body) {
    background-color: var(--member-management-bg);
    color: var(--member-management-text);
    font-family: $font-family-mono;
    font-size: $font-size-normal;

    h4 {
      margin-bottom: 10px;
    }
  }
}
</style>
