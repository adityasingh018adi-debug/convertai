export type ToastType = "success" | "error" | "info";
type Listener = (message: string, type: ToastType) => void;

let listeners: Listener[] = [];

export function showToast(message: string, type: ToastType = "info") {
  listeners.forEach((l) => l(message, type));
}

export function subscribeToast(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
