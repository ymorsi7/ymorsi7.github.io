import { describe, expect, it } from 'vitest'
import { createInput } from '../../engine/input'
import {
  GHOST_START,
  MAZE,
  PLAYER_START,
  blocked,
  createFloor,
  eat,
  pelletsLeft,
  tryStep,
  updateFloor,
} from './logic'

function reachableFrom(x: number, y: number) {
  const seen = new Set<string>([`${x}:${y}`])
  const queue = [{ x, y }]
  while (queue.length) {
    const cur = queue.pop()!
    for (const dir of ['left', 'right', 'up', 'down'] as const) {
      const step = tryStep(MAZE, cur.x, cur.y, dir)
      if (!step.moved) continue
      const key = `${step.x}:${step.y}`
      if (seen.has(key)) continue
      seen.add(key)
      queue.push({ x: step.x, y: step.y })
    }
  }
  return seen
}

describe('floor plan movement', () => {
  it('keeps every aisle the same width', () => {
    expect(MAZE.every((row) => row.length === MAZE[0].length)).toBe(true)
    expect(blocked(MAZE, PLAYER_START.x, PLAYER_START.y)).toBe(false)
    for (const ghost of GHOST_START) expect(blocked(MAZE, ghost.x, ghost.y, true)).toBe(false)
  })

  it('stops at a partition', () => {
    const stayed = tryStep(MAZE, 1, 1, 'up')
    expect(stayed.moved).toBe(false)
    expect(stayed).toMatchObject({ x: 1, y: 1 })
    const walked = tryStep(MAZE, 1, 1, 'right')
    expect(walked.moved).toBe(true)
    expect(walked).toMatchObject({ x: 2, y: 1 })
  })

  it('lets the walker leave spawn and reach every desk mark', () => {
    const seen = reachableFrom(PLAYER_START.x, PLAYER_START.y)
    const marks: Array<[number, number]> = []
    MAZE.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) if (row[x] === '.' || row[x] === 'o') marks.push([x, y])
    })
    expect(marks.length).toBeGreaterThan(40)
    expect(marks.every(([x, y]) => seen.has(`${x}:${y}`))).toBe(true)
  })

  it('wraps the hall and keeps the meeting-room door closed to staff', () => {
    const wrap = tryStep(MAZE, 0, 7, 'left')
    expect(wrap.moved).toBe(true)
    expect(wrap.x).toBe(MAZE[0].length - 1)
    expect(tryStep(MAZE, 9, 9, 'up').moved).toBe(false)
    expect(tryStep(MAZE, 9, 9, 'up', true).moved).toBe(true)
  })

  it('clears a desk mark and counts what is left', () => {
    const before = pelletsLeft(MAZE)
    const next = eat(MAZE, 1, 1)
    expect(next.ate).toBe(true)
    expect(pelletsLeft(next.maze)).toBe(before - 1)
    expect(eat(next.maze, 1, 1).ate).toBe(false)
  })

  it('moves with held arrows from the open corridor', () => {
    const start = createFloor()
    expect(start.player).toMatchObject(PLAYER_START)
    const moved = updateFloor(start, { ...createInput(), keys: new Set(['ArrowLeft']) }, 0.2)
    expect(moved.player.x).toBe(PLAYER_START.x - 1)
    expect(moved.player.y).toBe(PLAYER_START.y)
  })
})
