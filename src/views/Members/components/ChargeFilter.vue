<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const rules = {}

const formFilter = reactive({
  keyword: '',
  order: 'desc',
  sortBy: 'recharge_time',
  minAmount: null,
  maxAmount: null,
  dateRange: [],
})

const resetForm = () => {
  formFilter.keyword = ''
  formFilter.order = 'desc'
  formFilter.sortBy = 'recharge_time'
  formFilter.minAmount = null
  formFilter.maxAmount = null
  formFilter.dateRange = []
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
    title="筛选充值记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formFilter"
      :rules="rules"
      ref="formRef"
      label-position="top"
      :label-width="isMobile ? '100%' : '120px'"
    >
      <el-form-item label="姓名电话">
        <el-input v-model="formFilter.keyword" placeholder="输入姓名或电话" />
      </el-form-item>
      <el-form-item label="排序依据" class="radio-groups">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button value="recharge_time">充值时间</el-radio-button>
          <el-radio-button value="amount">充值金额</el-radio-button>
          <el-radio-button value="name">姓名</el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="formFilter.order">
          <el-radio-button value="asc">升序</el-radio-button>
          <el-radio-button value="desc">降序</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="充值区间">
        <el-input-number v-model="formFilter.minAmount" placeholder="最小充值" :min="0" />
        <span style="margin: 0 8px">-</span>
        <el-input-number v-model="formFilter.maxAmount" placeholder="最大充值" :min="0" />
      </el-form-item>
      <el-form-item label="充值时间">
        <el-date-picker
          v-model="formFilter.dateRange"
          type="datetimerange"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          date-format="YYYY/MM/DD ddd"
          time-format="A hh:mm:ss"
        />
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
  .radio-groups {
    .sort-options {
      margin-right: 30px;
    }
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
