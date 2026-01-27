const listeners = new Set();

export function subscribeToasts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(toast) {
  for (const fn of listeners) fn(toast);
}

export function toastSuccess(message) {
  emit({ type: "success", message });
}

export function toastError(message) {
  emit({ type: "error", message });
}

export function toastInfo(message) {
  emit({ type: "info", message });
}
