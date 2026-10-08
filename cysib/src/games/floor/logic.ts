import type { InputState } from '../../engine/input'

export const MAZE = [
  '###############',
  '#.............#',
  '#.##.#####.##.#',
  '#.............#',
  '#.#.## # ##.#.#',
  '#.#.#     #.#.#',
  '#...#.###.#...#',
  '#.#.#     #.#.#',
  '#.#.#######.#.#',
  '#.............#',
  '###############',
]

export type Dir = 'left' | 'right' | 'up' | 'down'
export type Actor = { x: number; y: number; dir: Dir }

const DELTA: Record<Dir, [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
}

export function tile(maze: string[], x: number, y: number) {
  return maze[y]?.[x] ?? '#'
}

export function blocked(maze: string[], x: number, y: number) {
  return tile(maze, x, y) === '#'
}

export function tryStep(maze: string[], x: number, y: number, dir: Dir) {
  const [dx, dy] = DELTA[dir]
  const nx = x + dx
  const ny = y + dy
  if (blocked(maze, nx, ny)) return { x, y, moved: false }
  return { x: nx, y: ny, moved: true }
}

export function eat(maze: string[], x: number, y: number) {
  if (tile(maze, x, y) !== '.') return { maze, ate: false }
  const rows = maze.map((row, index) => (index === y ? `${row.slice(0, x)} ${row.slice(x + 1)}` : row))
  return { maze: rows, ate: true }
}

export function pelletsLeft(maze: string[]) {
  return maze.join('').split('').filter((cell) => cell === '.').length
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
}

export function createFloor(): FloorState {
  return {
    maze: MAZE.slice(),
    player: { x: 7, y: 7, dir: 'left' },
    ghosts: [
      { x: 7, y: 5, dir: 'right' },
      { x: 6, y: 5, dir: 'left' },
      { x: 8, y: 5, dir: 'up' },
    ],
    want: 'left',
    score: 0,
    lives: 3,
    phase: 'play',
    moveIn: 0.16,
    ghostIn: 0.22,
  }
}

function wanted(input: InputState, current: Dir): Dir {
  if (input.keys.has('ArrowLeft')) return 'left'
  if (input.keys.has('ArrowRight')) return 'right'
  if (input.keys.has('ArrowUp')) return 'up'
  if (input.keys.has('ArrowDown')) return 'down'
  return current
}

function chase(maze: string[], ghost: Actor, player: Actor): Dir {
  const options: Dir[] = ['left', 'right', 'up', 'down']
  const opposite: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' }
  let best = ghost.dir
  let bestDist = Infinity
  for (const dir of options) {
    if (dir === opposite[ghost.dir]) continue
    const step = tryStep(maze, ghost.x, ghost.y, dir)
    if (!step.moved && !(step.x === ghost.x && step.y === ghost.y && blocked(maze, ghost.x + DELTA[dir][0], ghost.y + DELTA[dir][1]))) {
      if (!step.moved) continue
    }
    if (!step.moved) continue
    const dist = Math.abs(step.x - player.x) + Math.abs(step.y - player.y)
    if (dist < bestDist) {
      bestDist = dist
      best = dir
    }
  }
  return best
}

export function updateFloor(state: FloorState, input: InputState, dt: number): FloorState {
  if (state.phase !== 'play') return state
  const want = wanted(input, state.want)
  let moveIn = state.moveIn - dt
  let ghostIn = state.ghostIn - dt
  let player = state.player
  let maze = state.maze
  let score = state.score
  let lives = state.lives
  let ghosts = state.ghosts
  if (moveIn <= 0) {
    const turned = tryStep(maze, player.x, player.y, want)
    const step = turned.moved ? turned : tryStep(maze, player.x, player.y, player.dir)
    player = { x: step.x, y: step.y, dir: turned.moved ? want : player.dir }
    const eaten = eat(maze, player.x, player.y)
    maze = eaten.maze
    if (eaten.ate) score += 10
    moveIn = 0.16
  }
  if (ghostIn <= 0) {
    ghosts = ghosts.map((ghost) => {
      const dir = chase(maze, ghost, player)
      const step = tryStep(maze, ghost.x, ghost.y, dir)
      return { x: step.x, y: step.y, dir }
    })
    ghostIn = 0.22
  }
  const caught = ghosts.some((ghost) => ghost.x === player.x && ghost.y === player.y)
  if (caught) {
    lives -= 1
    player = { x: 7, y: 7, dir: 'left' }
    ghosts = createFloor().ghosts
    if (lives <= 0) return { ...state, maze, player, ghosts, want, score, lives, phase: 'over', moveIn, ghostIn }
  }
  if (pelletsLeft(maze) === 0) return { ...state, maze, player, ghosts, want, score: score + 200, lives, phase: 'won', moveIn, ghostIn }
  return { ...state, maze, player, ghosts, want, score, lives, phase: 'play', moveIn, ghostIn }
}

export const update = updateFloor
