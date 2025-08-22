<script setup>
import { defineProps, defineEmits, ref, inject, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({ modelValue: Boolean, staff: Object })
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '姓名是必填项', trigger: 'blur' }],
  phone: [
    { required: true, message: '电话是必填项', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入有效手机号', trigger: 'blur' },
  ],
  commission: [
    { required: true, message: '提成比例是必填项', trigger: 'blur' },
    { type: 'number', min: 0, max: 1, message: '提成比例范围为0~1', trigger: 'blur' },
  ],
}

const formEditStaff = reactive({
  name: '',
  phone: '',
  commission: null,
})

watch(
  () => props.staff,
  (val) => {
    if (val) {
      Object.assign(formEditStaff, val)
    }
  },
  { immediate: true },
)

const resetForm = () => {
  formEditStaff.name = ''
  formEditStaff.phone = ''
  formEditStaff.commission = null
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
        emit('submit', { ...formEditStaff })
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
    title="编辑员工信息"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formEditStaff"
      :rules="rules"
      ref="formRef"
      label-position="left"
      label-width="80px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formEditStaff.name" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formEditStaff.phone" placeholder="输入电话" />
      </el-form-item>
      <el-form-item label="提成比例" prop="commission">
        <el-input-number
          v-model="formEditStaff.commission"
          :min="0"
          :max="1"
          :step="0.01"
          :precision="2"
          placeholder="输入0~1之间的小数"
          style="width: 100%"
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
