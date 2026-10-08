import { describe, expect, it } from 'vitest'
import { MAZE, eat, pelletsLeft, tryStep } from './logic'

describe('floor plan movement', () => {
  it('stops at a partition', () => {
    const stayed = tryStep(MAZE, 1, 1, 'up')
    expect(stayed.moved).toBe(false)
    expect(stayed).toMatchObject({ x: 1, y: 1 })
    const walked = tryStep(MAZE, 1, 1, 'right')
    expect(walked.moved).toBe(true)
    expect(walked).toMatchObject({ x: 2, y: 1 })
  })

  it('clears a desk mark and counts what is left', () => {
    const before = pelletsLeft(MAZE)
    const next = eat(MAZE, 1, 1)
    expect(next.ate).toBe(true)
    expect(pelletsLeft(next.maze)).toBe(before - 1)
    expect(eat(next.maze, 1, 1).ate).toBe(false)
  })
})
