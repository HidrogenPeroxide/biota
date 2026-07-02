/**
 * Tiny external store so a page (e.g. the light-themed Travel Journey chapter)
 * can tell the global Navbar to render a solid, dark-text variant over a light
 * background — without prop-drilling through <App/>.
 *
 * 'dark'  → navbar sits over a dark background (default): transparent, light text.
 * 'light' → navbar sits over a light background: solid ivory, dark text.
 */
export type NavTheme = 'dark' | 'light'

let current: NavTheme = 'dark'
const listeners = new Set<() => void>()

export function getNavTheme(): NavTheme {
  return current
}

export function setNavTheme(t: NavTheme): void {
  if (t !== current) {
    current = t
    listeners.forEach((l) => l())
  }
}

export function subscribeNavTheme(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
