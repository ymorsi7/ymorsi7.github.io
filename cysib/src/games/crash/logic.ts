import type { InputState } from '../../engine/input'
import { stepRng } from '../../engine/rng'

export const MEETINGS = [
  { label: 'Sync', fill: '#4f81bd', text: '#ffffff' },
  { label: 'Review', fill: '#c0504d', text: '#ffffff' },
  { label: '1:1', fill: '#9bbb59', text: '#1f1f1f' },
  { label: 'Standup', fill: '#8064a2', text: '#ffffff' },
  { label: 'Offsite', fill: '#f79646', text: '#1f1f1f' },
] as const

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Next']
export const TIMES = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00']

export type Cell = { r: number; c: number }
export type Grid = number[][]

export type CrashState = {
  grid: Grid
  score: number
  timeLeft: number
  phase: 'idle' | 'clear' | 'over'
  clearTimer: number
  cascade: number
  pending: Cell[]
  lastMatchAt: number
  matchedOnce: boolean
  selected: Cell
  armed: Cell | null
  drag: Cell | null
  seed: number
  note: string
}

export function findMatchCells(grid: Grid): Cell[] {
  const height = grid.length
  const width = grid[0]?.length ?? 0
  const mark = Array.from({ length: height }, () => Array<boolean>(width).fill(false))
  for (let r = 0; r < height; r++) {
    let run = 1
    for (let c = 1; c <= width; c++) {
      const same = c < width && grid[r][c] === grid[r][c - 1]
      if (same) run += 1
      else {
        if (run >= 3) for (let k = 0; k < run; k++) mark[r][c - 1 - k] = true
        run = 1
      }
    }
  }
  for (let c = 0; c < width; c++) {
    let run = 1
    for (let r = 1; r <= height; r++) {
      const same = r < height && grid[r][c] === grid[r - 1][c]
      if (same) run += 1
      else {
        if (run >= 3) for (let k = 0; k < run; k++) mark[r - 1 - k][c] = true
        run = 1
      }
    }
  }
  const cells: Cell[] = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) if (mark[r][c]) cells.push({ r, c })
  }
  return cells
}

export function matchGroups(grid: Grid): Cell[][] {
  const cells = findMatchCells(grid)
  const member = new Set(cells.map((cell) => `${cell.r}:${cell.c}`))
  const seen = new Set<string>()
  const groups: Cell[][] = []
  for (const cell of cells) {
    const key = `${cell.r}:${cell.c}`
    if (seen.has(key)) continue
    const group: Cell[] = []
    const stack = [cell]
    seen.add(key)
    while (stack.length) {
      const cur = stack.pop()!
      group.push(cur)
      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const next = { r: cur.r + dr, c: cur.c + dc }
        const id = `${next.r}:${next.c}`
        if (!member.has(id) || seen.has(id)) continue
        if (grid[next.r][next.c] !== grid[cur.r][cur.c]) continue
        seen.add(id)
        stack.push(next)
      }
    }
    groups.push(group)
  }
  return groups
}

export function adjacent(a: Cell, b: Cell): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1
}

export function swapCells(grid: Grid, a: Cell, b: Cell): Grid {
  const next = grid.map((row) => row.slice())
  const hold = next[a.r][a.c]
  next[a.r][a.c] = next[b.r][b.c]
  next[b.r][b.c] = hold
  return next
}

export function swapCreatesMatch(grid: Grid, a: Cell, b: Cell): boolean {
  if (!adjacent(a, b)) return false
  return findMatchCells(swapCells(grid, a, b)).length > 0
}

export function hasMove(grid: Grid): boolean {
  const height = grid.length
  const width = grid[0].length
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (c + 1 < width && grid[r][c] !== grid[r][c + 1] && swapCreatesMatch(grid, { r, c }, { r, c: c + 1 })) return true
      if (r + 1 < height && grid[r][c] !== grid[r + 1][c] && swapCreatesMatch(grid, { r, c }, { r: r + 1, c })) return true
    }
  }
  return false
}

