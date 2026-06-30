// Toast ringan berbasis CustomEvent. AppShell (persisten lintas route)
// yang menampilkannya, jadi toast tetap muncul setelah navigasi.
export type ToastType = "success" | "error" | "info";

export function toast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app:toast", { detail: { message, type } }),
  );
}
