import { describe, expect, it } from 'vitest'
import { layMines, neighborCount, openTile, safeLeft, toggleFlag, type Grid } from './logic'

describe('risk register', () => {
  it('counts every neighboring mine, including diagonals', () => {
    const mines = [
      [true, false, false],
      [false, false, false],
      [false, false, true],
    ]
    const counts = neighborCount(mines)
    expect(counts[1][1]).toBe(2)
    expect(counts[0][1]).toBe(1)
    expect(counts[0][0]).toBe(0)
  })

  it('opens a clear patch and stops at numbered cells', () => {
    const grid: Grid = [
      [
        { mine: false, open: false, flag: false, n: 0 },
        { mine: false, open: false, flag: false, n: 0 },
        { mine: false, open: false, flag: false, n: 1 },
      ],
      [
        { mine: false, open: false, flag: false, n: 0 },
        { mine: false, open: false, flag: false, n: 0 },
        { mine: false, open: false, flag: false, n: 1 },
      ],
      [
        { mine: false, open: false, flag: false, n: 1 },
        { mine: false, open: false, flag: false, n: 1 },
        { mine: true, open: false, flag: false, n: 0 },
      ],
    ]
    const opened = openTile(grid, 0, 0)
    expect(opened.exploded).toBe(false)
    expect(opened.grid[0][0].open).toBe(true)
    expect(opened.grid[0][1].open).toBe(true)
    expect(opened.grid[1][2].open).toBe(true)
    expect(opened.grid[2][2].open).toBe(false)
  })

  it('does not open a flagged cell, and a mine ends the click', () => {
    const grid: Grid = [[{ mine: true, open: false, flag: true, n: 0 }]]
    expect(openTile(grid, 0, 0).exploded).toBe(false)
    const flagged = toggleFlag(grid, 0, 0)
    expect(flagged[0][0].flag).toBe(false)
    expect(openTile([[{ mine: true, open: false, flag: false, n: 0 }]], 0, 0).exploded).toBe(true)
  })

  it('keeps the first cell and its neighbors clear', () => {
    const { grid } = layMines(4, 4, 4)
    for (let r = 3; r <= 5; r++) {
      for (let c = 3; c <= 5; c++) expect(grid[r][c].mine).toBe(false)
    }
    expect(safeLeft(grid)).toBe(100 - 14)
  })
})
