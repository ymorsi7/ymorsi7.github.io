export type Rect = { x: number; y: number; w: number; h: number }

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type SheetModel = {
  gutter: number
  header: number
  tab: number
  cols: number
  rows: number
  colW: number[]
  rowH: number
  width: number
  height: number
}

export type SheetCell = {
  c: number
  r: number
  text: string
  align?: CanvasTextAlign
  bold?: boolean
  fill?: string
  color?: string
}

export function makeSheet(w: number, h: number, cols: number, rows: number, weights?: number[]): SheetModel {
  const gutter = 40
  const header = 20
  const tab = 22
  const gridW = Math.max(1, w - gutter)
  const gridH = Math.max(1, h - header - tab)
  let widths: number[]
  if (weights && weights.length === cols) {
    const sum = weights.reduce((a, b) => a + b, 0) || 1
    widths = weights.map((weight) => (weight / sum) * gridW)
  } else {
    widths = Array.from({ length: cols }, () => gridW / cols)
  }
  return {
    gutter,
    header,
    tab,
    cols,
    rows,
    colW: widths,
    rowH: gridH / rows,
    width: w,
    height: h,
  }
}

export function cellRect(model: SheetModel, c: number, r: number): Rect {
  let x = model.gutter
  for (let i = 0; i < c; i++) x += model.colW[i] ?? 0
  return {
    x,
    y: model.header + r * model.rowH,
    w: model.colW[c] ?? 0,
    h: model.rowH,
  }
}

export function fitText(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (max <= 4) return ''
  if (ctx.measureText(text).width <= max) return text
  let trimmed = text
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > max) trimmed = trimmed.slice(0, -1)
  return `${trimmed}…`
}

export function drawSheet(
  ctx: CanvasRenderingContext2D,
  model: SheetModel,
  opts: {
    activeTab: string
    tabs?: string[]
    cells?: SheetCell[]
    select?: { c: number; r: number } | null
    colLabels?: string[]
  },
) {
  const { width, height } = model
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#faf9f8'
  ctx.fillRect(0, 0, width, model.header)
  ctx.fillRect(0, 0, model.gutter, height - model.tab)

  ctx.save()
  ctx.beginPath()
  ctx.rect(model.gutter, model.header, width - model.gutter, height - model.header - model.tab)
  ctx.clip()

  ctx.strokeStyle = '#edebe9'
  ctx.lineWidth = 1
  ctx.beginPath()
  let x = model.gutter
  for (let c = 0; c <= model.cols; c++) {
    const line = Math.round(x) + 0.5
    ctx.moveTo(line, model.header)
    ctx.lineTo(line, height - model.tab)
    x += model.colW[c] ?? 0
  }
  for (let r = 0; r <= model.rows; r++) {
    const y = Math.round(model.header + r * model.rowH) + 0.5
    ctx.moveTo(model.gutter, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()

  ctx.fillStyle = '#1f1f1f'
  ctx.font = '12px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.textBaseline = 'middle'
  for (const cell of opts.cells ?? []) {
    if (cell.c < 0 || cell.r < 0 || cell.c >= model.cols || cell.r >= model.rows) continue
    const rect = cellRect(model, cell.c, cell.r)
    if (cell.fill) {
      ctx.fillStyle = cell.fill
      ctx.fillRect(rect.x + 1, rect.y + 1, Math.max(0, rect.w - 1), Math.max(0, rect.h - 1))
    }
    ctx.fillStyle = cell.color ?? '#1f1f1f'
    ctx.font = `${cell.bold ? 'bold ' : ''}12px "Segoe UI", "Source Sans 3", sans-serif`
    const align = cell.align ?? 'left'
    ctx.textAlign = align
    const tx = align === 'center' ? rect.x + rect.w / 2 : align === 'right' ? rect.x + rect.w - 4 : rect.x + 4
    ctx.fillText(fitText(ctx, cell.text, rect.w - 8), tx, rect.y + rect.h / 2)
  }
  ctx.restore()

  ctx.fillStyle = '#faf9f8'
  ctx.fillRect(0, 0, width, model.header)
  ctx.fillRect(0, 0, model.gutter, height - model.tab)
  ctx.strokeStyle = '#edebe9'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, width - 1, model.header - 0.5)
  ctx.beginPath()
  ctx.moveTo(model.gutter + 0.5, 0)
  ctx.lineTo(model.gutter + 0.5, height - model.tab)
  ctx.stroke()

  ctx.fillStyle = '#1f1f1f'
  ctx.fillStyle = '#616161'
  ctx.font = '11px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  x = model.gutter
  for (let c = 0; c < model.cols; c++) {
    const label = opts.colLabels?.[c] ?? LETTERS[c] ?? ''
    ctx.fillText(label, x + (model.colW[c] ?? 0) / 2, model.header / 2)
    x += model.colW[c] ?? 0
  }
  ctx.textAlign = 'right'
  ctx.font = '11px "Segoe UI", "Source Sans 3", sans-serif'
  const rowCount = Math.min(model.rows, 200)
  for (let r = 0; r < rowCount; r++) {
    ctx.fillText(String(r + 1), model.gutter - 5, model.header + r * model.rowH + model.rowH / 2)
  }

  if (opts.select) {
    const rect = cellRect(model, opts.select.c, opts.select.r)
    ctx.strokeStyle = '#107c41'
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x + 1.5, rect.y + 1.5, rect.w - 3, rect.h - 3)
    ctx.lineWidth = 1
  }

  const tabY = height - model.tab
  ctx.fillStyle = '#f3f2f1'
  ctx.fillRect(0, tabY, width, model.tab)
  ctx.strokeStyle = '#edebe9'
  ctx.beginPath()
  ctx.moveTo(0, tabY + 0.5)
  ctx.lineTo(width, tabY + 0.5)
  ctx.stroke()

  let tabX = 6
  for (const tab of opts.tabs ?? [opts.activeTab]) {
    ctx.font = '12px "Segoe UI", "Source Sans 3", sans-serif'
    const tw = Math.max(78, ctx.measureText(tab).width + 28)
    const active = tab === opts.activeTab
    ctx.fillStyle = active ? '#ffffff' : '#f3f2f1'
    ctx.beginPath()
    ctx.roundRect(tabX, tabY + 4, tw, model.tab - 4, [6, 6, 0, 0])
    ctx.fill()
    if (active) {
      ctx.fillStyle = '#107c41'
      ctx.fillRect(tabX + 8, tabY + 4, tw - 16, 2)
    }
    ctx.fillStyle = '#242424'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(tab, tabX + 10, tabY + model.tab / 2 + 1)
    tabX += tw + 3
  }
}

export function drawChartFrame(ctx: CanvasRenderingContext2D, rect: Rect, title: string) {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.strokeStyle = '#e1dfdd'
  ctx.lineWidth = 1
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
  ctx.fillStyle = '#242424'
  ctx.font = '600 13px "Segoe UI", "Source Sans 3", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(fitText(ctx, title, rect.w - 16), rect.x + rect.w / 2, rect.y + 14)
  ctx.restore()
}

export function decoyValue(c: number, r: number): string {
  const n = ((c * 17 + r * 29) % 97) + 4
  return n.toLocaleString('en-US')
}
