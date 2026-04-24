<script setup lang="ts">
import { useToast } from "@/common/composables/useToast";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import * as yup from "yup";

import { mapApiError } from "@/api/apiErrors";
import type { CreateUserDto } from "@/modules/auth/models/create-user.dto";
import { registerUser } from "@/modules/auth/services/auth.service";

type RegisterValues = CreateUserDto & { confirm: string };

const router = useRouter();
const serverError = ref<string | null>(null);
const isSubmitting = ref(false);
const toast = useToast();

const schema: yup.ObjectSchema<RegisterValues> = yup.object({
  name: yup.string().required().min(5),

  email: yup.string().required().email(),

  password: yup
    .string()
    .required()
    .min(6)
    .max(50)
    .matches(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .matches(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .matches(/[0-9]/, "Debe incluir al menos un número"),

  confirm: yup
    .string()
    .required()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

const initialValues: RegisterValues = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

const { handleSubmit, meta, resetForm } = useForm<RegisterValues>({
  validationSchema: schema,
  initialValues,
  validateOnMount: false,
});

const nameField = useField<string>("name");
const emailField = useField<string>("email");
const passwordField = useField<string>("password");
const confirmField = useField<string>("confirm");

const showNameError = computed(() => nameField.meta.touched && !!nameField.errorMessage.value);
const showEmailError = computed(() => emailField.meta.touched && !!emailField.errorMessage.value);
const showPasswordError = computed(
  () => passwordField.meta.touched && !!passwordField.errorMessage.value,
);
const showConfirmError = computed(
  () => confirmField.meta.touched && !!confirmField.errorMessage.value,
);

const canSubmit = computed(() => meta.value.valid && !isSubmitting.value);

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null;
  isSubmitting.value = true;

  try {
    await registerUser({
      email: values.email,
      password: values.password,
      name: values.name,
    });

    resetForm();
    toast.success("Registro realizado correctamente");
    router.push({ path: "/login", query: { registered: "1" } });
  } catch (e) {
    serverError.value = mapApiError(
      e,
      "No se ha podido completar el registro. Revisa los datos e inténtalo de nuevo.",
    );
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <header class="mb-4 text-center">
    <h1 class="h3 fw-bold mb-1">Crear cuenta</h1>
    <p class="text-secondary mb-0">Regístrate para empezar a gestionar tu compra</p>
  </header>

  <form class="card shadow-sm" @submit.prevent="onSubmit" novalidate>
    <div class="card-body p-4 p-md-5">
      <div v-if="serverError" class="alert alert-danger" role="alert">
        {{ serverError }}
      </div>

      <div class="mb-3">
        <label for="name" class="form-label">Nombre</label>
        <input
          id="name"
          type="text"
          v-model="nameField.value.value"
          class="form-control"
          :class="{ 'is-invalid': showNameError }"
          @blur="nameField.handleBlur"
          placeholder="Tu nombre y apellidos"
          autocomplete="name"
        />
        <div v-if="showNameError" class="invalid-feedback">
          {{ nameField.errorMessage.value }}
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          type="email"
          v-model="emailField.value.value"
          class="form-control"
          :class="{ 'is-invalid': showEmailError }"
          @blur="emailField.handleBlur"
          placeholder="tuemail@dominio.com"
          autocomplete="email"
        />
        <div v-if="showEmailError" class="invalid-feedback">
          {{ emailField.errorMessage.value }}
        </div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          type="password"
          v-model="passwordField.value.value"
          class="form-control"
          :class="{ 'is-invalid': showPasswordError }"
          @blur="passwordField.handleBlur"
          placeholder="••••••••"
          autocomplete="new-password"
        />
        <div v-if="showPasswordError" class="invalid-feedback">
          {{ passwordField.errorMessage.value }}
        </div>
        <div class="form-text">
          Mín. 6 / máx. 50, con al menos 1 mayúscula, 1 minúscula y 1 número.
        </div>
      </div>

      <div class="mb-4">
        <label for="confirm" class="form-label">Repite la contraseña</label>
        <input
          id="confirm"
          type="password"
          v-model="confirmField.value.value"
          class="form-control"
          :class="{ 'is-invalid': showConfirmError }"
          @blur="confirmField.handleBlur"
          placeholder="••••••••"
          autocomplete="new-password"
        />
        <div v-if="showConfirmError" class="invalid-feedback">
          {{ confirmField.errorMessage.value }}
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="!canSubmit">
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          Registrarme
        </button>
      </div>

      <p class="text-center text-secondary mt-4 mb-0">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="text-decoration-none"> Iniciar sesión </RouterLink>
      </p>
    </div>
  </form>
</template>

<style scoped></style>