export function scoreGroups(groups: Cell[][], cascade: number): number {
  return groups.reduce((sum, group) => sum + group.length * 100 * cascade, 0)
}

export function clearFallFill(grid: Grid, cells: Cell[], nextValue: () => number): Grid {
  const height = grid.length
  const width = grid[0].length
  const kill = new Set(cells.map((cell) => `${cell.r}:${cell.c}`))
  const next: Grid = Array.from({ length: height }, () => Array<number>(width).fill(0))
  for (let c = 0; c < width; c++) {
    const kept: number[] = []
    for (let r = height - 1; r >= 0; r--) {
      if (!kill.has(`${r}:${c}`)) kept.push(grid[r][c])
    }
    for (let i = 0; i < height; i++) {
      const row = height - 1 - i
      next[row][c] = i < kept.length ? kept[i] : Math.floor(nextValue() * MEETINGS.length)
    }
  }
  return next
}

function pull(seed: number): { value: number; seed: number } {
  return stepRng(seed)
}

export function reshuffle(grid: Grid, seed: number, guard = 24): { grid: Grid; seed: number } {
  const flat = grid.flat()
  let current = seed
  for (let i = flat.length - 1; i > 0; i--) {
    const next = pull(current)
    current = next.seed
    const j = Math.floor(next.value * (i + 1))
    const hold = flat[i]
    flat[i] = flat[j]
    flat[j] = hold
  }
  const shuffled: Grid = []
  for (let r = 0; r < grid.length; r++) shuffled.push(flat.slice(r * grid[0].length, (r + 1) * grid[0].length))
  if (guard <= 0) return { grid: shuffled, seed: current }
  if (findMatchCells(shuffled).length === 0 && hasMove(shuffled)) return { grid: shuffled, seed: current }
  return reshuffle(shuffled, current, guard - 1)
}

export function dealBoard(seed: number): { grid: Grid; seed: number } {
  let current = seed
  for (let attempt = 0; attempt < 80; attempt++) {
    const grid: Grid = []
    for (let r = 0; r < 8; r++) {
      const row: number[] = []
      for (let c = 0; c < 8; c++) {
        const next = pull(current)
        current = next.seed
        row.push(Math.floor(next.value * MEETINGS.length))
      }
      grid.push(row)
    }
    if (findMatchCells(grid).length === 0 && hasMove(grid)) return { grid, seed: current }
  }
  const blank = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r + c) % MEETINGS.length))
  return reshuffle(blank, current)
}

export function formatDeadline(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  return `${minutes}:${remain.toString().padStart(2, '0')}`
}

function beginClear(state: CrashState, grid: Grid, cascade: number): CrashState {
  const groups = matchGroups(grid)
  if (!groups.length) return { ...state, grid, phase: 'idle', cascade: 1, pending: [], note: 'Ready' }
  const quick = cascade === 1 && state.matchedOnce && state.lastMatchAt - state.timeLeft <= 2.2 && state.lastMatchAt - state.timeLeft > 0
  let add = scoreGroups(groups, cascade)
  if (quick) add = Math.round(add * 1.5)
  return {
    ...state,
    grid,
    score: state.score + add,
    phase: 'clear',
    clearTimer: 0.13,
    cascade,
    pending: groups.flat(),
    matchedOnce: true,
    lastMatchAt: state.timeLeft,
    armed: null,
    drag: null,
    note: 'Calculating',
  }
}

