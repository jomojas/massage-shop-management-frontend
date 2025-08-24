<script setup>
import { defineProps, defineEmits, ref, reactive, computed, watch, inject, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import MemberSelectorDialog from './MemberSelectorDialog.vue'
import { fetchProjects } from '@/api/modules/project'
import { fetchUndeletedStaffs } from '@/api/modules/staff'
import { number } from 'echarts'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'submit'])

// 弹窗控制
const showMemberDialog = ref(false)

// 级联选择数据
const cascaderOptions = ref([]) // 项目类型-项目-员工的级联数据

const formRef = ref(null)

// 表单数据
const addConsumptionForm = reactive({
  isMember: true, // 是否会员
  selectedMember: {}, // 选中的会员对象
  customerDesc: '', // 普通客户描述
  selectedCascader: [], // cascader 选中的路径数组
  selectedList: [], // 编辑区展示的项目-员工-价格数组
  consumeTime: '', // 消费时间
  recordDetail: '', // 备注
})

// 总金额（自动计算）
const totalPrice = computed(() =>
  addConsumptionForm.selectedList.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
)

const rules = {
  // 客户类型相关校验
  selectedMember: [
    {
      required: true,
      message: '请选择会员',
      trigger: 'blur',
      // 只有在 isMember 为 true 时校验
      validator: (rule, value, callback) => {
        if (addConsumptionForm.isMember && (!value || !value.name)) {
          callback(new Error('请选择会员'))
        } else {
          callback()
        }
      },
    },
  ],
  customerDesc: [
    {
      required: true,
      message: '请输入客户描述',
      trigger: 'blur',
      // 只有在 isMember 为 false 时校验
      validator: (rule, value, callback) => {
        if (!addConsumptionForm.isMember && !value) {
          callback(new Error('请输入客户描述'))
        } else {
          callback()
        }
      },
    },
  ],
  selectedCascader: [
    { required: true, message: '请选择项目和员工', trigger: 'change', type: 'array' },
  ],
  consumeTime: [{ required: true, message: '请选择消费时间', trigger: 'change' }],
}

// 选择选项的时候，更新 selectedList，同步更新编辑区
watch(
  () => addConsumptionForm.selectedCascader,
  (newVal) => {
    // newVal 是一个二维数组，每个 path 形如 [category, projectId, employeeId]
    const newList = []
    newVal.forEach((path) => {
      const [category, projectId, employeeId] = path
      // 找到项目和员工的详细信息
      const categoryNode = cascaderOptions.value.find((c) => c.value === category)
      const projectNode = categoryNode?.children?.find((p) => p.value === projectId)
      const employeeNode = projectNode?.children?.find((e) => e.value === employeeId)
      const project = projectNode?.project
      const employee = employeeNode?.employee

      // 推荐价格
      const suggestPrice = addConsumptionForm.isMember ? project?.priceMember : project?.priceGuest

      // 检查是否已存在，避免重复
      if (
        !newList.some(
          (item) =>
            item.projectCategory === category &&
            item.projectId === projectId &&
            item.employeeId === employeeId,
        )
      ) {
        newList.push({
          projectCategory: category,
          projectName: project?.name || '',
          projectId,
          employeeName: employee?.name || '',
          employeeId,
          price: suggestPrice || 0,
          suggestPrice: suggestPrice || 0,
        })
      }
    })
    addConsumptionForm.selectedList = newList
  },
  { immediate: true, deep: true },
)

function resetForm() {
  addConsumptionForm.isMember = true
  addConsumptionForm.selectedMember = {}
  addConsumptionForm.customerDesc = ''
  addConsumptionForm.selectedCascader = []
  addConsumptionForm.selectedList = []
  addConsumptionForm.consumeTime = ''
  addConsumptionForm.recordDetail = ''
  if (formRef.value) {
    formRef.value.clearValidate?.()
  }
}

function handleMemberSelect(member) {
  addConsumptionForm.selectedMember = member
  showMemberDialog.value = false
}

const handleShowMemberDialog = () => {
  showMemberDialog.value = true
}
const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}
// 切换会员/普通客户时，清空其他字段
// 只要切换就重置，保留当前 isMember
const onMemberTypeChange = () => {
  const isMember = addConsumptionForm.isMember
  resetForm()
  addConsumptionForm.isMember = isMember
}

const onConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    await ElMessageBox.confirm('确定要提交本次消费记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).catch(() => {
      return
    })

    const submitData = {
      memberId: addConsumptionForm.isMember ? addConsumptionForm.selectedMember.id : undefined,
      customerDesc: addConsumptionForm.isMember ? undefined : addConsumptionForm.customerDesc,
      projects: addConsumptionForm.selectedList.map((item) => ({
        projectName: item.projectName,
        price: Number(item.price),
        employees: [
          {
            employeeId: item.employeeId,
            income: Number(item.price),
          },
        ],
      })),
      consumeTime: addConsumptionForm.consumeTime,
      totalPrice: totalPrice.value,
      recordDetail: addConsumptionForm.recordDetail,
    }
    console.log('提交数据', submitData)

    emit('submit', submitData)
    resetForm()
    emit('update:modelValue', false)
  })
}

