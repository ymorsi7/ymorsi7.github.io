import type { InputState } from '../../engine/input'
import { stepRng } from '../../engine/rng'

export const ROWS = 10
export const COLS = 10
export const MINES = 14

export type Tile = { mine: boolean; open: boolean; flag: boolean; n: number }
export type Grid = Tile[][]

export type RiskState = {
  grid: Grid
  armed: boolean
  cursorR: number
  cursorC: number
  score: number
  phase: 'play' | 'over' | 'won'
  seed: number
}

export function blankGrid(): Grid {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, open: false, flag: false, n: 0 })),
  )
}

export function neighborCount(mines: boolean[][]): number[][] {
  return mines.map((row, r) =>
    row.map((mine, c) => {
      if (mine) return 0
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          if (mines[r + dr]?.[c + dc]) count += 1
        }
      }
      return count
    }),
  )
}

function near(r: number, c: number, sr: number, sc: number) {
  return Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1
}

export function layMines(seed: number, safeR: number, safeC: number): { grid: Grid; seed: number } {
  const spots: Array<[number, number]> = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!near(r, c, safeR, safeC)) spots.push([r, c])
    }
  }
  let current = seed
  for (let i = spots.length - 1; i > 0; i--) {
    const next = stepRng(current)
    current = next.seed
    const j = Math.floor(next.value * (i + 1))
    const hold = spots[i]
    spots[i] = spots[j]
    spots[j] = hold
  }
  const mines = Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  for (const [r, c] of spots.slice(0, MINES)) mines[r][c] = true
  const counts = neighborCount(mines)
  const grid = blankGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { mine: mines[r][c], open: false, flag: false, n: counts[r][c] }
    }
  }
  return { grid, seed: current }
}

export function openTile(grid: Grid, r: number, c: number): { grid: Grid; exploded: boolean } {
  const tile = grid[r]?.[c]
  if (!tile || tile.open || tile.flag) return { grid, exploded: false }
  const next = grid.map((row) => row.map((cell) => ({ ...cell })))
  if (tile.mine) {
    next[r][c].open = true
    return { grid: next, exploded: true }
  }
  const stack: Array<[number, number]> = [[r, c]]
  while (stack.length) {
    const [cr, cc] = stack.pop()!
    const cell = next[cr]?.[cc]
    if (!cell || cell.open || cell.flag || cell.mine) continue
    cell.open = true
    if (cell.n !== 0) continue
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = cr + dr
        const nc = cc + dc
        if (next[nr]?.[nc] && !next[nr][nc].open) stack.push([nr, nc])
      }
    }
  }
  return { grid: next, exploded: false }
}

export function toggleFlag(grid: Grid, r: number, c: number): Grid {
  const tile = grid[r]?.[c]
  if (!tile || tile.open) return grid
  return grid.map((row, rr) =>
    row.map((cell, cc) => (rr === r && cc === c ? { ...cell, flag: !cell.flag } : cell)),
  )
}

export function safeLeft(grid: Grid): number {
  let left = 0
  for (const row of grid) {
    for (const cell of row) if (!cell.mine && !cell.open) left += 1
  }
  return left
}

export function createRisk(seed = 21): RiskState {
  return { grid: blankGrid(), armed: true, cursorR: 0, cursorC: 0, score: 0, phase: 'play', seed }
}

function finish(state: RiskState, grid: Grid): RiskState {
  const opened = ROWS * COLS - MINES - safeLeft(grid)
  const score = opened * 20 + (safeLeft(grid) === 0 ? 500 : 0)
  return { ...state, grid, armed: false, score, phase: safeLeft(grid) === 0 ? 'won' : state.phase }
}

export function updateRisk(state: RiskState, input: InputState, dt: number): RiskState {
  void dt
  if (state.phase !== 'play') return state
  let cursorR = state.cursorR
  let cursorC = state.cursorC
  if (input.justKeys.has('ArrowUp')) cursorR = Math.max(0, cursorR - 1)
  if (input.justKeys.has('ArrowDown')) cursorR = Math.min(ROWS - 1, cursorR + 1)
  if (input.justKeys.has('ArrowLeft')) cursorC = Math.max(0, cursorC - 1)
  if (input.justKeys.has('ArrowRight')) cursorC = Math.min(COLS - 1, cursorC + 1)
  let next: RiskState = { ...state, cursorR, cursorC }
  const flagKey = input.justKeys.has('f') || input.justKeys.has('F')
  const revealKey = input.justKeys.has('Enter')
  if (flagKey) return { ...next, grid: toggleFlag(next.grid, cursorR, cursorC) }
  if (!revealKey && !input.justDown) return next
  if (input.justDown && input.pointerButton === 2) return next
  if (revealKey || (input.justDown && input.pointerButton !== 2)) {
    let grid = next.grid
    let seed = next.seed
    if (next.armed) {
      const laid = layMines(seed, cursorR, cursorC)
      grid = laid.grid
      seed = laid.seed
    }
    const opened = openTile(grid, cursorR, cursorC)
    if (opened.exploded) {
      return { ...next, grid: opened.grid, armed: false, seed, phase: 'over', score: finish(next, opened.grid).score }
    }
    const done = finish({ ...next, seed }, opened.grid)
    return done.phase === 'won' ? done : { ...done, phase: 'play' }
  }
  return next
}

export const update = updateRisk
