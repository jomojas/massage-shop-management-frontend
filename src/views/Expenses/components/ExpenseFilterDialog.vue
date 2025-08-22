<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  categories: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const rules = {}

const formFilter = reactive({
  category: '',
  minAmount: null,
  maxAmount: null,
  dateRange: [],
  keyword: '',
  sortBy: 'spend_date',
  order: 'desc',
})

const resetForm = () => {
  formFilter.category = ''
  formFilter.minAmount = null
  formFilter.maxAmount = null
  formFilter.dateRange = []
  formFilter.keyword = ''
  formFilter.sortBy = 'spend_date'
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
      // 格式化日期
      let filters = { ...formFilter }
      if (Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
        filters.startDate = filters.dateRange[0]
        filters.endDate = filters.dateRange[1]
      }
      delete filters.dateRange
      // 过滤空字符串和null
      filters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null),
      )
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
      <el-form-item label="支出类别">
        <el-select v-model="formFilter.category" placeholder="全部" clearable>
          <el-option v-for="item in props.categories" :key="item" :label="item" :value="item" />
        </el-select>
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
      <el-form-item label="支出日期">
        <el-date-picker
          v-model="formFilter.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述关键词">
        <el-input v-model="formFilter.keyword" placeholder="输入描述关键词" />
      </el-form-item>
      <el-form-item label="排序">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button label="spend_date">支出日期</el-radio-button>
          <el-radio-button label="amount">金额</el-radio-button>
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
