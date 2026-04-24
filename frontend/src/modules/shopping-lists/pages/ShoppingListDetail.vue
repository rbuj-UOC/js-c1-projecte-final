<script setup lang="ts">
import { mapApiError } from "@/api/apiErrors";
import { useToast } from "@/common/composables/useToast";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getProducts } from "@/modules/products/services/products.service";
import type { Product } from "@/modules/products/models/product.model";
import {
  addShoppingListItem,
  deleteShoppingList,
  deleteShoppingListItem,
  getShoppingListById,
  updateShoppingList,
} from "@/modules/shopping-lists/services/shopping-lists.service";
import type { ShoppingList } from "../models/shopping-list.model";

const props = defineProps<{ id: string }>();

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const savingList = ref(false);
const savingItemId = ref<string | null>(null);
const deletingList = ref(false);
const error = ref<string | null>(null);
const list = ref<ShoppingList | null>(null);
const products = ref<Product[]>([]);

const listForm = reactive({
  title: "",
  date: "",
});

const newItem = reactive({
  productId: "",
  quantity: 1,
  price: 0,
});

const safeItems = computed(() => list.value?.items ?? []);

const itemCount = computed(() => safeItems.value.length);

const totalAmount = computed(() =>
  safeItems.value.reduce((sum, item) => sum + getSubtotal(item.quantity, item.price), 0),
);

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getSubtotal(quantity: string, price: string) {
  return Number(quantity) * Number(price);
}

async function loadDetail() {
  loading.value = true;
  error.value = null;

  try {
    const [listData, productData] = await Promise.all([
      getShoppingListById(props.id),
      getProducts(),
    ]);

    list.value = listData;
    products.value = productData;
    listForm.title = listData.title;
    listForm.date = listData.date;
    if (!newItem.productId) {
      newItem.productId = productData[0]?.productId ?? "";
    }
  } catch (e) {
    error.value = mapApiError(e, "No se ha podido cargar la lista.");
  } finally {
    loading.value = false;
  }
}

async function onSaveList() {
  if (!list.value) return;

  savingList.value = true;
  try {
    const updated = await updateShoppingList(list.value.shoppingListId, {
      title: listForm.title,
      date: listForm.date,
    });

    list.value = updated;
    listForm.title = updated.title;
    listForm.date = updated.date;
    toast.success("Lista actualizada");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido actualizar la lista"));
  } finally {
    savingList.value = false;
  }
}

async function onAddItem() {
  if (!list.value) return;

  const currentListId = list.value.shoppingListId;
  savingItemId.value = "new";
  try {
    const updated = await addShoppingListItem(currentListId, {
      productId: newItem.productId,
      quantity: newItem.quantity,
      price: newItem.price,
    });

    list.value = updated;

    try {
      const freshList = await getShoppingListById(currentListId);
      list.value = {
        ...list.value,
        ...freshList,
        items: freshList.items ?? [],
      };
    } catch {
      // Mantiene el estado local optimista si la recarga falla.
    }

    toast.success("Producto añadido a la lista");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido añadir el producto"));
  } finally {
    savingItemId.value = null;
  }
}

async function onDeleteItem(itemId: string) {
  if (!list.value) return;
  if (!window.confirm("¿Quieres eliminar este producto de la lista?")) return;

  const previousList = list.value;
  savingItemId.value = itemId;
  try {
    const updated = await deleteShoppingListItem(list.value.shoppingListId, itemId);
    const updatedItems = updated.items ?? previousList.items ?? [];
    list.value = {
      ...previousList,
      ...updated,
      items: updatedItems.filter((item) => item.shoppingListItemId !== itemId),
    };

    // Recarga silenciosa para mantener la UI alineada con backend si la respuesta de borrado es inconsistente.
    try {
      const freshList = await getShoppingListById(previousList.shoppingListId);
      list.value = {
        ...list.value,
        ...freshList,
        items: freshList.items ?? [],
      };
    } catch {
      // Mantiene el estado local optimista si la recarga falla.
    }

    toast.success("Producto eliminado de la lista");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido eliminar el producto"));
  } finally {
    savingItemId.value = null;
  }
}

async function onDeleteList() {
  if (!list.value) return;
  if (!window.confirm("¿Quieres eliminar esta lista?")) return;

  deletingList.value = true;
  try {
    await deleteShoppingList(list.value.shoppingListId);
    toast.success("Lista eliminada");
    router.push("/shopping-lists");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido eliminar la lista"));
  } finally {
    deletingList.value = false;
  }
}

onMounted(loadDetail);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h4 mb-1">Detalle de la lista</h1>
        <p class="text-muted mb-0">Añade y elimina productos dentro de la lista.</p>
      </div>

      <div class="d-flex gap-2">
        <RouterLink to="/shopping-lists" class="btn btn-outline-secondary"
          >Volver a listas</RouterLink
        >
        <button
          type="button"
          class="btn btn-outline-danger"
          :disabled="deletingList"
          @click="onDeleteList"
        >
          <span v-if="deletingList" class="spinner-border spinner-border-sm me-2"></span>
          Eliminar lista
        </button>
      </div>
    </header>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="list && !loading" class="row g-4">
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <h2 class="h6 mb-3">Información de la lista</h2>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Título</label>
                <input v-model="listForm.title" type="text" class="form-control" />
              </div>
              <div class="col-12">
                <label class="form-label">Fecha</label>
                <input v-model="listForm.date" type="date" class="form-control" />
              </div>
              <div class="col-12 d-grid">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="savingList"
                  @click="onSaveList"
                >
                  <span v-if="savingList" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar lista
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h2 class="h6 mb-3">Resumen</h2>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Número de ítems</span>
              <strong>{{ itemCount }}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">Total</span>
              <strong>{{ formatAmount(totalAmount) }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-8">
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <h2 class="h6 mb-3">Añadir producto</h2>
            <div class="row g-3 align-items-end">
              <div class="col-12 col-md-5">
                <label class="form-label">Producto</label>
                <select v-model="newItem.productId" class="form-select">
                  <option
                    v-for="product in products"
                    :key="product.productId"
                    :value="product.productId"
                  >
                    {{ product.name }} ({{ product.unit }})
                  </option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label">Cantidad</label>
                <input
                  v-model.number="newItem.quantity"
                  type="number"
                  min="1"
                  class="form-control"
                />
              </div>
              <div class="col-6 col-md-2">
                <label class="form-label">Precio</label>
                <input
                  v-model.number="newItem.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-control"
                />
              </div>
              <div class="col-12 col-md-1 d-grid">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  :disabled="savingItemId === 'new' || !newItem.productId"
                  @click="onAddItem"
                >
                  <span
                    v-if="savingItemId === 'new'"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h2 class="h6 mb-3">Productos de la lista</h2>

            <div v-if="safeItems.length === 0" class="alert alert-info mb-0">
              La lista aún no tiene productos.
            </div>

            <div v-else class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Producto</th>
                    <th style="width: 15%">Cantidad</th>
                    <th style="width: 15%">Unidad</th>
                    <th style="width: 15%">Precio</th>
                    <th style="width: 15%">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in safeItems" :key="item.shoppingListItemId">
                    <td>
                      {{ item.product.name }}
                    </td>
                    <td>
                      {{ item.quantity }}
                    </td>
                    <td>
                      {{ item.product.unit }}
                    </td>
                    <td>
                      {{ formatAmount(Number(item.price)) }}
                    </td>
                    <td>
                      {{ formatAmount(getSubtotal(item.quantity, item.price)) }}
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        :disabled="savingItemId === item.shoppingListItemId"
                        @click="onDeleteItem(item.shoppingListItemId)"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
