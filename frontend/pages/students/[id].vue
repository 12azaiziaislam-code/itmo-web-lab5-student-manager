<template>
  <div>
    <div style="margin-bottom: 15px;">
      <NuxtLink to="/" class="btn btn-secondary btn-sm">
        ← Back to Students
      </NuxtLink>
    </div>

    <div
      v-if="studentStore.notification"
      :class="studentStore.notification.type === 'error' ? 'alert-error' : 'alert-success'"
      @click="studentStore.clearNotification()"
    >
      {{ studentStore.notification.message }}
    </div>

    <div v-if="pending" class="card text-center" style="padding: 25px;">
      Loading student details...
    </div>

    <div v-else-if="student" class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <h2 style="margin: 0;">{{ student.fullName }}</h2>
        <div v-if="isAdmin" style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-primary btn-sm" @click="isEditOpen = true">
            Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="isDeleteOpen = true">
            Delete
          </button>
        </div>
      </div>

      <table style="margin-top: 15px;">
        <tbody>
          <tr>
            <th style="width: 35%;">ISU ID</th>
            <td>{{ student.isuId }}</td>
          </tr>
          <tr>
            <th>Full Name</th>
            <td>{{ student.fullName }}</td>
          </tr>
          <tr>
            <th>Group</th>
            <td>{{ student.group }}</td>
          </tr>
          <tr>
            <th>Dormitory Number</th>
            <td>{{ student.dormitoryNumber }}</td>
          </tr>
          <tr>
            <th>Room</th>
            <td>{{ student.room }}</td>
          </tr>
          <tr>
            <th>Accommodation Period</th>
            <td>{{ formatDate(student.accommodationPeriod) }}</td>
          </tr>
          <tr>
            <th>International Student</th>
            <td>{{ student.isInternational ? 'Yes' : 'No' }}</td>
          </tr>
          <tr>
            <th>Notes</th>
            <td>{{ student.notes || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <StudentModal
      :is-open="isEditOpen"
      :student="student"
      @close="isEditOpen = false"
      @saved="onSaved"
    />

    <ConfirmModal
      :is-open="isDeleteOpen"
      title="Delete Student"
      :message="`Are you sure you want to delete ${student?.fullName} (${student?.isuId})?`"
      confirm-text="Delete"
      :is-danger="true"
      :busy="isDeleting"
      @confirm="onConfirmDelete"
      @cancel="isDeleteOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentStore } from '~/stores/students';
import { getErrorMessage } from '~/utils/errors';

const route = useRoute();
const studentId = computed(() => String(route.params.id));
const studentStore = useStudentStore();

const tokenCookie = useCookie('accessToken');
const roleCookie = useCookie('role');

function extractRoleFromToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

const isAdmin = computed(() => {
  if (roleCookie.value) return roleCookie.value === 'ADMIN';
  return extractRoleFromToken(tokenCookie.value) === 'ADMIN';
});

function resolveApiBase() {
  const config = useRuntimeConfig();
  if (import.meta.server && config.apiInternalBase) {
    return config.apiInternalBase;
  }
  if (config.public?.apiBase) {
    return config.public.apiBase;
  }
  return '/api';
}

const { data: student, pending, error, refresh } = await useFetch(
  () => `${resolveApiBase()}/students/${studentId.value}`,
  {
    key: `student-${studentId.value}`,
    headers: computed(() => {
      if (tokenCookie.value) {
        return { Authorization: `Bearer ${tokenCookie.value}` };
      }
      return {};
    })
  }
);

if (error.value) {
  const statusCode = error.value?.statusCode || error.value?.status || 404;
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? `Student ${studentId.value} not found` : getErrorMessage(error.value),
    fatal: true
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return String(dateStr);
}

const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isDeleting = ref(false);

async function onSaved() {
  isEditOpen.value = false;
  await refresh();
}

async function onConfirmDelete() {
  if (!student.value) return;
  isDeleting.value = true;
  try {
    await studentStore.deleteStudent(student.value.isuId);
    isDeleteOpen.value = false;
    await navigateTo('/');
  } catch (err) {
    studentStore.notify(getErrorMessage(err, 'Failed to delete student'), 'error');
  } finally {
    isDeleting.value = false;
  }
}
</script>