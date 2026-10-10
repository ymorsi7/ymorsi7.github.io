import { describe, expect, it } from 'vitest'
import { createInput } from '../../engine/input'
import { clearLines, createStack, emptyBoard, fits, rotateShape, stamp, updateStack } from './logic'

describe('staffing stack', () => {
  it('rotates an I bar to a column', () => {
    const rotated = rotateShape([[1, 1, 1, 1]])
    expect(rotated).toEqual([[1], [1], [1], [1]])
  })

  it('clears a packed row and scores it', () => {
    const board = emptyBoard()
    board[19] = Array(10).fill(0)
    board[19][9] = -1
    const piece = { kind: 0, shape: [[1]], x: 9, y: 19 }
    expect(fits(board, piece.shape, piece.x, piece.y)).toBe(true)
    const locked = stamp(board, piece)
    const cleared = clearLines(locked)
    expect(cleared.cleared).toBe(1)
    expect(cleared.board[19].every((cell) => cell < 0)).toBe(true)
  })

  it('hard-drops on Enter and rejects a wall move', () => {
    const start = createStack(4)
    const leftWall = { ...start, piece: { ...start.piece, x: 0 } }
    const blocked = updateStack(leftWall, { ...createInput(), justKeys: new Set(['ArrowLeft']) }, 0.016)
    expect(blocked.piece.x).toBe(0)
    const dropped = updateStack(start, { ...createInput(), justKeys: new Set(['Enter']) }, 0.016)
    expect(dropped.piece.y).toBe(0)
    expect(dropped.board.some((row) => row.some((cell) => cell >= 0))).toBe(true)
  })
})
