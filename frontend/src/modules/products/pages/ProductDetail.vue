<script setup lang="ts">
import { mapApiError } from "@/api/apiErrors";
import { useToast } from "@/common/composables/useToast";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  deleteProduct,
  getProductById,
  getProductUnits,
  updateProduct,
} from "@/modules/products/services/products.service";
import { useConfirmDialog } from "@/common/composables/useConfirmDialog";
import type { Product } from "../models/product.model";
import type { ProductUnit } from "../models/product-unit.model";

const props = defineProps<{ id: string }>();

const router = useRouter();
const toast = useToast();
const confirmDialog = useConfirmDialog();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const product = ref<Product | null>(null);
const units = ref<Array<ProductUnit | string>>([]);

const form = reactive({
  name: "",
  description: "",
  unit: "",
});

function getUnitOptionValue(unit: ProductUnit | string) {
  return typeof unit === "string" ? unit : unit.id;
}

function getUnitOptionLabel(unit: ProductUnit | string) {
  return typeof unit === "string" ? unit : unit.name;
}

function getSelectedUnitLabel() {
  const selectedUnit = units.value.find((option) => getUnitOptionValue(option) === form.unit);
  return selectedUnit ? getUnitOptionLabel(selectedUnit) : form.unit;
}

const hasChanges = computed(() => {
  if (!product.value) return false;

  return (
    form.name !== product.value.name ||
    form.description !== product.value.description ||
    form.unit !== product.value.unit
  );
});

async function loadProduct() {
  loading.value = true;
  error.value = null;

  try {
    const [productData, unitData] = await Promise.all([
      getProductById(props.id),
      getProductUnits(),
    ]);
    product.value = productData;
    units.value = unitData;
    form.name = productData.name;
    form.description = productData.description;
    form.unit = productData.unit;
    if (!form.unit && unitData[0]) {
      form.unit = getUnitOptionValue(unitData[0]);
    }
  } catch (e) {
    error.value = mapApiError(e, "No se ha podido cargar el producto.");
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  if (!product.value || !hasChanges.value) return;

  saving.value = true;
  try {
    const updated = await updateProduct(product.value.productId, {
      name: form.name,
      description: form.description,
      unit: form.unit,
    });

    product.value = updated;
    form.name = updated.name;
    form.description = updated.description;
    form.unit = updated.unit;
    toast.success("Producto actualizado");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido actualizar el producto"));
  } finally {
    saving.value = false;
  }
}

async function onDelete() {
  if (!product.value) return;
  const confirmed = await confirmDialog.confirm({
    title: "Eliminar producto",
    message: "¿Seguro que quieres eliminar este producto?",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    variant: "danger",
  });

  if (!confirmed) return;

  deleting.value = true;
  try {
    await deleteProduct(product.value.productId);
    toast.success("Producto eliminado");
    router.push("/products");
  } catch (e) {
    toast.error(mapApiError(e, "No se ha podido eliminar el producto"));
  } finally {
    deleting.value = false;
  }
}

onMounted(loadProduct);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h4 mb-1">Detalle del producto</h1>
        <p class="text-muted mb-0">Edita o elimina el producto seleccionado.</p>
      </div>

      <RouterLink to="/products" class="btn btn-outline-secondary">Volver al catálogo</RouterLink>
    </header>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="product && !loading" class="card shadow-sm border-0">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div class="text-muted small">ID: {{ product.productId }}</div>
            <h2 class="h5 mb-1">{{ product.name }}</h2>
            <div class="text-secondary">{{ getSelectedUnitLabel() }}</div>
          </div>

          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-outline-danger"
              :disabled="deleting"
              @click="onDelete"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              Eliminar
            </button>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Nombre</label>
            <input v-model="form.name" type="text" class="form-control" />
          </div>

          <div class="col-12">
            <label class="form-label">Descripción</label>
            <textarea v-model="form.description" rows="4" class="form-control"></textarea>
          </div>

          <div class="col-12 col-md-4">
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

          <div class="col-12 col-md-4 d-flex align-items-end">
            <button
              type="button"
              class="btn btn-primary w-100"
              :disabled="saving || !hasChanges"
              @click="onSave"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
