<template>
  <v-container class="py-6">
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search (name, email, location...)"
          clearable
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-end ga-2">
        <v-btn variant="tonal" @click="loadUsers" :loading="loading">
          Refresh
        </v-btn>

        <v-btn variant="outlined" @click="runImport" :loading="importing">
          Import CSV
        </v-btn>

        <v-btn color="primary" @click="openCreate">
          Create user
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        item-key="_id"
        class="text-no-wrap"
      >
        <template #item.blocked="{ item }">
          <v-chip variant="tonal">
            {{ item.blocked ? "Blocked" : "Active" }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="text" @click="openEdit(item)">
            Edit
          </v-btn>

          <v-btn
            size="small"
            variant="text"
            @click="toggleBlock(item)"
          >
            {{ item.blocked ? "Unblock" : "Block" }}
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog: Create / Edit -->
    <v-dialog v-model="dialogOpen" max-width="560">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ editingUserId ? "Edit user" : "Create user" }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="saveUser">
            <v-text-field v-model="form.name" label="Name" required />
            <v-text-field v-model="form.email" label="Email" required />
            <v-text-field v-model="form.location" label="Location" />
            <v-switch v-model="form.active" label="Active" />

            <div class="d-flex justify-end ga-2 mt-4">
              <v-btn variant="text" @click="closeDialog">
                Cancel
              </v-btn>
              <v-btn color="primary" type="submit" :loading="saving">
                Save
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbarOpen" timeout="2500">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "../api";

const users = ref([]);
const loading = ref(false);
const importing = ref(false);
const search = ref("");

const headers = [
  { title: "Name", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Location", key: "location", sortable: true },
  { title: "Active", key: "active", sortable: true },
  { title: "Blocked", key: "blocked", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

const dialogOpen = ref(false);
const saving = ref(false);
const editingUserId = ref(null);

const form = ref({
  name: "",
  email: "",
  location: "",
  active: true,
});

const snackbarOpen = ref(false);
const snackbarText = ref("");

function toast(message) {
  snackbarText.value = message;
  snackbarOpen.value = true;
}

async function loadUsers() {
  try {
    loading.value = true;
    const res = await api.listUsers();
    users.value = res.items || [];
  } catch (e) {
    toast(e.message);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingUserId.value = null;
  form.value = { name: "", email: "", location: "", active: true };
  dialogOpen.value = true;
}

function openEdit(item) {
  editingUserId.value = item._id;
  form.value = {
    name: item.name || "",
    email: item.email || "",
    location: item.location || "",
    active: item.active ?? true,
  };
  dialogOpen.value = true;
}

function closeDialog() {
  dialogOpen.value = false;
}

async function saveUser() {
  try {
    saving.value = true;

    if (editingUserId.value) {
      await api.updateUser(editingUserId.value, form.value);
      toast("User updated");
    } else {
      await api.createUser(form.value);
      toast("User created");
    }

    dialogOpen.value = false;
    await loadUsers();
  } catch (e) {
    toast(e.message);
  } finally {
    saving.value = false;
  }
}

async function toggleBlock(item) {
  try {
    if (item.blocked) {
      await api.unblockUser(item._id);
      toast("User unblocked");
    } else {
      await api.blockUser(item._id);
      toast("User blocked");
    }
    await loadUsers();
  } catch (e) {
    toast(e.message);
  }
}

async function runImport() {
  try {
    importing.value = true;
    const res = await api.importCsv();
    toast(`Import successful: ${res.imported ?? 0} users`);
    await loadUsers();
  } catch (e) {
    toast(e.message);
  } finally {
    importing.value = false;
  }
}

onMounted(loadUsers);
</script>
