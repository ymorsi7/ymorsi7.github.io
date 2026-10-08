import { describe, expect, it } from 'vitest'
import { createInput } from '../../engine/input'
import {
  findMatchCells,
  hasMove,
  matchGroups,
  swapCreatesMatch,
  updateCrash,
  type CrashState,
  type Grid,
} from './logic'

function gridFrom(rows: string[]): Grid {
  return rows.map((row) => row.split('').map((ch) => Number(ch)))
}

describe('crash planning matches', () => {
  it('finds a horizontal line and a vertical line', () => {
    const grid = gridFrom([
      '11123401',
      '23401234',
      '01201234',
      '23401234',
      '01011234',
      '23401234',
      '01234012',
      '23401012',
    ])
    const cells = findMatchCells(grid)
    expect(cells.some((cell) => cell.r === 0 && cell.c === 0)).toBe(true)
    expect(cells.some((cell) => cell.r === 0 && cell.c === 2)).toBe(true)
    expect(cells.some((cell) => cell.r === 1 && cell.c === 0)).toBe(false)
  })

  it('groups an L of one color as a single match', () => {
    const grid = gridFrom([
      '11123400',
      '10001234',
      '10001234',
      '23401234',
      '01234012',
      '23401012',
      '01234012',
      '23401012',
    ])
    const groups = matchGroups(grid)
    const ell = groups.find((group) => group.some((cell) => cell.r === 0 && cell.c === 0))
    expect(ell?.length).toBe(5)
  })

  it('accepts only a swap that makes three', () => {
    const grid = gridFrom([
      '12110201',
      '01201201',
      '10101010',
      '01010101',
      '10101010',
      '01010101',
      '33201210',
      '01010101',
    ])
    expect(findMatchCells(grid)).toEqual([])
    expect(swapCreatesMatch(grid, { r: 0, c: 0 }, { r: 0, c: 1 })).toBe(true)
    expect(swapCreatesMatch(grid, { r: 6, c: 0 }, { r: 6, c: 1 })).toBe(false)
    expect(swapCreatesMatch(grid, { r: 0, c: 0 }, { r: 2, c: 2 })).toBe(false)
  })

  it('notices a board with no moves', () => {
    const stuck = gridFrom([
      '02211002',
      '11002211',
      '02211002',
      '11002211',
      '02211002',
      '11002211',
      '02211002',
      '11002211',
    ])
    expect(hasMove(stuck)).toBe(false)
    expect(findMatchCells(stuck)).toEqual([])
  })

  it('clears a crafted swap through update', () => {
    const base = gridFrom([
      '12110201',
      '01201201',
      '10101010',
      '01010101',
      '10101010',
      '01010101',
      '33201210',
      '01010101',
    ])
    const state: CrashState = {
      grid: base,
      score: 0,
      timeLeft: 90,
      phase: 'idle',
      clearTimer: 0,
      cascade: 1,
      pending: [],
      lastMatchAt: 90,
      matchedOnce: false,
      selected: { r: 0, c: 0 },
      armed: { r: 0, c: 0 },
      drag: null,
      seed: 5,
      note: 'Ready',
    }
    const input = createInput()
    input.justKeys.add('Enter')
    const moved = {
      ...state,
      selected: { r: 0, c: 1 },
    }
    const next = updateCrash(moved, input, 1 / 60)
    expect(next.score).toBeGreaterThan(0)
    expect(next.phase).toBe('clear')
  })
})
