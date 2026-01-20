<template>
  <!-- Main container for the user management view -->
  <v-container class="py-6">

    <!-- Top action bar: search + action buttons -->
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="6">
        <!-- Search field for filtering table data -->
        <v-text-field
          v-model="search"
          clearable
          label="Search (name, email, location...)"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>

      <v-col class="d-flex justify-end ga-2" cols="12" md="6">
        <!-- Reload users from backend -->
        <v-btn :loading="loading" variant="tonal" @click="loadUsers">
          Refresh
        </v-btn>

        <!-- Trigger CSV import via backend -->
        <v-btn :loading="importing" variant="outlined" @click="runImport">
          CSV Import
        </v-btn>

        <!-- Open dialog for creating a new user -->
        <v-btn color="primary" @click="openCreate">
          Create User
        </v-btn>
      </v-col>
    </v-row>

    <!-- User table -->
    <v-card>
      <v-data-table
        class="text-no-wrap"
        :headers="headers"
        item-key="_id"
        :items="users"
        :loading="loading"
        :search="search"
      >
        <!-- Blocked status column -->
        <template #item.blocked="{ item }">
          <v-chip variant="tonal">
            {{ item.blocked ? "Blocked" : "OK" }}
          </v-chip>
        </template>

        <!-- Action buttons per row -->
        <template #item.actions="{ item }">
          <v-btn size="small" variant="text" @click="openEdit(item)">
            Edit
          </v-btn>

          <v-btn size="small" variant="text" @click="toggleBlock(item)">
            {{ item.blocked ? "Unblock" : "Block" }}
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog for creating or editing a user -->
    <v-dialog v-model="dialogOpen" max-width="560">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>
            {{ editingUserId ? "Edit User" : "Create User" }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
        </v-card-title>

        <v-card-text>
          <!-- User form -->
          <v-form @submit.prevent="saveUser">
            <v-text-field v-model="form.name" label="Name" required />
            <v-text-field v-model="form.email" label="Email" required />
            <v-text-field v-model="form.location" label="Location" />
            <v-switch v-model="form.active" label="Active" />

            <div class="d-flex justify-end ga-2 mt-4">
              <v-btn variant="text" @click="closeDialog">
                Cancel
              </v-btn>
              <v-btn color="primary" :loading="saving" type="submit">
                Save
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar for success/error messages -->
    <v-snackbar v-model="snackbarOpen" timeout="2500">
      {{ snackbarText }}
    </v-snackbar>

  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { api } from '../api'

  /**
   * ============================================================
   * STATE
   * ============================================================
   */

  // List of users loaded from backend
  const users = ref([])

  // Loading indicators
  const loading = ref(false)
  const importing = ref(false)
  const saving = ref(false)

  // Search value for table filtering
  const search = ref('')

  // Dialog state
  const dialogOpen = ref(false)
  const editingUserId = ref(null)

  // Form model for create/edit
  const form = ref({
    name: '',
    email: '',
    location: '',
    active: true,
  })

  // Snackbar state
  const snackbarOpen = ref(false)
  const snackbarText = ref('')

  /**
   * Table column configuration for Vuetify data table
   */
  const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Location', key: 'location', sortable: true },
    { title: 'Active', key: 'active', sortable: true },
    { title: 'Blocked', key: 'blocked', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
  ]

  /**
   * ============================================================
   * HELPERS
   * ============================================================
   */

  // Display a snackbar message
  function toast (message) {
    snackbarText.value = message
    snackbarOpen.value = true
  }

  /**
   * ============================================================
   * API ACTIONS
   * ============================================================
   */

  // Load all users from backend
  async function loadUsers () {
    try {
      loading.value = true
      const res = await api.listUsers()
      users.value = res.items || []
    } catch (error) {
      toast(error.message || 'Failed to load users')
    } finally {
      loading.value = false
    }
  }

  // Open dialog for creating a new user
  function openCreate () {
    editingUserId.value = null
    form.value = { name: '', email: '', location: '', active: true }
    dialogOpen.value = true
  }

  // Open dialog for editing an existing user
  function openEdit (item) {
    editingUserId.value = item._id
    form.value = {
      name: item.name || '',
      email: item.email || '',
      location: item.location || '',
      active: item.active ?? true,
    }
    dialogOpen.value = true
  }

  // Close dialog
  function closeDialog () {
    dialogOpen.value = false
  }

  // Create or update user
  async function saveUser () {
    try {
      saving.value = true

      if (editingUserId.value) {
        await api.updateUser(editingUserId.value, form.value)
        toast('User updated')
      } else {
        await api.createUser(form.value)
        toast('User created')
      }

      dialogOpen.value = false
      await loadUsers()
    } catch (error) {
      toast(error.message || 'Save failed')
    } finally {
      saving.value = false
    }
  }

  // Toggle blocked/unblocked state
  async function toggleBlock (item) {
    try {
      if (item.blocked) {
        await api.unblockUser(item._id)
        toast('User unblocked')
      } else {
        await api.blockUser(item._id)
        toast('User blocked')
      }
      await loadUsers()
    } catch (error) {
      toast(error.message || 'Action failed')
    }
  }

  // Trigger CSV import
  async function runImport () {
    try {
      importing.value = true
      const res = await api.importCsv()
      toast(`Import successful: ${res.imported ?? 0} users`)
      await loadUsers()
    } catch (error) {
      toast(error.message || 'Import failed')
    } finally {
      importing.value = false
    }
  }

  // Load users when component is mounted
  onMounted(loadUsers)
</script>
