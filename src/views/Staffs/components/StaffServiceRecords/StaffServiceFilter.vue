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
  sortBy: 'consumption_date',
  earnings_min: null,
  earnings_max: null,
  dateRange: [],
})

const resetForm = () => {
  formFilter.keyword = ''
  formFilter.order = 'desc'
  formFilter.sortBy = 'consumption_date'
  formFilter.earnings_min = null
  formFilter.earnings_max = null
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
        filters.date_start = dayjs(filters.dateRange[0]).format('YYYY-MM-DD')
        filters.date_end = dayjs(filters.dateRange[1]).format('YYYY-MM-DD')
      } else {
        filters.date_start = ''
        filters.date_end = ''
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
    v-model="props.modelValue"
    title="筛选服务记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formFilter"
      :rules="rules"
      ref="formRef"
      label-position="right"
      label-width="70px"
    >
      <el-form-item label="关键字">
        <el-input v-model="formFilter.keyword" placeholder="输入项目/会员/客户描述" />
      </el-form-item>
      <el-form-item label="排序依据" class="radio-groups">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button value="consumption_date">消费日期</el-radio-button>
          <el-radio-button value="earnings">服务收入</el-radio-button>
          <el-radio-button value="staff_name">员工姓名</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="formFilter.order">
          <el-radio-button value="asc">升序</el-radio-button>
          <el-radio-button value="desc">降序</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="收入区间">
        <el-input-number v-model="formFilter.earnings_min" placeholder="最低收入" :min="0" />
        <span style="margin: 0 8px">-</span>
        <el-input-number v-model="formFilter.earnings_max" placeholder="最高收入" :min="0" />
      </el-form-item>
      <el-form-item label="消费日期">
        <el-date-picker
          v-model="formFilter.dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          date-format="YYYY/MM/DD ddd"
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
