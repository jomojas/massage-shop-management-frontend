<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { fetchUndeletedStaffs } from '@/api/modules/staff'

const props = defineProps({
  modelValue: Boolean,
  mode: {
    type: String,
    default: 'add', // 'add' or 'edit'
  },
  statusDict: {
    type: Array,
    default: () => [],
  },
  editData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const form = ref({
  staffId: '', // 新增时需要
  date: '',
  status: '',
  remark: '',
})

// 员工列表
const staffList = ref([])

onMounted(async () => {
  if (props.mode === 'add') {
    const res = await fetchUndeletedStaffs()
    // console.log('Fetched undeleted staff list:', res)
    // 假设返回格式为 { data: [...] }
    staffList.value = res?.employees || []
    // console.log('Fetched staff list:', staffList.value)
  }
})

// 编辑时填充表单
watch(
  () => props.editData,
  (val) => {
    if (props.mode === 'edit' && val) {
      form.value = {
        staffId: val.staffId || '',
        date: val.date || '',
        status: val.status || props.statusDict[0] || '',
        remark: val.remark || '',
        recordId: val.recordId, // 编辑时需要
      }
    } else if (props.mode === 'add') {
      form.value = {
        staffId: '',
        date: dayjs().format('YYYY-MM-DD'),
        status: props.statusDict[0] || '',
        remark: '',
      }
    }
  },
  { immediate: true },
)

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 提交
const onSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 新增时必须有 staffId
      if (props.mode === 'add' && !form.value.staffId) {
        ElMessage.error('请选择员工')
        return
      }
      if (props.mode === 'edit') {
        ElMessageBox.confirm('确定要保存修改吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          emit('submit', { ...form.value })
        })
      } else {
        emit('submit', { ...form.value })
      }
    }
  })
}

// 校验规则
const rules = {
  staffId: [{ required: true, message: '请选择员工', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}
</script>

<template>
  <el-dialog
    v-model="props.modelValue"
    :title="props.mode === 'add' ? '新增员工状态' : '编辑员工状态'"
    width="400px"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-position="right" label-width="50px">
      <el-form-item v-if="props.mode === 'add'" label="员工" prop="staffId">
        <el-select v-model="form.staffId" placeholder="请选择员工" filterable>
          <el-option
            v-for="staff in staffList"
            :key="staff.id"
            :label="`${staff.name}（${staff.phone}）`"
            :value="staff.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio-button v-for="item in props.statusDict" :key="item" :label="item">{{
            item
          }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="备注（可选）" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.el-form {
  padding-top: 10px;
}
</style>
