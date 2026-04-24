<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { clearAuth, isAuthenticated } from "@/modules/auth/utils/token";

const route = useRoute();

const isLoggedIn = computed(() => {
  route.fullPath;
  return isAuthenticated();
});

function onLogout() {
  clearAuth();
  window.location.href = "/";
}
</script>

<template>
  <header class="navbar navbar-expand-lg navbar-dark app-navbar border-bottom">
    <div class="container">
      <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-2">
        <img src="@/assets/logo.svg" alt="Shopping app logo" height="32" />
        <span class="fw-semibold">Lista de la Compra</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <nav id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link" exact-active-class="active">Inicio</RouterLink>
          </li>

          <li v-if="isLoggedIn" class="nav-item">
            <RouterLink to="/products" class="nav-link" exact-active-class="active">
              Productos
            </RouterLink>
          </li>

          <li v-if="isLoggedIn" class="nav-item">
            <RouterLink to="/shopping-lists" class="nav-link" exact-active-class="active">
              Listas
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/about" class="nav-link" exact-active-class="active"
              >Sobre la app</RouterLink
            >
          </li>

          <li v-if="isLoggedIn" class="nav-item">
            <RouterLink to="/profile" class="nav-link" exact-active-class="active">
              Perfil
            </RouterLink>
          </li>

          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <RouterLink to="/login" class="nav-link" exact-active-class="active">
                Entrar
              </RouterLink>
            </li>
            <li class="nav-item ms-lg-2">
              <RouterLink to="/register" class="btn btn-warning fw-semibold btn-sm">
                Crear cuenta
              </RouterLink>
            </li>
          </template>

          <li v-else class="nav-item ms-lg-2">
            <button type="button" class="btn btn-outline-light btn-sm" @click="onLogout">
              Salir
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  background-color: #16213e;
}

.nav-link.active {
  font-weight: 700;
}
</style>
