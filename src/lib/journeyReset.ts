/**
 * Tiny signal store so external code (e.g. the dev shortcut) can ask the
 * JourneyMap to reset its memory and replay the intro animation from scratch.
 * JourneyMap subscribes via useSyncExternalStore and reacts to `trigger()`.
 */
let count = 0
const listeners = new Set<() => void>()

export const journeyReset = {
  getCount: (): number => count,
  trigger: (): void => {
    count++
    listeners.forEach((l) => l())
  },
  subscribe: (l: () => void): (() => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}
