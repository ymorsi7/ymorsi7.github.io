import type { Rect } from '../sheet'
import { cellRect, drawChartFrame, drawSheet, makeSheet, type SheetCell } from '../sheet'
import { COLOR_NAMES, COLORS, type CutterState } from './logic'

export function cutterChart(width: number, height: number): { plot: Rect } {
  const model = makeSheet(width, height, 14, 26)
  const top = cellRect(model, 1, 3)
  const bottom = cellRect(model, 12, 20)
  const plot = {
    x: top.x + 46,
    y: top.y + 28,
    w: Math.max(80, bottom.x + bottom.w - top.x - 62),
    h: Math.max(80, bottom.y + bottom.h - top.y - 78),
  }
  return { plot }
}

export function segmentRect(plot: Rect, index: number, row: number, maxColumns: number): Rect {
  const slot = plot.w / maxColumns
  const barW = Math.max(12, Math.min(48, slot - 8))
  const segH = plot.h / 10
  return {
    x: plot.x + index * slot + (slot - barW) / 2,
    y: plot.y + plot.h - (row + 1) * segH,
    w: barW,
    h: Math.max(2, segH - 1),
  }
}

export function hitSegment(
  width: number,
  height: number,
  state: CutterState,
  x: number,
  y: number,
): { c: number; r: number } | null {
  const { plot } = cutterChart(width, height)
  for (let c = 0; c < state.columns.length; c++) {
    for (let r = 0; r < state.columns[c].length; r++) {
      const rect = segmentRect(plot, c, r, state.maxColumns)
      if (x >= rect.x - 3 && x <= rect.x + rect.w + 3 && y >= rect.y - 1 && y <= rect.y + rect.h + 1) return { c, r }
    }
  }
  return null
}

export function drawCutter(ctx: CanvasRenderingContext2D, state: CutterState, width: number, height: number, cover: boolean) {
  const model = makeSheet(width, height, 14, 26)
  const cells: SheetCell[] = [
    { c: 0, r: 0, text: 'Spend review', bold: true },
    { c: 0, r: 1, text: 'Quarter' },
    { c: 1, r: 1, text: 'Q3', align: 'center' },
    { c: 0, r: 2, text: 'Owner' },
    { c: 1, r: 2, text: 'Finance', align: 'center' },
  ]
  for (let r = 0; r < 24; r++) {
    for (let c = 0; c < 14; c++) {
      if (r >= 3 && r <= 21 && c >= 1 && c <= 12) continue
      if (cells.some((cell) => cell.c === c && cell.r === r)) continue
      if ((c + r) % 4 === 0) cells.push({ c, r, text: String(((c * 13 + r * 7) % 80) + 5), align: 'right' })
    }
  }
  drawSheet(ctx, model, { activeTab: 'Spend', tabs: ['Spend', 'Notes'], cells, select: cover ? { c: 1, r: 1 } : null })

  const top = cellRect(model, 1, 3)
  const bottom = cellRect(model, 12, 20)
  const frame = {
    x: top.x + 2,
    y: top.y + 2,
    w: bottom.x + bottom.w - top.x - 6,
    h: bottom.y + bottom.h - top.y - 6,
  }
  const { plot } = cutterChart(width, height)
  drawChartFrame(ctx, frame, 'Spend by week')

  ctx.strokeStyle = '#d4d4d4'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i <= 5; i++) {
    const y = plot.y + (plot.h / 5) * i + 0.5
    ctx.moveTo(plot.x, y)
    ctx.lineTo(plot.x + plot.w, y)
  }
  ctx.stroke()
  ctx.fillStyle = '#666'
  ctx.font = '11px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 5; i++) {
    ctx.fillText(String(10 - i * 2), plot.x - 6, plot.y + (plot.h / 5) * i)
  }

  state.columns.forEach((column, index) => {
    column.forEach((color, row) => {
      const rect = segmentRect(plot, index, row, state.maxColumns)
      ctx.fillStyle = COLORS[color] ?? COLORS[0]
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      ctx.strokeStyle = '#ffffff'
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
    })
    const slot = plot.w / state.maxColumns
    ctx.fillStyle = '#1f1f1f'
    ctx.font = '11px Arial, Helvetica, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(`Wk ${index + 1}`, plot.x + index * slot + slot / 2, plot.y + plot.h + 6)
  })

  if (!cover && state.columns.length) {
    const rect = segmentRect(plot, state.cursorC, state.cursorR, state.maxColumns)
    ctx.strokeStyle = '#1f1f1f'
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2)
  }

  const legendY = frame.y + frame.h - 16
  ctx.font = '11px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  let lx = frame.x + 12
  COLOR_NAMES.forEach((name, index) => {
    ctx.fillStyle = COLORS[index]
    ctx.fillRect(lx, legendY - 5, 10, 10)
    ctx.fillStyle = '#1f1f1f'
    ctx.fillText(name, lx + 14, legendY)
    lx += ctx.measureText(name).width + 28
  })
}
