<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Product } from "../models/product.model";

defineProps<{
  product: Product;
}>();
</script>

<template>
  <article class="card h-100 shadow-sm border-0">
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h3 class="h6 mb-1">{{ product.name }}</h3>
        </div>
        <span class="badge text-bg-dark">{{ product.unit }}</span>
      </div>

      <p class="text-secondary flex-grow-1 mb-3">{{ product.description }}</p>

      <RouterLink
        :to="`/products/${product.productId}`"
        class="btn btn-outline-primary btn-sm align-self-start"
      >
        Editar producto
      </RouterLink>
    </div>
  </article>
</template>
