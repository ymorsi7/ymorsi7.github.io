import type { InputState } from '../../engine/input'
import { stepRng } from '../../engine/rng'

export const COLS = 10
export const ROWS = 20

export const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
]

export const COLORS = ['#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#f79646', '#4bacc6', '#f4b183']
export const LABELS = ['HC', 'Req', 'Back', 'Offer', 'Intern', 'Lead', 'Cont']
export const LINE_SCORE = [0, 100, 300, 500, 800]

export type Piece = { kind: number; shape: number[][]; x: number; y: number }
export type Board = number[][]

export type StackState = {
  board: Board
  piece: Piece
  nextKind: number
  bag: number[]
  score: number
  lines: number
  level: number
  phase: 'play' | 'over'
  dropIn: number
  repeatIn: number
  seed: number
}

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(-1))
}

export function rotateShape(shape: number[][]): number[][] {
  const height = shape.length
  const width = shape[0]?.length ?? 0
  const next = Array.from({ length: width }, () => Array<number>(height).fill(0))
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) next[c][height - 1 - r] = shape[r][c]
  }
  return next
}

export function fits(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const bx = x + c
      const by = y + r
      if (bx < 0 || bx >= COLS || by >= ROWS) return false
      if (by >= 0 && board[by][bx] >= 0) return false
    }
  }
  return true
}

export function stamp(board: Board, piece: Piece): Board {
  const next = board.map((row) => row.slice())
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue
      const by = piece.y + r
      const bx = piece.x + c
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) next[by][bx] = piece.kind
    }
  }
  return next
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell < 0))
  const cleared = ROWS - kept.length
  const pad = Array.from({ length: cleared }, () => Array(COLS).fill(-1))
  return { board: [...pad, ...kept], cleared }
}

export function dropDelay(level: number) {
  return Math.max(0.08, 0.85 * 0.82 ** (level - 1))
}

export function levelFor(lines: number) {
  return 1 + Math.floor(lines / 10)
}

function refillBag(seed: number, bag: number[]): { bag: number[]; seed: number } {
  const items = SHAPES.map((_, index) => index)
  let current = seed
  for (let i = items.length - 1; i > 0; i--) {
    const next = stepRng(current)
    current = next.seed
    const j = Math.floor(next.value * (i + 1))
    const hold = items[i]
    items[i] = items[j]
    items[j] = hold
  }
  return { bag: [...bag, ...items], seed: current }
}

function takePiece(seed: number, bag: number[]): { piece: Piece; nextKind: number; bag: number[]; seed: number } {
  let nextBag = bag
  let nextSeed = seed
  if (nextBag.length < 2) {
    const filled = refillBag(nextSeed, nextBag)
    nextBag = filled.bag
    nextSeed = filled.seed
  }
  const kind = nextBag[0]
  const rest = nextBag.slice(1)
  const shape = SHAPES[kind].map((row) => row.slice())
  const piece = { kind, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 }
  return { piece, nextKind: rest[0] ?? 0, bag: rest, seed: nextSeed }
}

export function createStack(seed = 31): StackState {
  const dealt = takePiece(seed, [])
  return {
    board: emptyBoard(),
    piece: dealt.piece,
    nextKind: dealt.nextKind,
    bag: dealt.bag,
    score: 0,
    lines: 0,
    level: 1,
    phase: 'play',
    dropIn: dropDelay(1),
    repeatIn: 0,
    seed: dealt.seed,
  }
}

function tryMove(piece: Piece, board: Board, dx: number, dy: number): Piece | null {
  const next = { ...piece, x: piece.x + dx, y: piece.y + dy }
  return fits(board, next.shape, next.x, next.y) ? next : null
}

function tryRotate(piece: Piece, board: Board): Piece | null {
  const shape = rotateShape(piece.shape)
  const kicks = [0, -1, 1, -2, 2]
  for (const kick of kicks) {
    if (fits(board, shape, piece.x + kick, piece.y)) return { ...piece, shape, x: piece.x + kick }
  }
  return null
}

function lockPiece(state: StackState): StackState {
  const stamped = stamp(state.board, state.piece)
  const cleared = clearLines(stamped)
  const lines = state.lines + cleared.cleared
  const level = levelFor(lines)
  const score = state.score + (LINE_SCORE[cleared.cleared] ?? 800) * state.level
  const dealt = takePiece(state.seed, state.bag)
  if (!fits(cleared.board, dealt.piece.shape, dealt.piece.x, dealt.piece.y)) {
    return { ...state, board: cleared.board, piece: dealt.piece, nextKind: dealt.nextKind, bag: dealt.bag, seed: dealt.seed, score, lines, level, phase: 'over', dropIn: dropDelay(level) }
  }
  return {
    ...state,
    board: cleared.board,
    piece: dealt.piece,
    nextKind: dealt.nextKind,
    bag: dealt.bag,
    seed: dealt.seed,
    score,
    lines,
    level,
    phase: 'play',
    dropIn: dropDelay(level),
  }
}

function hardDrop(state: StackState): StackState {
  let piece = state.piece
  let dropped = 0
  while (true) {
    const down = tryMove(piece, state.board, 0, 1)
    if (!down) break
    piece = down
    dropped += 1
  }
  return lockPiece({ ...state, piece, score: state.score + dropped * 2 })
}

function mergePointer(input: InputState, size?: { w: number; h: number }): InputState {
  if (!size) return input
  const keys = new Set(input.keys)
  const justKeys = new Set(input.justKeys)
  if (input.justDown) {
    if (input.pointerX < size.w * 0.33) justKeys.add('ArrowLeft')
    else if (input.pointerX > size.w * 0.67) justKeys.add('ArrowRight')
    else justKeys.add('ArrowUp')
  }
  if (input.pointerDown && input.pointerY > size.h * 0.72) keys.add('ArrowDown')
  return { ...input, keys, justKeys }
}

export function updateStack(state: StackState, input: InputState, dt: number, size?: { w: number; h: number }): StackState {
  if (state.phase !== 'play') return state
  const pad = mergePointer(input, size)
  let piece = state.piece
  let repeatIn = state.repeatIn

  if (pad.justKeys.has('ArrowLeft')) {
    piece = tryMove(piece, state.board, -1, 0) ?? piece
    repeatIn = 0.18
  } else if (pad.justKeys.has('ArrowRight')) {
    piece = tryMove(piece, state.board, 1, 0) ?? piece
    repeatIn = 0.18
  } else if (pad.keys.has('ArrowLeft') || pad.keys.has('ArrowRight')) {
    repeatIn -= dt
    if (repeatIn <= 0) {
      const dx = pad.keys.has('ArrowLeft') ? -1 : 1
      piece = tryMove(piece, state.board, dx, 0) ?? piece
      repeatIn = 0.07
    }
  } else {
    repeatIn = 0
  }

  if (pad.justKeys.has('ArrowUp')) piece = tryRotate(piece, state.board) ?? piece
  if (pad.justKeys.has('Enter')) return { ...hardDrop({ ...state, piece }), repeatIn }

  const soft = pad.keys.has('ArrowDown')
  let dropIn = state.dropIn - dt * (soft ? 8 : 1)
  if (dropIn > 0) return { ...state, piece, dropIn, repeatIn }

  const down = tryMove(piece, state.board, 0, 1)
  if (!down) return { ...lockPiece({ ...state, piece }), repeatIn }
  return { ...state, piece: down, dropIn: dropDelay(state.level), repeatIn, score: state.score + (soft ? 1 : 0) }
}

export const update = updateStack