function finishClear(state: CrashState): CrashState {
  let seed = state.seed
  const fallen = clearFallFill(state.grid, state.pending, () => {
    const next = pull(seed)
    seed = next.seed
    return next.value
  })
  if (matchGroups(fallen).length) return beginClear({ ...state, grid: fallen, seed, phase: 'idle' }, fallen, state.cascade + 1)
  if (!hasMove(fallen)) {
    const shuffled = reshuffle(fallen, seed)
    return { ...state, grid: shuffled.grid, seed: shuffled.seed, phase: 'idle', pending: [], cascade: 1, note: 'Calculating' }
  }
  return { ...state, grid: fallen, seed, phase: 'idle', pending: [], cascade: 1, note: 'Ready' }
}

export function createCrash(seed = 42): CrashState {
  const dealt = dealBoard(seed)
  return {
    grid: dealt.grid,
    score: 0,
    timeLeft: 90,
    phase: 'idle',
    clearTimer: 0,
    cascade: 1,
    pending: [],
    lastMatchAt: 90,
    matchedOnce: false,
    selected: { r: 0, c: 0 },
    armed: null,
    drag: null,
    seed: dealt.seed,
    note: 'Ready',
  }
}

export type CrashInput = InputState & { cell?: Cell | null }

function trySwap(state: CrashState, a: Cell, b: Cell): CrashState {
  if (!swapCreatesMatch(state.grid, a, b)) return { ...state, selected: b, armed: null, drag: null }
  return beginClear(state, swapCells(state.grid, a, b), 1)
}

export function updateCrash(state: CrashState, input: CrashInput, dt: number): CrashState {
  if (state.phase === 'over') return state
  let timeLeft = state.timeLeft - dt
  if (timeLeft <= 0) return { ...state, timeLeft: 0, phase: 'over', note: 'Ready' }

  if (state.phase === 'clear') {
    const clearTimer = state.clearTimer - dt
    const ticking = { ...state, timeLeft, clearTimer }
    if (clearTimer > 0) return ticking
    return { ...finishClear(ticking), timeLeft }
  }

  let selected = state.selected
  let armed = state.armed
  let drag = state.drag
  const cell = input.cell ?? null
  if (input.justKeys.has('ArrowLeft')) selected = { r: selected.r, c: Math.max(0, selected.c - 1) }
  if (input.justKeys.has('ArrowRight')) selected = { r: selected.r, c: Math.min(7, selected.c + 1) }
  if (input.justKeys.has('ArrowUp')) selected = { r: Math.max(0, selected.r - 1), c: selected.c }
  if (input.justKeys.has('ArrowDown')) selected = { r: Math.min(7, selected.r + 1), c: selected.c }

  let next: CrashState = { ...state, timeLeft, selected, armed, drag, note: 'Ready' }

  if (input.justKeys.has('Enter')) {
    if (!armed) next = { ...next, armed: selected }
    else if (adjacent(armed, selected)) next = trySwap(next, armed, selected)
    else next = { ...next, armed: selected }
  }

  if (input.justDown && cell) next = { ...next, drag: cell, selected: cell }
  if (input.justUp) {
    if (next.drag && cell) {
      if (adjacent(next.drag, cell)) next = trySwap(next, next.drag, cell)
      else if (next.armed && adjacent(next.armed, cell) && next.drag.r === cell.r && next.drag.c === cell.c) {
        next = trySwap(next, next.armed, cell)
      } else if (next.drag.r === cell.r && next.drag.c === cell.c) {
        if (next.armed && next.armed.r === cell.r && next.armed.c === cell.c) next = { ...next, armed: null, drag: null, selected: cell }
        else next = { ...next, armed: cell, drag: null, selected: cell }
      } else next = { ...next, selected: cell, drag: null, armed: null }
    } else next = { ...next, drag: null }
  }

  if (next.phase === 'idle' && matchGroups(next.grid).length) return beginClear(next, next.grid, next.cascade)
  if (next.phase === 'idle' && !hasMove(next.grid)) {
    const shuffled = reshuffle(next.grid, next.seed)
    return { ...next, grid: shuffled.grid, seed: shuffled.seed, note: 'Calculating' }
  }
  return next
}

export const update = updateCrash
