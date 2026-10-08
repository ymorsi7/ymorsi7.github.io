import { describe, expect, it } from 'vitest'
import { createInput } from '../../engine/input'
import {
  circleHitsRect,
  speedFor,
  strike,
  updateBreakdown,
  velocityFromPaddle,
  type BreakdownState,
} from './logic'

function brick(partial: Partial<BreakdownState['bricks'][number]>): BreakdownState['bricks'][number] {
  return {
    id: 1,
    text: 'Synergy',
    x: 80,
    y: 40,
    w: 50,
    h: 16,
    hits: 0,
    maxHits: 1,
    style: 'normal',
    alive: true,
    ...partial,
  }
}

function state(partial: Partial<BreakdownState> = {}): BreakdownState {
  return {
    width: 400,
    height: 400,
    level: 0,
    page: { x: 20, y: 10, w: 300, h: 260 },
    bricks: [brick({})],
    ball: { x: 100, y: 70, vx: 0, vy: -220, r: 4 },
    paddleX: 80,
    paddleW: 90,
    paddleY: 280,
    paddleH: 16,
    lives: 3,
    score: 0,
    wordsCleared: 0,
    phase: 'play',
    serveTimer: 0,
    clearTimer: 0,
    lastHitId: -1,
    header: { to: 'Leads', from: 'Desk', date: 'Today', subject: 'Note' },
    speed: 250,
    ...partial,
  }
}

describe('breakdown collisions', () => {
  it('detects a circle overlapping a word', () => {
    expect(circleHitsRect(90, 48, 4, 80, 40, 50, 16)).toBe(true)
    expect(circleHitsRect(10, 10, 3, 80, 40, 50, 16)).toBe(false)
  })

  it('sends the ball upward, and left when it hits the left of the thumb', () => {
    const center = velocityFromPaddle(100, 50, 100, 200)
    expect(center.vy).toBeLessThan(0)
    expect(Math.abs(center.vx)).toBeLessThan(1)
    const left = velocityFromPaddle(55, 50, 100, 200)
    expect(left.vx).toBeLessThan(0)
    expect(left.vy).toBeLessThan(0)
  })

  it('removes a normal word and only dents a heading', () => {
    const input = createInput()
    const hit = updateBreakdown(
      state({ ball: { x: 100, y: 62, vx: 0, vy: -240, r: 4 } }),
      input,
      1 / 60,
    )
    expect(hit.bricks[0].alive).toBe(false)
    expect(hit.score).toBe(1)

    const tough = brick({ maxHits: 3, style: 'heading', y: 50 })
    const dented = updateBreakdown(
      state({ bricks: [tough], ball: { x: 100, y: 72, vx: 0, vy: -280, r: 4 } }),
      input,
      1 / 60,
    )
    expect(dented.bricks[0].alive).toBe(true)
    expect(dented.bricks[0].hits).toBe(1)
    expect(strike(strike(tough)).hits).toBe(2)
    expect(strike(strike(strike(tough))).alive).toBe(false)
  })

  it('raises speed 5% for every 10 words', () => {
    expect(speedFor(0, 0)).toBe(250)
    expect(speedFor(10, 0)).toBeCloseTo(250 * 1.05)
    expect(speedFor(20, 0)).toBeCloseTo(250 * 1.05 ** 2)
  })

  it('drops a life when the dot misses the thumb', () => {
    const missed = updateBreakdown(
      state({
        ball: { x: 30, y: 290, vx: 0, vy: 240, r: 4 },
        bricks: [brick({ y: 20 })],
      }),
      createInput(),
      1 / 20,
    )
    expect(missed.lives).toBe(2)
    expect(missed.phase).toBe('serve')
  })
})
