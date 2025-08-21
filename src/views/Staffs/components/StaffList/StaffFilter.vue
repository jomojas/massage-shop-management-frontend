<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const rules = {}

const formFilter = reactive({
  keyword: '',
  commission_min: null,
  commission_max: null,
  sortBy: 'name',
  order: 'asc',
})

const resetForm = () => {
  formFilter.keyword = ''
  formFilter.commission_min = null
  formFilter.commission_max = null
  formFilter.sortBy = 'name'
  formFilter.order = 'asc'
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
      const filters = { ...formFilter }
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
    title="筛选员工"
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
      <el-form-item label="姓名/电话">
        <el-input v-model="formFilter.keyword" placeholder="输入姓名或电话" />
      </el-form-item>
      <el-form-item label="提成区间">
        <el-input-number
          v-model="formFilter.commission_min"
          :min="0"
          :max="1"
          :step="0.01"
          placeholder="最小提成"
        />
        <span style="margin: 0 8px">-</span>
        <el-input-number
          v-model="formFilter.commission_max"
          :min="0"
          :max="1"
          :step="0.01"
          placeholder="最大提成"
        />
      </el-form-item>
      <el-form-item label="排序依据" class="radio-groups">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button value="name">姓名</el-radio-button>
          <el-radio-button value="commission">提成</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="formFilter.order">
          <el-radio-button value="asc">升序</el-radio-button>
          <el-radio-button value="desc">降序</el-radio-button>
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
