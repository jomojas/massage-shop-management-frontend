<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

const rules = {
  category: [{ required: true, message: '类别名称是必填项', trigger: 'blur' }],
}

const formAddCategory = reactive({
  category: '',
})

const resetForm = () => {
  formAddCategory.category = ''
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
      emit('submit', { ...formAddCategory })
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
    title="新增项目类别"
    :width="isMobile ? '90%' : '30%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formAddCategory"
      :rules="rules"
      ref="formRef"
      label-position="top"
      :label-width="isMobile ? '100%' : '120px'"
    >
      <el-form-item label="类别名称" prop="category">
        <el-input v-model="formAddCategory.category" placeholder="输入类别名称" />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">添加</el-button>
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
