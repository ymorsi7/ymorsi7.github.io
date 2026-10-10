import type { InputState } from '../../engine/input'

export const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.###.#.###.####',
  '    ...........    ',
  '####.#.##=##.#.####',
  '#....#.#   #.#....#',
  '#.##.#.#####.#.##.#',
  '#o.......#.......o#',
  '#.###.##.#.##.###.#',
  '#.................#',
  '###################',
]

export type Dir = 'left' | 'right' | 'up' | 'down'
export type Actor = { x: number; y: number; dir: Dir }

const DELTA: Record<Dir, [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
}

const OPPOSITE: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' }
const DIRS: Dir[] = ['left', 'right', 'up', 'down']

export const PLAYER_START = { x: 9, y: 13, dir: 'left' as Dir }
export const GHOST_START: Actor[] = [
  { x: 8, y: 9, dir: 'up' },
  { x: 9, y: 9, dir: 'up' },
  { x: 10, y: 9, dir: 'left' },
]

export function mazeLayout(width: number, height: number, cols: number, rows: number) {
  const size = Math.max(12, Math.min((width - 48) / cols, (height - 64) / rows))
  const ox = (width - cols * size) / 2
  const oy = (height - rows * size) / 2 + 8
  return { size, ox, oy }
}

export function tile(maze: string[], x: number, y: number) {
  if (y < 0 || y >= maze.length) return '#'
  const row = maze[y]
  if (x < 0 || x >= row.length) return ' '
  return row[x] ?? '#'
}

export function wrapX(maze: string[], x: number) {
  const width = maze[0]?.length ?? 0
  if (width <= 0) return 0
  return (x + width) % width
}

export function blocked(maze: string[], x: number, y: number, ghost = false) {
  const cell = tile(maze, x, y)
  if (cell === '#') return true
  if (cell === '=' && !ghost) return true
  return false
}

export function tryStep(maze: string[], x: number, y: number, dir: Dir, ghost = false) {
  const [dx, dy] = DELTA[dir]
  let nx = x + dx
  const ny = y + dy
  if (ny < 0 || ny >= maze.length) return { x, y, moved: false }
  if (nx < 0 || nx >= maze[0].length) {
    if (tile(maze, x, y) === ' ' || tile(maze, nx, ny) === ' ') nx = wrapX(maze, nx)
    else return { x, y, moved: false }
  }
  if (blocked(maze, nx, ny, ghost)) return { x, y, moved: false }
  return { x: nx, y: ny, moved: true }
}

export function eat(maze: string[], x: number, y: number) {
  const cell = tile(maze, x, y)
  if (cell !== '.' && cell !== 'o') return { maze, ate: false, power: false }
  const rows = maze.map((row, index) => (index === y ? `${row.slice(0, x)} ${row.slice(x + 1)}` : row))
  return { maze: rows, ate: true, power: cell === 'o' }
}

export function pelletsLeft(maze: string[]) {
  return maze.join('').split('').filter((cell) => cell === '.' || cell === 'o').length
}

export type FloorState = {
  maze: string[]
  player: Actor
  ghosts: Actor[]
  want: Dir
  score: number
  lives: number
  phase: 'play' | 'over' | 'won'
  moveIn: number
  ghostIn: number
  frightened: number
}

export function createFloor(): FloorState {
  return {
    maze: MAZE.slice(),
    player: { ...PLAYER_START },
    ghosts: GHOST_START.map((ghost) => ({ ...ghost })),
    want: 'left',
    score: 0,
    lives: 3,
    phase: 'play',
    moveIn: 0.14,
    ghostIn: 0.2,
    frightened: 0,
  }
}

function wanted(input: InputState, current: Dir, maze: string[], player: Actor, size?: { w: number; h: number }): Dir {
  if (input.keys.has('ArrowLeft')) return 'left'
  if (input.keys.has('ArrowRight')) return 'right'
  if (input.keys.has('ArrowUp')) return 'up'
  if (input.keys.has('ArrowDown')) return 'down'
  if (!size || (!input.pointerDown && !input.justDown)) return current
  const cols = maze[0].length
  const rows = maze.length
  const layout = mazeLayout(size.w, size.h, cols, rows)
  const gx = Math.floor((input.pointerX - layout.ox) / layout.size)
  const gy = Math.floor((input.pointerY - layout.oy) / layout.size)
  const dx = gx - player.x
  const dy = gy - player.y
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return current
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right'
  return dy < 0 ? 'up' : 'down'
}

