<script setup lang="ts">
import { mapApiError } from "@/api/apiErrors";
import { useToast } from "@/common/composables/useToast";
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  createProduct,
  getProductUnits,
  getProducts,
} from "@/modules/products/services/products.service";
import ProductCard from "../components/ProductCard.vue";
import type { CreateProductDto } from "../models/create-product.dto";
import type { Product } from "../models/product.model";
import type { ProductUnit } from "../models/product-unit.model";

const toast = useToast();

const products = ref<Product[]>([]);
const units = ref<Array<ProductUnit | string>>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const search = ref("");
const viewMode = ref<"cards" | "list">("cards");

const form = reactive<CreateProductDto>({
  name: "",
  description: "",
  unit: "",
});

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const filteredProducts = computed(() => {
  const term = normalizeSearchValue(search.value);

  if (!term) return products.value;

  return products.value.filter((product) => {
    return normalizeSearchValue(product.name).includes(term);
  });
});

const totalProducts = computed(() => products.value.length);
const totalUnits = computed(() => units.value.length);

function getUnitLabel(unitId: string) {
  const unit = units.value.find((option) => getUnitOptionValue(option) === unitId);
  return unit ? getUnitOptionLabel(unit) : unitId;
}

function getUnitOptionValue(unit: ProductUnit | string) {
  return typeof unit === "string" ? unit : unit.id;
}

function getUnitOptionLabel(unit: ProductUnit | string) {
  return typeof unit === "string" ? unit : unit.name;
}

function resetForm() {
  form.name = "";
  form.description = "";
  form.unit = getUnitOptionValue(units.value[0] ?? "UNIT");
}

async function loadCatalog() {
  loading.value = true;
  error.value = null;

  try {
    const [productData, unitData] = await Promise.all([getProducts(), getProductUnits()]);
    products.value = productData;
    units.value = unitData;
    if (!form.unit) {
      form.unit = getUnitOptionValue(unitData[0] ?? "UNIT");
    }
  } catch (e) {
    error.value = mapApiError(e, "No se ha podido cargar el catálogo de productos.");
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  try {
    await createProduct({ ...form });
    toast.success("Producto creado correctamente");
    resetForm();
    await loadCatalog();
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido crear el producto"));
  }
}

onMounted(async () => {
  await loadCatalog();
});
</script>

<template>
  <section class="container py-4">
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h4 mb-1">Catálogo de productos</h1>
        <p class="text-muted mb-0">Crea, busca y administra los productos disponibles.</p>
      </div>

      <div class="d-flex gap-2">
        <div class="btn-group" role="group" aria-label="Cambiar vista">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :class="{ active: viewMode === 'cards' }"
            @click="viewMode = 'cards'"
          >
            Tarjetas
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            Lista
          </button>
        </div>

        <button
          type="button"
          class="btn btn-outline-primary"
          :disabled="loading"
          @click="loadCatalog"
        >
          Recargar
        </button>
      </div>
    </header>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Productos</div>
            <div class="h2 mb-0">{{ totalProducts }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Unidades</div>
            <div class="h2 mb-0">{{ totalUnits }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="text-muted small">Vista actual</div>
            <div class="h2 mb-0 text-capitalize">{{ viewMode }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-xl-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <h2 class="h6 mb-3">Nuevo producto</h2>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Nombre</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Escribe el nombre del producto"
                />
              </div>

              <div class="col-12">
                <label class="form-label">Descripción</label>
                <textarea v-model="form.description" rows="3" class="form-control"></textarea>
              </div>

              <div class="col-12 col-md-6 col-xl-12">
                <label class="form-label">Unidad</label>
                <select v-model="form.unit" class="form-select">
                  <option
                    v-for="unit in units"
                    :key="getUnitOptionValue(unit)"
                    :value="getUnitOptionValue(unit)"
                  >
                    {{ getUnitOptionLabel(unit) }}
                  </option>
                </select>
              </div>

              <div class="col-12 d-grid">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="loading || !form.name || !form.unit"
                  @click="onCreate"
                >
                  Crear producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-8">
        <div class="card shadow-sm border-0 mb-3">
          <div class="card-body">
            <label for="product-search" class="form-label small text-muted mb-1"
              >Buscar por nombre</label
            >
            <input
              id="product-search"
              v-model="search"
              type="search"
              class="form-control"
              placeholder="Escribe para filtrar productos"
            />
          </div>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="alert alert-info">
          No hay productos que coincidan con la búsqueda.
        </div>

        <div v-else-if="viewMode === 'cards'" class="row g-3">
          <div v-for="product in filteredProducts" :key="product.productId" class="col-md-6">
            <ProductCard :product="product" :unit-label="getUnitLabel(product.unit)" />
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle bg-white shadow-sm rounded-3 overflow-hidden">
            <thead class="table-light">
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.productId">
                <td>
                  <div class="fw-semibold">{{ product.name }}</div>
                  <div class="text-muted small">{{ product.description }}</div>
                </td>
                <td>{{ getUnitLabel(product.unit) }}</td>
                <td class="text-end">
                  <RouterLink
                    :to="`/products/${product.productId}`"
                    class="btn btn-outline-primary btn-sm"
                  >
                    Editar
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
