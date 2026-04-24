<script setup lang="ts"></script>

<template>
  <section class="py-5 bg-body-tertiary rounded-4 border">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-9">
          <h1 class="display-6 fw-bold mb-3">Sobre la aplicación</h1>
          <p class="lead text-secondary mb-0">
            Este proyecto implementa el flujo completo pedido en el enunciado: autenticación,
            perfil, catálogo de productos y listas de compra con mensajes reutilizables.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body p-4">
              <h2 class="h5">Qué resuelve</h2>
              <ul class="mb-0 text-secondary">
                <li class="mb-2">Registro, login y logout con JWT persistente.</li>
                <li class="mb-2">Edición del perfil y acciones para seed/reset de datos.</li>
                <li class="mb-2">CRUD de productos con vista lista o tarjetas.</li>
                <li class="mb-2">CRUD de listas de compra y de sus productos internos.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body p-4">
              <h2 class="h5">Stack</h2>
              <p class="text-secondary mb-0">
                La interfaz está hecha con Vue 3, Vue Router, Bootstrap y vee-validate con Yup para
                validar formularios.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 text-center">
        <RouterLink to="/shopping-lists" class="btn btn-dark btn-lg me-2">Ir a listas</RouterLink>
        <RouterLink to="/products" class="btn btn-outline-dark btn-lg">Ir a productos</RouterLink>
      </div>
    </div>
  </section>
</template>
