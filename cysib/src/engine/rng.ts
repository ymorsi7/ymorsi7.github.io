export function stepRng(seed: number): { value: number; seed: number } {
  let a = seed | 0
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: a >>> 0 }
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    const next = stepRng(state)
    state = next.seed
    return next.value
  }
}
