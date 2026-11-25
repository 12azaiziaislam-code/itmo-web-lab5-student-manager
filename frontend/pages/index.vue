<template>
  <div class="container">
    <div class="app-header">
      <h1>Student Management (SSR)</h1>
      <button v-if="isAdmin" class="btn btn-success" @click="openAddModal">
        + Add Student
      </button>
    </div>

    <StudentFilters :initial="filters" @search="onSearch" @reset="onReset" />

    <div class="card">
      <div v-if="pending" class="text-center" style="padding: 20px;">
        Loading data...
      </div>
      
      <div v-else class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ISU ID</th>
              <th>Full Name</th>
              <th>Group</th>
              <th>Room</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.isuId">
              <td>{{ student.isuId }}</td>
              <td>
                <NuxtLink :to="`/students/${student.isuId}`">{{ student.fullName }}</NuxtLink>
              </td>
              <td>{{ student.group }}</td>
              <td>{{ student.room }}</td>
              <td v-if="isAdmin" class="actions-cell">
                <button class="btn btn-sm btn-primary" @click="openEditModal(student)">Edit</button>
                <button class="btn btn-sm btn-danger" style="margin-left: 5px;" @click="confirmDelete(student)">Delete</button>
              </td>
            </tr>
            <tr v-if="!students || students.length === 0">
              <td :colspan="isAdmin ? 5 : 4" class="text-center">No students found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <TablePagination 
        :page="filters.page" 
        :totalPages="totalPages" 
        :total="totalCount" 
        :limit="filters.limit" 
        :disabled="pending"
        @change-page="changePage" 
        @change-limit="changeLimit" 
      />
    </div>

    <StudentModal 
      :isOpen="isStudentModalOpen" 
      :student="selectedStudent"
      @close="isStudentModalOpen = false" 
      @saved="isStudentModalOpen = false"
    />

    <ConfirmModal
      :isOpen="isConfirmModalOpen" 
      title="Delete Student"
      :message="`Are you sure you want to delete ${studentToDelete?.fullName}?`"
      confirmText="Delete" 
      :isDanger="true" 
      :busy="isDeleting"
      @confirm="executeDelete" 
      @cancel="isConfirmModalOpen = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useStudentStore } from '~/stores/students'

const token = useCookie('accessToken')
const studentStore = useStudentStore()

const isAdmin = computed(() => {
  if (token.value) {
    return true
  }
  return false
})

const filters = reactive({ 
  page: 1, 
  limit: 10, 
  search: '', 
  group: '' 
})

const { data: students, pending } = await useFetch('http://localhost:8080/api/students', {
  headers: computed(() => {
    if (token.value) {
      return { Authorization: `Bearer ${token.value}` }
    }
    return {}
  }),
  query: filters,
  watch: [filters]
})

const totalCount = computed(() => {
  if (students.value) {
    return students.value.length
  }
  return 0
})

const totalPages = computed(() => {
  let count = totalCount.value
  let limit = filters.limit
  if (count === 0) {
    return 1
  }
  return Math.ceil(count / limit)
})

const onSearch = (newFilters) => {
  Object.assign(filters, newFilters)
  filters.page = 1
}

const onReset = (emptyFilters) => {
  Object.assign(filters, emptyFilters)
  filters.page = 1
  filters.limit = 10
}

const changePage = (newPage) => {
  filters.page = newPage
}

const changeLimit = (newLimit) => {
  filters.limit = newLimit
  filters.page = 1
}

const isStudentModalOpen = ref(false)
const selectedStudent = ref(null)
const isConfirmModalOpen = ref(false)
const studentToDelete = ref(null)
const isDeleting = ref(false)

const openAddModal = () => { 
  selectedStudent.value = null
  isStudentModalOpen.value = true 
}

const openEditModal = (student) => { 
  selectedStudent.value = { ...student }
  isStudentModalOpen.value = true 
}

const confirmDelete = (student) => { 
  studentToDelete.value = student
  isConfirmModalOpen.value = true 
}

const executeDelete = async () => {
  if (!studentToDelete.value) return
  
  isDeleting.value = true
  try {
    await studentStore.deleteStudent(studentToDelete.value.isuId)
    isConfirmModalOpen.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}
</script>