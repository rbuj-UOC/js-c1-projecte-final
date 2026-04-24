<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { clearAuth } from "@/modules/auth/utils/token";
import { useToast } from "@/common/composables/useToast";

const router = useRouter();
const toast = useToast();

onMounted(() => {
  clearAuth();
  toast.info("Sesión cerrada");
  router.replace("/");
});
</script>

<template>
  <section class="container py-5 text-center">
    <div class="spinner-border mb-3" role="status"></div>
    <p class="text-secondary mb-0">Cerrando sesión...</p>
  </section>
</template>
