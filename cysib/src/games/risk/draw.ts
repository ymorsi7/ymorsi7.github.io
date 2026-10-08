import { cellRect, drawSheet, makeSheet, type SheetCell } from '../sheet'
import { COLS, ROWS, type RiskState } from './logic'

const NUMBER_COLOR = ['#616161', '#2b579a', '#217346', '#c50f1f', '#5b2c6f', '#a04000', '#0e6b6b', '#242424', '#5c5c5c']

export function riskModel(width: number, height: number) {
  return makeSheet(width, height, 14, 16)
}

export function tileAt(width: number, height: number, x: number, y: number): { r: number; c: number } | null {
  const model = riskModel(width, height)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const rect = cellRect(model, c + 1, r + 1)
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return { r, c }
    }
  }
  return null
}

export function drawRisk(ctx: CanvasRenderingContext2D, state: RiskState, width: number, height: number, cover: boolean) {
  const model = riskModel(width, height)
  const cells: SheetCell[] = [
    { c: 0, r: 0, text: 'Item', bold: true },
    { c: 12, r: 0, text: 'Owner' },
    { c: 13, r: 0, text: 'Ops', align: 'center' },
  ]
  for (let r = 0; r < ROWS; r++) {
    cells.push({ c: 0, r: r + 1, text: `R${r + 1}`, align: 'right' })
    for (let c = 0; c < COLS; c++) {
      const tile = state.grid[r][c]
      if (cover) {
        if (tile.open && !tile.mine) {
          cells.push({
            c: c + 1,
            r: r + 1,
            text: tile.n ? String(tile.n) : '',
            align: 'center',
            color: NUMBER_COLOR[tile.n] ?? '#242424',
          })
        }
        continue
      }
      if (tile.flag) {
        cells.push({ c: c + 1, r: r + 1, text: 'Hold', align: 'center', color: '#a4262c', fill: '#fdf6f6' })
      } else if (!tile.open) {
        cells.push({ c: c + 1, r: r + 1, text: '', fill: '#f3f2f1' })
      } else if (tile.mine) {
        cells.push({ c: c + 1, r: r + 1, text: 'Block', align: 'center', color: '#ffffff', fill: '#a4262c' })
      } else {
        cells.push({
          c: c + 1,
          r: r + 1,
          text: tile.n ? String(tile.n) : '',
          align: 'center',
          color: NUMBER_COLOR[tile.n] ?? '#242424',
        })
      }
    }
  }
  drawSheet(ctx, model, {
    activeTab: 'Register',
    tabs: ['Register', 'Notes'],
    cells,
    select: cover ? { c: 1, r: 1 } : { c: state.cursorC + 1, r: state.cursorR + 1 },
  })
}
