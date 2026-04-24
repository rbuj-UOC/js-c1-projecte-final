<script setup lang="ts"></script>

<template>
  <div class="container-fluid p-0">
    <div class="row g-0 min-vh-100">
      <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center brand-side">
        <div class="text-center px-4 px-lg-5">
          <img
            src="@/assets/logo.svg"
            alt="Lista de la Compra"
            class="img-fluid mb-4"
            style="max-width: 180px"
          />
          <h2 class="fw-bold mb-3">Lista de la Compra</h2>
          <p class="text-secondary mb-0 lead">
            Organiza la compra semanal con una experiencia simple y visual.
          </p>
        </div>
      </div>

      <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center auth-side">
        <div class="w-100 px-3 px-md-4" style="max-width: 460px">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brand-side {
  background: linear-gradient(135deg, #e9f3ff 0%, #f6f9ff 100%);
  padding: 2rem;
}

.auth-side {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
}

@media (max-width: 991.98px) {
  .brand-side img {
    max-width: 120px;
  }
}
</style>