const isMobile = inject('isMobile', false)

function itemKey(item) {
  // 保证唯一性，建议用类别-项目ID-员工ID
  return `${item.projectCategory}-${item.projectId}-${item.employeeId}`
}

// 组装 cascaderOptions，给级联下拉框填充数据
onMounted(async () => {
  // 获取所有项目和员工
  const [projectRes, staffRes] = await Promise.all([
    fetchProjects({ page: 1, pageSize: 9999 }), // 拉全量
    fetchUndeletedStaffs({ page: 1, pageSize: 9999 }),
  ])
  const projects = projectRes.projects || []
  const employees = staffRes.employees || []

  // 1. 按项目类别分组
  const categoryMap = {}
  projects.forEach((project) => {
    if (!categoryMap[project.category]) {
      categoryMap[project.category] = []
    }
    categoryMap[project.category].push(project)
  })

  // 2. 组装 cascaderOptions
  cascaderOptions.value = Object.entries(categoryMap).map(([category, projectList]) => ({
    label: category,
    value: category,
    children: projectList.map((project) => ({
      label: project.name,
      value: project.id,
      // 这里可以带上项目价格等信息
      project: project, // 可选：带上原始项目信息
      children: employees.map((emp) => ({
        label: emp.name,
        value: emp.id,
        employee: emp, // 可选：带上原始员工信息
      })),
    })),
  }))
})
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="新增消费记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="addConsumptionForm"
      label-width="90px"
      label-position="top"
      ref="formRef"
      :rules="rules"
    >
      <!-- 选择客户类型 -->
      <el-form-item label="客户类型">
        <el-radio-group v-model="addConsumptionForm.isMember" @change="onMemberTypeChange">
          <el-radio :label="true">会员</el-radio>
          <el-radio :label="false">普通客户</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 会员选择 -->
      <el-form-item v-if="addConsumptionForm.isMember" label="会员" prop="selectedMember">
        <el-input
          v-model="addConsumptionForm.selectedMember.name"
          placeholder="请选择会员"
          readonly
          @click="handleShowMemberDialog"
        />
        <MemberSelectorDialog v-model="showMemberDialog" @select="handleMemberSelect" />
      </el-form-item>

      <!-- 普通客户描述 -->
      <el-form-item v-else label="客户描述" prop="customerDesc">
        <el-input v-model="addConsumptionForm.customerDesc" placeholder="请输入客户描述" />
      </el-form-item>

      <!-- 项目-员工选择 -->
      <el-form-item label="选择项目/员工" prop="selectedCascader">
        <el-cascader
          v-model="addConsumptionForm.selectedCascader"
          :options="cascaderOptions"
          :props="{ multiple: true, checkStrictly: false }"
          placeholder="请选择项目类型/项目/员工"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 编辑区 -->
      <div v-if="addConsumptionForm.selectedList.length" class="edit-area">
        <div
          v-for="(item, idx) in addConsumptionForm.selectedList"
          :key="itemKey(item)"
          class="edit-item"
          style="display: flex; align-items: center; margin-bottom: 8px"
        >
          <span style="flex: 1">
            {{ item.projectCategory }} / {{ item.projectName }} / {{ item.employeeName }}
          </span>
          <el-input-number
            v-model="item.price"
            :min="0"
            :step="1"
            :precision="2"
            style="width: 150px; margin: 0 10px"
          />
        </div>
      </div>

      <!-- 消费时间 -->
      <el-form-item label="消费时间" prop="consumeTime">
        <el-date-picker
          v-model="addConsumptionForm.consumeTime"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          placeholder="请选择消费时间"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" class="remark">
        <el-input
          v-model="addConsumptionForm.recordDetail"
          type="textarea"
          placeholder="请输入备注"
          :rows="2"
        />
      </el-form-item>

      <!-- 总价区域 -->
      <el-form-item label="总金额">
        <el-statistic :value="totalPrice" title="本次消费总额" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item style="text-align: right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
.edit-area {
  margin-bottom: 16px;
  background: var(--consume-management-bg);
  color: var(--consume-management-text);
  border-radius: 6px;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
}
.el-form-item {
  margin-bottom: 10px;
}
.el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}
.remark {
  :deep(.el-textarea__inner) {
    color: var(--consume-management-text);
    background-color: var(--consume-management-bg);
  }
}
.el-statistic {
  :deep(.el-statistic__head) {
    font-size: $font-size-small;
    color: var(--dashcard-text) !important;
  }
  :deep(.el-statistic__number) {
    font-size: $font-size-large;
    color: var(--dashcard-text) !important;
  }
}
</style>
