<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const rules = {}

const formFilter = reactive({
  keyword: '',
  minAmount: null,
  maxAmount: null,
  dateRange: [],
  sortBy: 'consume_time',
  order: 'desc',
})

const resetForm = () => {
  formFilter.keyword = ''
  formFilter.minAmount = null
  formFilter.maxAmount = null
  formFilter.dateRange = []
  formFilter.sortBy = 'consume_time'
  formFilter.order = 'desc'
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}
const onSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      let filters = { ...formFilter }
      if (Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
        filters.startDate = dayjs(filters.dateRange[0]).format('YYYY-MM-DDTHH:mm:ss')
        filters.endDate = dayjs(filters.dateRange[1]).format('YYYY-MM-DDTHH:mm:ss')
      } else {
        filters.startDate = ''
        filters.endDate = ''
      }
      delete filters.dateRange
      emit('search', filters)
      resetForm()
      emit('update:modelValue', false)
    } else {
      ElMessage({
        message: '请输入正确内容',
        showClose: false,
        type: 'error',
      })
    }
  })
}

const isMobile = inject('isMobile', false)
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="高级查询"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formFilter"
      :rules="rules"
      ref="formRef"
      label-position="top"
      label-width="90px"
    >
      <el-form-item label="关键词">
        <el-input v-model="formFilter.keyword" placeholder="姓名/电话/员工/项目/描述" />
      </el-form-item>
      <el-form-item label="金额区间">
        <el-input-number
          v-model="formFilter.minAmount"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="最小金额"
          style="width: 45%"
        />
        <span style="margin: 0 8px">-</span>
        <el-input-number
          v-model="formFilter.maxAmount"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="最大金额"
          style="width: 45%"
        />
      </el-form-item>
      <el-form-item label="消费日期">
        <el-date-picker
          v-model="formFilter.dateRange"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD HH:mm:ss"
          date-format="YYYY/MM/DD ddd"
          time-format="A hh:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button label="consume_time">消费时间</el-radio-button>
          <el-radio-button label="name">客户姓名</el-radio-button>
          <el-radio-button label="total_price">消费金额</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="formFilter.order" class="order-options">
          <el-radio-button label="desc">降序</el-radio-button>
          <el-radio-button label="asc">升序</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-form {
  .sort-options {
    margin-right: 30px;
  }

  :deep(.buttons .el-form-item__content) {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    .el-button {
      width: 100px;
    }
  }
}
</style>
