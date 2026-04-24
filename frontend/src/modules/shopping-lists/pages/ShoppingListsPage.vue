<script setup lang="ts">
import { mapApiError } from "@/api/apiErrors";
import { useToast } from "@/common/composables/useToast";
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  createShoppingList,
  deleteShoppingList,
  getShoppingLists,
} from "@/modules/shopping-lists/services/shopping-lists.service";
import type { CreateShoppingListDto } from "../models/create-shopping-list.dto";
import type { ShoppingList } from "../models/shopping-list.model";

const toast = useToast();

const lists = ref<ShoppingList[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref("");

const form = reactive<CreateShoppingListDto>({
  title: "",
  date: new Date().toISOString().substring(0, 10),
});

const filteredLists = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return lists.value;

  return lists.value.filter((list) => {
    return list.title.toLowerCase().includes(term);
  });
});

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

async function loadLists() {
  loading.value = true;
  error.value = null;

  try {
    lists.value = await getShoppingLists();
  } catch (e) {
    error.value = mapApiError(e, "No se han podido cargar las listas.");
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  try {
    await createShoppingList({ ...form });
    toast.success("Lista creada correctamente");
    form.title = "";
    form.date = new Date().toISOString().substring(0, 10);
    await loadLists();
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido crear la lista"));
  }
}

async function onDelete(listId: string) {
  if (!window.confirm("¿Quieres eliminar esta lista de compra?")) return;

  try {
    await deleteShoppingList(listId);
    toast.success("Lista eliminada");
    await loadLists();
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido eliminar la lista"));
  }
}

onMounted(loadLists);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h4 mb-1">Listas de la compra</h1>
        <p class="text-muted mb-0">Busca, crea y revisa tus listas de compra.</p>
      </div>

      <button type="button" class="btn btn-outline-primary" :disabled="loading" @click="loadLists">
        Recargar
      </button>
    </header>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Listas totales</div>
            <div class="h2 mb-0">{{ lists.length }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Filtradas</div>
            <div class="h2 mb-0">{{ filteredLists.length }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Estado</div>
            <div class="h2 mb-0">Activo</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <h2 class="h6 mb-3">Nueva lista</h2>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Título</label>
                <input v-model="form.title" type="text" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Fecha</label>
                <input v-model="form.date" type="date" class="form-control" />
              </div>

              <div class="col-12 d-grid">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="!form.title || loading"
                  @click="onCreate"
                >
                  Crear lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-8">
        <div class="card shadow-sm border-0 mb-3">
          <div class="card-body">
            <label for="shopping-list-search" class="form-label small text-muted mb-1">
              Buscar por nombre
            </label>
            <input
              id="shopping-list-search"
              v-model="search"
              type="search"
              class="form-control"
              placeholder="Escribe para filtrar listas"
            />
          </div>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>

        <div v-else-if="filteredLists.length === 0" class="alert alert-info">
          No hay listas para mostrar.
        </div>

        <div v-else class="row g-3">
          <div v-for="list in filteredLists" :key="list.shoppingListId" class="col-md-6">
            <div class="card h-100 shadow-sm border-0">
              <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h3 class="h6 mb-1">{{ list.title }}</h3>
                    <div class="text-muted small">{{ formatDate(list.date) }}</div>
                  </div>
                </div>

                <div class="mt-auto d-flex gap-2">
                  <RouterLink
                    :to="`/shopping-lists/${list.shoppingListId}`"
                    class="btn btn-outline-primary btn-sm"
                  >
                    Abrir
                  </RouterLink>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="onDelete(list.shoppingListId)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