function chase(maze: string[], ghost: Actor, player: Actor, flee: boolean): Dir {
  let best = ghost.dir
  let bestDist = flee ? -Infinity : Infinity
  let found = false
  for (const dir of DIRS) {
    if (dir === OPPOSITE[ghost.dir]) continue
    const step = tryStep(maze, ghost.x, ghost.y, dir, true)
    if (!step.moved) continue
    const dist = Math.abs(step.x - player.x) + Math.abs(step.y - player.y)
    if (!found || (flee ? dist > bestDist : dist < bestDist)) {
      bestDist = dist
      best = dir
      found = true
    }
  }
  if (!found) {
    const back = tryStep(maze, ghost.x, ghost.y, OPPOSITE[ghost.dir], true)
    if (back.moved) return OPPOSITE[ghost.dir]
  }
  return best
}

function sameTile(a: Actor, b: Actor) {
  return a.x === b.x && a.y === b.y
}

function crossed(a0: Actor, a1: Actor, b0: Actor, b1: Actor) {
  return a0.x === b1.x && a0.y === b1.y && b0.x === a1.x && b0.y === a1.y
}

export function updateFloor(state: FloorState, input: InputState, dt: number, size?: { w: number; h: number }): FloorState {
  if (state.phase !== 'play') return state
  const want = wanted(input, state.want, state.maze, state.player, size)
  let moveIn = state.moveIn - dt
  let ghostIn = state.ghostIn - dt
  let frightened = Math.max(0, state.frightened - dt)
  let player = state.player
  const playerBefore = state.player
  let maze = state.maze
  let score = state.score
  let lives = state.lives
  let ghosts = state.ghosts
  const ghostsBefore = state.ghosts

  if (moveIn <= 0) {
    const turned = tryStep(maze, player.x, player.y, want)
    const step = turned.moved ? turned : tryStep(maze, player.x, player.y, player.dir)
    player = { x: step.x, y: step.y, dir: turned.moved ? want : player.dir }
    const eaten = eat(maze, player.x, player.y)
    maze = eaten.maze
    if (eaten.ate) score += eaten.power ? 50 : 10
    if (eaten.power) frightened = 6
    moveIn = 0.14
  }

  if (ghostIn <= 0) {
    ghosts = ghosts.map((ghost) => {
      const dir = chase(maze, ghost, player, frightened > 0)
      const step = tryStep(maze, ghost.x, ghost.y, dir, true)
      return { x: step.x, y: step.y, dir: step.moved ? dir : ghost.dir }
    })
    ghostIn = frightened > 0 ? 0.28 : 0.2
  }

  const hits = ghosts
    .map((ghost, index) => ({ ghost, index, before: ghostsBefore[index] }))
    .filter(({ ghost, before }) => sameTile(ghost, player) || crossed(playerBefore, player, before, ghost))

  if (hits.length) {
    if (frightened > 0) {
      ghosts = ghosts.map((ghost, index) => (hits.some((hit) => hit.index === index) ? { ...GHOST_START[index] } : ghost))
      score += 200 * hits.length
    } else {
      lives -= 1
      player = { ...PLAYER_START }
      ghosts = GHOST_START.map((ghost) => ({ ...ghost }))
      frightened = 0
      if (lives <= 0) return { ...state, maze, player, ghosts, want, score, lives, phase: 'over', moveIn, ghostIn, frightened }
    }
  }

  if (pelletsLeft(maze) === 0) return { ...state, maze, player, ghosts, want, score: score + 200, lives, phase: 'won', moveIn, ghostIn, frightened }
  return { ...state, maze, player, ghosts, want, score, lives, phase: 'play', moveIn, ghostIn, frightened }
}

export const update = updateFloor
