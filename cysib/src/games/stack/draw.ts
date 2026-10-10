import { cellRect, decoyValue, drawSheet, makeSheet, type SheetCell } from '../sheet'
import { COLORS, COLS, LABELS, ROWS, SHAPES, rotateShape, type StackState } from './logic'

export function stackModel(width: number, height: number) {
  return makeSheet(width, height, 15, 22)
}

export function drawStack(ctx: CanvasRenderingContext2D, state: StackState, width: number, height: number, cover: boolean) {
  const model = stackModel(width, height)
  const cells: SheetCell[] = [
    { c: 0, r: 0, text: 'Role', bold: true },
    { c: 11, r: 0, text: 'Next', bold: true },
    { c: 12, r: 0, text: 'Queue', align: 'center' },
    { c: 11, r: 8, text: 'Lines' },
    { c: 12, r: 8, text: cover ? '' : String(state.lines), align: 'center' },
    { c: 11, r: 9, text: 'Band' },
    { c: 12, r: 9, text: cover ? '' : String(state.level), align: 'center' },
  ]

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const kind = state.board[r][c]
      if (cover) {
        if ((c + r) % 5 === 0) cells.push({ c: c + 1, r: r + 1, text: decoyValue(c, r), align: 'right' })
        continue
      }
      if (kind < 0) continue
      cells.push({
        c: c + 1,
        r: r + 1,
        text: LABELS[kind] ?? 'HC',
        align: 'center',
        fill: COLORS[kind] ?? COLORS[0],
        color: '#ffffff',
      })
    }
  }

  if (!cover) {
    for (let r = 0; r < state.piece.shape.length; r++) {
      for (let c = 0; c < state.piece.shape[r].length; c++) {
        if (!state.piece.shape[r][c]) continue
        const br = state.piece.y + r
        const bc = state.piece.x + c
        if (br < 0 || br >= ROWS || bc < 0 || bc >= COLS) continue
        cells.push({
          c: bc + 1,
          r: br + 1,
          text: LABELS[state.piece.kind] ?? 'HC',
          align: 'center',
          fill: COLORS[state.piece.kind] ?? COLORS[0],
          color: '#ffffff',
        })
      }
    }
    const preview = state.nextKind === 0 ? rotateShape(SHAPES[0]) : SHAPES[state.nextKind]
    preview.forEach((row, r) => {
      row.forEach((filled, c) => {
        if (!filled) return
        cells.push({
          c: 12 + c,
          r: 1 + r,
          text: LABELS[state.nextKind] ?? 'HC',
          align: 'center',
          fill: COLORS[state.nextKind] ?? COLORS[0],
          color: '#ffffff',
        })
      })
    })
  }

  drawSheet(ctx, model, {
    activeTab: 'Headcount',
    tabs: ['Headcount', 'Notes'],
    cells,
    select: cover ? { c: 1, r: 1 } : { c: Math.min(14, Math.max(1, state.piece.x + 1)), r: Math.min(21, Math.max(1, state.piece.y + 1)) },
  })

  if (cover) return
  const well = cellRect(model, 1, 1)
  const last = cellRect(model, COLS, ROWS)
  ctx.strokeStyle = '#c8c6c4'
  ctx.strokeRect(well.x + 0.5, well.y + 0.5, last.x + last.w - well.x - 1, last.y + last.h - well.y - 1)
}
