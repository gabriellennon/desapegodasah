const cartKey = "desapego-da-sah:cart"
const cartEvent = "desapego-da-sah:cart-change"
export const emptyCart = "[]"
let cartFallback = emptyCart

export function readCart() {
  try {
    return localStorage.getItem(cartKey) ?? emptyCart
  } catch {
    return cartFallback
  }
}

export function subscribeCart(update: () => void) {
  window.addEventListener("storage", update)
  window.addEventListener(cartEvent, update)
  return () => {
    window.removeEventListener("storage", update)
    window.removeEventListener(cartEvent, update)
  }
}

export function parseCart(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id): id is string => typeof id === "string")
          ),
        ]
      : []
  } catch {
    return []
  }
}

export function saveCart(ids: string[]) {
  cartFallback = JSON.stringify(ids)
  try {
    localStorage.setItem(cartKey, cartFallback)
  } catch {
    // Keep the preview usable in browsers that block storage.
  }
  window.dispatchEvent(new Event(cartEvent))
}
