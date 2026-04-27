<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import { useConfirmDialog } from "../composables/useConfirmDialog";

const confirmDialog = useConfirmDialog();

const confirmButtonClass = computed(() => {
  return `btn btn-${confirmDialog.state.variant}`;
});

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && confirmDialog.state.open) {
    confirmDialog.cancel();
  }
}

watch(
  () => confirmDialog.state.open,
  (open) => {
    document.body.classList.toggle("modal-open", open);
  },
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("modal-open");
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="confirmDialog.state.open"
      class="position-fixed top-0 start-0 w-100 h-100"
      style="z-index: 1095"
      @click.self="confirmDialog.cancel"
    >
      <div class="modal-backdrop fade show position-absolute top-0 start-0 w-100 h-100"></div>

      <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header">
              <h5 class="modal-title">{{ confirmDialog.state.title }}</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Cerrar"
                @click="confirmDialog.cancel"
              ></button>
            </div>

            <div class="modal-body">
              <p class="mb-0">{{ confirmDialog.state.message }}</p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="confirmDialog.cancel">
                {{ confirmDialog.state.cancelText }}
              </button>
              <button type="button" :class="confirmButtonClass" @click="confirmDialog.accept">
                {{ confirmDialog.state.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
