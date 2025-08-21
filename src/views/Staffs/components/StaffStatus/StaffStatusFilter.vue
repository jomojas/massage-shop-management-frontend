<script setup>
import { defineProps, defineEmits, ref, inject, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: Boolean,
  statusDict: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const formFilter = reactive({
  status: '',
  dateRange: [],
  sortBy: 'date',
  order: 'desc',
})

const rules = {}

const resetForm = () => {
  formFilter.status = ''
  formFilter.dateRange = []
  formFilter.sortBy = 'date'
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
        filters.startDate = dayjs(filters.dateRange[0]).format('YYYY-MM-DD')
        filters.endDate = dayjs(filters.dateRange[1]).format('YYYY-MM-DD')
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
    v-model="props.modelValue"
    title="高级筛选"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formFilter"
      :rules="rules"
      ref="formRef"
      label-position="right"
      label-width="80px"
    >
      <el-form-item label="状态">
        <el-select v-model="formFilter.status" placeholder="请选择状态" clearable>
          <el-option v-for="item in props.statusDict" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="formFilter.dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="排序字段">
        <el-radio-group v-model="formFilter.sortBy">
          <el-radio-button label="date">日期</el-radio-button>
          <el-radio-button label="staff_name">员工姓名</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="顺序">
        <el-radio-group v-model="formFilter.order">
          <el-radio-button label="asc">升序</el-radio-button>
          <el-radio-button label="desc">降序</el-radio-button>
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
