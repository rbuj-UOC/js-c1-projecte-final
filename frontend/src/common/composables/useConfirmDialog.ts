import { reactive } from "vue";

export type ConfirmDialogOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
};

type ConfirmDialogState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "primary" | "danger" | "warning";
};

const state = reactive<ConfirmDialogState>({
  open: false,
  title: "Confirmación",
  message: "",
  confirmText: "Aceptar",
  cancelText: "Cancelar",
  variant: "primary",
});

let pendingResolve: ((result: boolean) => void) | null = null;

function close(result: boolean) {
  state.open = false;

  const resolve = pendingResolve;
  pendingResolve = null;
  resolve?.(result);
}

function confirm(options: ConfirmDialogOptions) {
  if (pendingResolve) {
    close(false);
  }

  state.title = options.title ?? "Confirmación";
  state.message = options.message;
  state.confirmText = options.confirmText ?? "Aceptar";
  state.cancelText = options.cancelText ?? "Cancelar";
  state.variant = options.variant ?? "primary";
  state.open = true;

  return new Promise<boolean>((resolve) => {
    pendingResolve = resolve;
  });
}

function accept() {
  close(true);
}

function cancel() {
  close(false);
}

export function useConfirmDialog() {
  return {
    state,
    confirm,
    accept,
    cancel,
  };
}
