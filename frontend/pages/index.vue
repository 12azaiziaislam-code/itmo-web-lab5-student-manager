<template>
  <div>
    <div
      v-if="studentStore.notification"
      :class="studentStore.notification.type === 'error' ? 'alert-error' : 'alert-success'"
      @click="studentStore.clearNotification()"
    >
      {{ studentStore.notification.message }}
    </div>

    <div v-if="error" class="alert-error">
      {{ getErrorMessage(error, 'Failed to load students') }}
    </div>

    <StudentFilters
      :initial="studentStore.filters"
      @search="onSearch"
      @reset="onReset"
    />

    <div v-if="isAdmin" style="margin-bottom: 15px;">
      <button type="button" class="btn btn-success" @click="openAddModal">
        + Add New Student
      </button>
    </div>

    <div v-if="pending" class="card text-center" style="padding: 25px;">
      Loading students...
    </div>

    <div v-else class="table-responsive">
      <table>
        <thead>
          <tr>
            <th class="sortable" @click="toggleSort('isuId')">
              ISU ID {{ sortIndicator('isuId') }}
            </th>
            <th class="sortable" @click="toggleSort('fullName')">
              Full Name {{ sortIndicator('fullName') }}
            </th>
            <th class="sortable" @click="toggleSort('group')">
              Group {{ sortIndicator('group') }}
            </th>
            <th class="sortable" @click="toggleSort('dormitoryNumber')">
              Dormitory {{ sortIndicator('dormitoryNumber') }}
            </th>
            <th class="sortable" @click="toggleSort('room')">
              Room {{ sortIndicator('room') }}
            </th>
            <th class="sortable" @click="toggleSort('accommodationPeriod')">
              Accommodation {{ sortIndicator('accommodationPeriod') }}
            </th>
            <th>International</th>
            <th v-if="isAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in students"
            :key="student.isuId"
            class="clickable"
            @click="goToStudent(student.isuId)"
          >
            <td>{{ student.isuId }}</td>
            <td>
              <NuxtLink :to="`/students/${student.isuId}`" @click.stop>
                {{ student.fullName }}
              </NuxtLink>
            </td>
            <td>{{ student.group }}</td>
            <td>{{ student.dormitoryNumber }}</td>
            <td>{{ student.room }}</td>
            <td>{{ formatDate(student.accommodationPeriod) }}</td>
            <td>{{ student.isInternational ? 'Yes' : 'No' }}</td>
            <td v-if="isAdmin" class="actions-cell" @click.stop>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                @click="openEditModal(student)"
              >
                Edit
              </button>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                @click="openDeleteModal(student)"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td :colspan="isAdmin ? 8 : 7" class="text-center">
              No students found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TablePagination
      :page="currentPage"
      :total-pages="totalPages"
      :total="totalCount"
      :limit="studentStore.filters.limit"
      :disabled="pending"
      @change-page="onChangePage"
      @change-limit="onChangeLimit"
    />

    <StudentModal
      :is-open="isStudentModalOpen"
      :student="selectedStudent"
      @close="closeStudentModal"
      @saved="onStudentSaved"
    />

    <ConfirmModal
      :is-open="isConfirmModalOpen"
      title="Delete Student"
      :message="`Are you sure you want to delete ${studentToDelete?.fullName} (${studentToDelete?.isuId})?`"
      confirm-text="Delete"
      :is-danger="true"
      :busy="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});

import { ref, computed } from 'vue';
import { useStudentStore } from '~/stores/students';
import { getErrorMessage } from '~/utils/errors';

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

const cleanQuery = computed(() => {
  const q = {};
  for (const [key, val] of Object.entries(studentStore.filters)) {
    if (val !== '' && val !== null && val !== undefined) {
      q[key] = val;
    }
  }
  return q;
});

const { data, pending, error, refresh } = await useAsyncData(
  'students-list',
  async () => {
    const baseUrl = resolveApiBase();
    const headers = {};
    if (tokenCookie.value) {
      headers.Authorization = `Bearer ${tokenCookie.value}`;
    }

    const response = await $fetch.raw(`${baseUrl}/students`, {
      headers,
      query: cleanQuery.value
    });

    const headerTotal = response.headers.get('x-total-count');
    const items = Array.isArray(response._data) ? response._data : [];
    const total = headerTotal !== null ? Number(headerTotal) : items.length;

    return { items, total };
  },
  {
    watch: [cleanQuery]
  }
);

const students = computed(() => data.value?.items || []);
const totalCount = computed(() => data.value?.total || 0);

const currentPage = computed(() => {
  return Math.floor(studentStore.filters.offset / studentStore.filters.limit) + 1;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalCount.value / studentStore.filters.limit));
});

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return String(dateStr);
}

function toggleSort(column) {
  if (studentStore.filters.sortBy === column) {
    studentStore.filters.order = studentStore.filters.order === 'asc' ? 'desc' : 'asc';
  } else {
    studentStore.filters.sortBy = column;
    studentStore.filters.order = 'asc';
  }
  studentStore.filters.offset = 0;
}

function sortIndicator(column) {
  if (studentStore.filters.sortBy !== column) return '';
  return studentStore.filters.order === 'asc' ? '▲' : '▼';
}

function onSearch(newValues) {
  Object.assign(studentStore.filters, newValues);
  studentStore.filters.offset = 0;
}

function onReset() {
  studentStore.resetFilters();
}

function onChangePage(newPage) {
  studentStore.filters.offset = (newPage - 1) * studentStore.filters.limit;
}

function onChangeLimit(newLimit) {
  studentStore.filters.limit = newLimit;
  studentStore.filters.offset = 0;
}

function goToStudent(isuId) {
  navigateTo(`/students/${isuId}`);
}

const isStudentModalOpen = ref(false);
const selectedStudent = ref(null);

function openAddModal() {
  selectedStudent.value = null;
  isStudentModalOpen.value = true;
}

function openEditModal(student) {
  selectedStudent.value = { ...student };
  isStudentModalOpen.value = true;
}

function closeStudentModal() {
  isStudentModalOpen.value = false;
  selectedStudent.value = null;
}

async function onStudentSaved() {
  closeStudentModal();
  await refresh();
}

const isConfirmModalOpen = ref(false);
const studentToDelete = ref(null);
const isDeleting = ref(false);

function openDeleteModal(student) {
  studentToDelete.value = student;
  isConfirmModalOpen.value = true;
}

function closeDeleteModal() {
  if (isDeleting.value) return;
  isConfirmModalOpen.value = false;
  studentToDelete.value = null;
}

async function confirmDelete() {
  if (!studentToDelete.value) return;
  isDeleting.value = true;
  try {
    await studentStore.deleteStudent(studentToDelete.value.isuId);
    isConfirmModalOpen.value = false;
    studentToDelete.value = null;
    await refresh();
  } catch (err) {
    studentStore.notify(getErrorMessage(err, 'Failed to delete student'), 'error');
  } finally {
    isDeleting.value = false;
  }
}
</script>