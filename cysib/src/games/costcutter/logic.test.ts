import { describe, expect, it } from 'vitest'
import { flood, groupScore, removeAndCollapse, tryClear, type Columns } from './logic'

const columns: Columns = [
  [0, 0, 1],
  [0, 2, 1],
  [3],
]

describe('cost cutter flood fill', () => {
  it('fills 4-neighbour cells and skips diagonals', () => {
    const group = flood(columns, 0, 0).map((cell) => `${cell.c},${cell.r}`).sort()
    expect(group).toEqual(['0,0', '0,1', '1,0'])
  })

  it('ignores a lone segment', () => {
    expect(tryClear(columns, 2, 0).score).toBe(0)
    expect(tryClear(columns, 2, 0).columns).toEqual(columns)
  })

  it('scores n squared times 10 and lets cells above fall', () => {
    const cleared = tryClear(columns, 0, 0)
    expect(cleared.score).toBe(groupScore(3))
    expect(cleared.columns[0]).toEqual([1])
    expect(cleared.columns[1]).toEqual([2, 1])
  })

  it('drops an empty bar and keeps the row packed from the left', () => {
    const packed = removeAndCollapse([[0, 0], [1], [2, 2]], [
      { c: 1, r: 0 },
    ])
    expect(packed).toEqual([[0, 0], [2, 2]])
  })
})
