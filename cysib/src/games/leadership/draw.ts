import type { Rect } from '../sheet'
import { cellRect, decoyValue, drawChartFrame, drawSheet, makeSheet, type SheetCell } from '../sheet'
import { sampleSeries, type LeadershipState } from './logic'

const SHEET_WEIGHTS = [2.3, 1.15, 0.85, 0.9, 0.7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

function forecastSheet(width: number, height: number) {
  return makeSheet(width, height, 16, 28, SHEET_WEIGHTS)
}

export function plotBox(width: number, height: number): Rect {
  const model = forecastSheet(width, height)
  const top = cellRect(model, 1, 4)
  const bottom = cellRect(model, 14, 22)
  return {
    x: top.x + 48,
    y: top.y + 28,
    w: Math.max(40, bottom.x + bottom.w - top.x - 64),
    h: Math.max(40, bottom.y + bottom.h - top.y - 88),
  }
}

export function drawLeadership(
  ctx: CanvasRenderingContext2D,
  state: LeadershipState,
  width: number,
  height: number,
  cover: boolean,
  company: string,
) {
  const model = forecastSheet(width, height)
  const budget = Math.max(0, Math.round(state.ship.fuel * 1250))
  const cells: SheetCell[] = [
    { c: 0, r: 0, text: 'Q3 forecast', bold: true },
    { c: 0, r: 1, text: 'Owner' },
    { c: 1, r: 1, text: company === 'Unnamed' ? '' : company },
    { c: 0, r: 2, text: 'Budget remaining' },
    { c: 1, r: 2, text: budget.toLocaleString('en-US'), align: 'right', bold: true },
    { c: 3, r: 2, text: 'Scenario' },
    { c: 4, r: 2, text: String(state.level), align: 'center' },
  ]
  for (let r = 0; r < model.rows; r++) {
    for (let c = 0; c < model.cols; c++) {
      if (r >= 4 && r <= 23 && c >= 1 && c <= 14) continue
      if (cells.some((cell) => cell.c === c && cell.r === r)) continue
      if ((c * 3 + r) % 5 === 0) cells.push({ c, r, text: decoyValue(c, r), align: 'right' })
    }
  }
  drawSheet(ctx, model, {
    activeTab: 'Forecast',
    tabs: ['Forecast', 'Assumptions'],
    cells,
    select: { c: 1, r: 2 },
  })

  const top = cellRect(model, 1, 4)
  const bottom = cellRect(model, 14, 22)
  const frame = {
    x: top.x + 4,
    y: top.y + 4,
    w: bottom.x + bottom.w - top.x - 8,
    h: bottom.y + bottom.h - top.y - 8,
  }
  drawChartFrame(ctx, frame, 'Q3 forecast')
  const plot = plotBox(width, height)
  ctx.strokeStyle = '#d4d4d4'
  ctx.beginPath()
  for (let i = 0; i <= 4; i++) {
    const y = plot.y + (plot.h / 4) * i + 0.5
    ctx.moveTo(plot.x, y)
    ctx.lineTo(plot.x + plot.w, y)
  }
  ctx.stroke()
  ctx.fillStyle = '#666666'
  ctx.font = '11px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 4; i++) ctx.fillText(String(80 - i * 20), plot.x - 6, plot.y + (plot.h / 4) * i)

  const toX = (t: number) => plot.x + t * plot.w
  const toY = (v: number) => plot.y + v * plot.h
  const strokeSeries = (series: number[], color: string) => {
    ctx.beginPath()
    series.forEach((value, index) => {
      const x = toX(index / (series.length - 1))
      const y = toY(value)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.75
    ctx.stroke()
  }
  strokeSeries(state.tunnel.ceil, '#4f81bd')
  strokeSeries(state.tunnel.floor, '#c0504d')

  const padX = toX((state.tunnel.pad0 + state.tunnel.pad1) / 2)
  const padY = toY(sampleSeries(state.tunnel.floor, (state.tunnel.pad0 + state.tunnel.pad1) / 2))
  ctx.fillStyle = '#1f1f1f'
  ctx.font = '11px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('Close', padX, padY - 4)

  ctx.font = '11px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const legendY = frame.y + frame.h - 14
  ctx.fillStyle = '#4f81bd'
  ctx.fillRect(frame.x + 16, legendY - 4, 14, 3)
  ctx.fillStyle = '#1f1f1f'
  ctx.fillText('High case', frame.x + 34, legendY)
  ctx.fillStyle = '#c0504d'
  ctx.fillRect(frame.x + 110, legendY - 4, 14, 3)
  ctx.fillStyle = '#1f1f1f'
  ctx.fillText('Low case', frame.x + 128, legendY)

  const weeks = ['W1', 'W4', 'W7', 'W10', 'W13']
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  weeks.forEach((label, index) => {
    ctx.fillText(label, plot.x + (plot.w * index) / (weeks.length - 1), plot.y + plot.h + 4)
  })

  if (!cover && state.phase !== 'over') {
    const x = toX(state.ship.x)
    const y = toY(state.ship.y)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.max(-0.6, Math.min(0.6, state.ship.vx * 2)))
    ctx.fillStyle = '#1f1f1f'
    ctx.beginPath()
    ctx.moveTo(0, -6)
    ctx.lineTo(5, 5)
    ctx.lineTo(-5, 5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  if (!cover && state.phase === 'landed') {
    ctx.fillStyle = '#1f1f1f'
    ctx.font = '12px Arial, Helvetica, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Saved', toX(state.ship.x) + 8, toY(state.ship.y) - 8)
  }
}
