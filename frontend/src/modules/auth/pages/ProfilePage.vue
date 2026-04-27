<script setup lang="ts">
import { mapApiError } from "@/api/apiErrors";
import { useToast } from "@/common/composables/useToast";
import { clearAuth, getUser, setUser } from "@/modules/auth/utils/token";
import {
  getCurrentUser,
  resetCurrentUserData,
  seedCurrentUserData,
  updateCurrentUser,
} from "@/modules/auth/services/user.service";
import { useConfirmDialog } from "@/common/composables/useConfirmDialog";
import type { UpdateUserDto } from "@/modules/auth/models/update-user.dto";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();
const confirmDialog = useConfirmDialog();

const loading = ref(false);
const saving = ref(false);
const actionLoading = ref(false);
const error = ref<string | null>(null);

const user = ref(getUser());
const form = reactive({
  name: "",
  email: "",
  password: "",
});

const hasChanges = computed(() => {
  if (!user.value) return false;

  return (
    form.name !== user.value.name || form.email !== user.value.email || form.password.length > 0
  );
});

async function loadProfile() {
  loading.value = true;
  error.value = null;

  try {
    const data = await getCurrentUser();
    user.value = data;
    form.name = data.name;
    form.email = data.email;
    form.password = "";
    setUser(data, true);
  } catch (e) {
    error.value = mapApiError(e, "No se ha podido cargar el perfil.");
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  if (!user.value || !hasChanges.value) return;

  saving.value = true;
  try {
    const payload: UpdateUserDto = {};

    if (form.name !== user.value.name) payload.name = form.name;
    if (form.email !== user.value.email) payload.email = form.email;
    if (form.password) payload.password = form.password;

    const updated = await updateCurrentUser(payload);
    user.value = updated;
    form.name = updated.name;
    form.email = updated.email;
    form.password = "";
    setUser(updated, true);
    toast.success("Perfil actualizado");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido actualizar el perfil"));
  } finally {
    saving.value = false;
  }
}

async function onResetData() {
  const confirmed = await confirmDialog.confirm({
    title: "Eliminar datos",
    message: "¿Seguro que quieres eliminar todos tus datos?",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    variant: "danger",
  });

  if (!confirmed) return;

  actionLoading.value = true;
  try {
    await resetCurrentUserData();
    toast.success("Tus datos se han eliminado");
  } catch (e) {
    toast.error(mapApiError(e, "No se han podido eliminar tus datos"));
  } finally {
    actionLoading.value = false;
  }
}

async function onSeedData() {
  const confirmed = await confirmDialog.confirm({
    title: "Cargar datos de ejemplo",
    message: "¿Quieres cargar los datos de ejemplo?",
    confirmText: "Cargar",
    cancelText: "Cancelar",
    variant: "warning",
  });

  if (!confirmed) return;

  actionLoading.value = true;
  try {
    await seedCurrentUserData();
    toast.success("Datos de ejemplo cargados");
  } catch (e) {
    toast.error(mapApiError(e, "No se han podido cargar los datos de ejemplo"));
  } finally {
    actionLoading.value = false;
  }
}

function onLogout() {
  clearAuth();
  toast.info("Sesión cerrada");
  router.push("/");
}

onMounted(loadProfile);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h4 mb-1">Perfil de usuario</h1>
        <p class="text-muted mb-0">Actualiza tus datos o recarga la cuenta de ejemplo.</p>
      </div>

      <button type="button" class="btn btn-outline-danger" @click="onLogout">Cerrar sesión</button>
    </header>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="user && !loading" class="row g-4">
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h2 class="h6 mb-3">Datos personales</h2>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Nombre</label>
                <input v-model="form.name" type="text" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Nueva contraseña</label>
                <input
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  placeholder="Deja en blanco para mantenerla"
                />
              </div>

              <div class="col-12 d-grid d-sm-flex gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="!hasChanges || saving"
                  @click="onSave"
                >
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar cambios
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="loadProfile">
                  Recargar perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h2 class="h6 mb-3">Acciones de datos</h2>

            <div class="row g-3">
              <div class="col-12">
                <div class="small text-muted">ID</div>
                <div class="fw-semibold">{{ user.id }}</div>
              </div>

              <div class="col-12 d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  :disabled="actionLoading"
                  @click="onResetData"
                >
                  <span v-if="actionLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Eliminar datos de ejemplo
                </button>

                <button
                  type="button"
                  class="btn btn-warning fw-semibold"
                  :disabled="actionLoading"
                  @click="onSeedData"
                >
                  <span v-if="actionLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Cargar datos de ejemplo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
