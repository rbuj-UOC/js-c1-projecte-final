<script setup lang="ts">
import { RouterView } from "vue-router";
import AppToast from "./common/components/AppToast.vue";
import AppConfirmDialog from "./common/components/AppConfirmDialog.vue";
</script>

<template>
  <RouterView />
  <AppToast />
  <AppConfirmDialog />
</template>
