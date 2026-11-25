<template>
  <div class="container">
    <div class="app-header">
      <h1>Student Profile</h1>
      <NuxtLink to="/" class="btn btn-secondary">Go Back</NuxtLink>
    </div>

    <div v-if="pending" class="text-center" style="padding: 50px;">
      Loading data...
    </div>

    <div v-else-if="student" class="card">
      <h2>{{ student.fullName }}</h2>
      <table style="width: 100%; margin-top: 20px;">
        <tbody>
          <tr><th>ISU ID</th><td>{{ student.isuId }}</td></tr>
          <tr><th>Group</th><td>{{ student.group }}</td></tr>
          <tr><th>Dormitory / Room</th><td>{{ student.dormitoryNumber }} / {{ student.room }}</td></tr>
          <tr><th>Accommodation Period</th><td>{{ student.accommodationPeriod }}</td></tr>
          <tr><th>International</th><td>{{ student.isInternational ? 'Yes' : 'No' }}</td></tr>
          <tr><th>Notes</th><td>{{ student.notes || 'N/A' }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const studentId = route.params.id
const token = useCookie('accessToken')

const { data: student, pending, error } = await useFetch(`http://localhost:8080/api/students/${studentId}`, {
  headers: { 
    Authorization: token.value ? `Bearer ${token.value}` : '' 
  }
})

if (error.value) {
  let code = error.value.statusCode || 404
  throw createError({ 
    statusCode: code, 
    statusMessage: 'Student not found', 
    fatal: true 
  })
}
</script>