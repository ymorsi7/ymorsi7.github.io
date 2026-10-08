import type { InputState } from '../../engine/input'
import { stepRng } from '../../engine/rng'

export const COLORS = ['#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#f79646'] as const
export const COLOR_NAMES = ['Payroll', 'Travel', 'Vendors', 'Software', 'Facilities'] as const

export type Columns = number[][]
export type Cell = { c: number; r: number }

export type CutterState = {
  columns: Columns
  score: number
  elapsed: number
  spawnEvery: number
  spawnAcc: number
  maxColumns: number
  phase: 'play' | 'over'
  cursorC: number
  cursorR: number
  seed: number
}

export function flood(columns: Columns, c: number, r: number): Cell[] {
  const column = columns[c]
  if (!column || column[r] == null || column[r] < 0) return []
  const color = column[r]
  const seen = new Set<string>()
  const out: Cell[] = []
  const stack: Cell[] = [{ c, r }]
  while (stack.length) {
    const cur = stack.pop()!
    const key = `${cur.c}:${cur.r}`
    if (seen.has(key)) continue
    const here = columns[cur.c]?.[cur.r]
    if (here !== color) continue
    seen.add(key)
    out.push(cur)
    stack.push(
      { c: cur.c + 1, r: cur.r },
      { c: cur.c - 1, r: cur.r },
      { c: cur.c, r: cur.r + 1 },
      { c: cur.c, r: cur.r - 1 },
    )
  }
  return out
}

export function groupScore(count: number): number {
  return count * count * 10
}

/** Drop cells, then pack columns to the left so the right edge recedes. */
export function removeAndCollapse(columns: Columns, cells: Cell[]): Columns {
  const next = columns.map((column) => column.slice())
  for (const cell of cells) {
    if (next[cell.c]) next[cell.c][cell.r] = -1
  }
  return next.map((column) => column.filter((value) => value >= 0)).filter((column) => column.length > 0)
}

export function tryClear(columns: Columns, c: number, r: number): { columns: Columns; score: number; removed: number } {
  const cells = flood(columns, c, r)
  if (cells.length < 2) return { columns, score: 0, removed: 0 }
  return { columns: removeAndCollapse(columns, cells), score: groupScore(cells.length), removed: cells.length }
}

export function makeColumnFromSeed(seed: number): { column: number[]; seed: number } {
  let current = seed
  const take = () => {
    const next = stepRng(current)
    current = next.seed
    return next.value
  }
  const height = 6 + Math.floor(take() * 5)
  const column: number[] = []
  let color = Math.floor(take() * COLORS.length)
  let run = 1 + Math.floor(take() * 3)
  for (let i = 0; i < height; i++) {
    if (run <= 0) {
      let nextColor = Math.floor(take() * COLORS.length)
      if (nextColor === color) nextColor = (nextColor + 1) % COLORS.length
      color = nextColor
      run = 1 + Math.floor(take() * 3)
    }
    column.push(color)
    run -= 1
  }
  return { column, seed: current }
}

export function createCutter(seed = 11): CutterState {
  let current = seed
  const columns: Columns = []
  for (let i = 0; i < 4; i++) {
    const made = makeColumnFromSeed(current + i * 17)
    current = made.seed
    columns.push(made.column)
  }
  return {
    columns,
    score: 0,
    elapsed: 0,
    spawnEvery: 6.5,
    spawnAcc: 2,
    maxColumns: 8,
    phase: 'play',
    cursorC: 0,
    cursorR: 0,
    seed: current + 3,
  }
}

export type CutterInput = InputState & { hit?: Cell | null }

export function updateCutter(state: CutterState, input: CutterInput, dt: number): CutterState {
  if (state.phase === 'over') return state

  let cursorC = state.cursorC
  let cursorR = state.cursorR
  if (input.justKeys.has('ArrowLeft')) cursorC -= 1
  if (input.justKeys.has('ArrowRight')) cursorC += 1
  if (input.justKeys.has('ArrowUp')) cursorR += 1
  if (input.justKeys.has('ArrowDown')) cursorR -= 1
  cursorC = Math.max(0, Math.min(state.columns.length - 1, cursorC))
  const height = state.columns[cursorC]?.length ?? 1
  cursorR = Math.max(0, Math.min(height - 1, cursorR))

  let columns = state.columns
  let score = state.score
  const hit = input.hit
  if (hit) {
    const cleared = tryClear(columns, hit.c, hit.r)
    columns = cleared.columns
    score += cleared.score
    cursorC = Math.max(0, Math.min(columns.length - 1, cursorC))
    cursorR = Math.max(0, Math.min((columns[cursorC]?.length ?? 1) - 1, cursorR))
  } else if (input.justKeys.has('Enter')) {
    const cleared = tryClear(columns, cursorC, cursorR)
    columns = cleared.columns
    score += cleared.score
  }

  let elapsed = state.elapsed + dt
  let spawnEvery = state.spawnEvery
  let spawnAcc = state.spawnAcc + dt
  let seed = state.seed
  let phase: CutterState['phase'] = 'play'
  if (Math.floor(elapsed / 30) > Math.floor(state.elapsed / 30)) spawnEvery = Math.max(1.7, spawnEvery * 0.82)

  if (spawnAcc >= spawnEvery) {
    spawnAcc -= spawnEvery
    if (columns.length >= state.maxColumns) phase = 'over'
    else {
      const made = makeColumnFromSeed(seed)
      seed = made.seed
      columns = [made.column, ...columns]
    }
  }

  if (columns.length === 0) {
    const made = makeColumnFromSeed(seed)
    seed = made.seed
    columns = [made.column]
  }

  cursorC = Math.max(0, Math.min(columns.length - 1, cursorC))
  cursorR = Math.max(0, Math.min((columns[cursorC]?.length ?? 1) - 1, cursorR))

  return {
    ...state,
    columns,
    score,
    elapsed,
    spawnEvery,
    spawnAcc,
    seed,
    phase,
    cursorC,
    cursorR,
  }
}

export const update = updateCutter
