<script setup>
import { defineProps, defineEmits, ref, inject, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  expense: Object,
  categories: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

const rules = {
  category: [{ required: true, message: '请选择支出类别', trigger: 'change' }],
  amount: [
    { required: true, message: '金额是必填项', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' },
  ],
  spendDate: [{ required: true, message: '请选择支出日期', trigger: 'change' }],
}

const formEditExpense = reactive({
  category: '',
  amount: null,
  spendDate: '',
  description: '',
})

watch(
  () => props.expense,
  (val) => {
    if (val) {
      Object.assign(formEditExpense, val)
    }
  },
  { immediate: true },
)

const resetForm = () => {
  formEditExpense.category = ''
  formEditExpense.amount = null
  formEditExpense.spendDate = ''
  formEditExpense.description = ''
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
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm('是否确定要保存修改？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        emit('submit', { ...formEditExpense })
        resetForm()
        emit('update:modelValue', false)
      } catch (e) {
        resetForm()
        emit('update:modelValue', false)
      }
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
    title="编辑支出记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formEditExpense"
      :rules="rules"
      ref="formRef"
      label-position="top"
      :label-width="isMobile ? '100%' : '120px'"
    >
      <el-form-item label="支出类别" prop="category">
        <el-select v-model="formEditExpense.category" placeholder="请选择类别" filterable>
          <el-option v-for="item in props.categories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="formEditExpense.amount"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="输入金额"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="支出日期" prop="spendDate">
        <el-date-picker
          v-model="formEditExpense.spendDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择支出日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formEditExpense.description"
          type="textarea"
          placeholder="支出描述（可选）"
        />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
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
  }
}
</style>
